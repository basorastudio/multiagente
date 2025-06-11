import {
  WASocket,
  proto,
  getContentType,
  downloadMediaMessage,
  isJidBroadcast,
  isJidGroup,
  jidNormalizedUser,
} from "@whiskeysockets/baileys";
import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { debounce } from "lodash";
import formatBody from "../../helpers/Mustache";
import Whatsapp from "../../models/Whatsapp";

interface Session extends WASocket {
  id?: number;
}

const debouncedMessages: { [key: string]: any } = {};

export const baileysMessageListener = (baileys: Session, tenantId: number | string): void => {
  baileys.ev.on("messages.upsert", async ({ messages, type }) => {
    try {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        if (isJidBroadcast(msg.key.remoteJid!)) continue;

        const messageId = msg.key.id!;
        
        // Debounce para evitar mensajes duplicados
        if (debouncedMessages[messageId]) {
          return;
        }
        
        debouncedMessages[messageId] = true;
        
        setTimeout(() => {
          delete debouncedMessages[messageId];
        }, 10000);

        await handleMessage(baileys, msg, tenantId);
      }
    } catch (err) {
      logger.error(`baileysMessageListener error: ${err}`);
    }
  });

  // Listener para actualizaciones de mensajes (ediciones, eliminaciones, etc.)
  baileys.ev.on("messages.update", async (messageUpdates) => {
    try {
      for (const update of messageUpdates) {
        logger.info(`Message update: ${JSON.stringify(update)}`);
        // Aquí podrías manejar actualizaciones de mensajes si es necesario
      }
    } catch (err) {
      logger.error(`messages.update error: ${err}`);
    }
  });

  // Listener para recibos de lectura
  baileys.ev.on("messages.receipt.update", async (receipts) => {
    try {
      for (const receipt of receipts) {
        logger.debug(`Receipt update: ${JSON.stringify(receipt)}`);
        // Aquí podrías actualizar el estado de los mensajes como leídos
      }
    } catch (err) {
      logger.error(`messages.receipt.update error: ${err}`);
    }
  });
};

const handleMessage = async (
  baileys: Session,
  msg: proto.IWebMessageInfo,
  tenantId: number | string
): Promise<void> => {
  try {
    const whatsapp = await Whatsapp.findByPk(baileys.id);
    if (!whatsapp) {
      logger.error(`WhatsApp instance not found for id: ${baileys.id}`);
      return;
    }

    const messageType = getContentType(msg.message!);
    const fromJid = msg.key.remoteJid!;
    const isGroupMsg = isJidGroup(fromJid);
    
    let contactNumber: string;
    
    if (isGroupMsg) {
      contactNumber = msg.key.participant?.split("@")[0] || fromJid.split("@")[0];
    } else {
      contactNumber = fromJid.split("@")[0];
    }

    const contact = await CreateOrUpdateContactService({
      name: msg.pushName || contactNumber,
      number: contactNumber,
      tenantId,
      isGroup: isGroupMsg,
    });

    const unreadMessages = 1;

    const ticket = await FindOrCreateTicketService({
      contact,
      whatsappId: whatsapp.id,
      unreadMessages,
      tenantId,
      groupContact: isGroupMsg ? await getGroupContact(fromJid, baileys) : undefined,
      msg: formatBaileysMessage(msg),
      channel: "baileys",
    });

    if (ticket?.isCampaignMessage) {
      return;
    }

    if (ticket?.isFarewellMessage) {
      return;
    }

    let messageBody = "";
    let mediaType: string | undefined;
    let mediaUrl: string | undefined;

    // Procesar diferentes tipos de mensajes
    switch (messageType) {
      case "conversation":
        messageBody = msg.message?.conversation || "";
        break;
      
      case "extendedTextMessage":
        messageBody = msg.message?.extendedTextMessage?.text || "";
        break;
      
      case "imageMessage":
        messageBody = msg.message?.imageMessage?.caption || "";
        mediaType = "image";
        mediaUrl = await downloadAndSaveMedia(msg, baileys);
        break;
      
      case "videoMessage":
        messageBody = msg.message?.videoMessage?.caption || "";
        mediaType = "video";
        mediaUrl = await downloadAndSaveMedia(msg, baileys);
        break;
      
      case "audioMessage":
        messageBody = "🎵 Áudio";
        mediaType = "audio";
        mediaUrl = await downloadAndSaveMedia(msg, baileys);
        break;
      
      case "documentMessage":
        messageBody = msg.message?.documentMessage?.fileName || "📄 Documento";
        mediaType = "document";
        mediaUrl = await downloadAndSaveMedia(msg, baileys);
        break;
      
      case "stickerMessage":
        messageBody = "Sticker";
        mediaType = "sticker";
        mediaUrl = await downloadAndSaveMedia(msg, baileys);
        break;
      
      default:
        messageBody = "Mensagem não suportada";
        break;
    }

    const messageData = {
      wid: msg.key.id!,
      ticketId: ticket.id,
      contactId: contact.id,
      body: messageBody,
      fromMe: false,
      mediaType,
      mediaUrl,
      read: false,
      quotedMsgId: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
      ack: 0,
      dataJson: JSON.stringify(msg),
    };

    await CreateMessageService({ messageData, tenantId });

    const io = getIO();
    io.to(`${tenantId}:${ticket.id}`).emit(`${tenantId}:appMessage`, {
      action: "create",
      message: messageData,
      ticket,
      contact,
    });

  } catch (err) {
    logger.error(`handleMessage error: ${err}`);
  }
};

const downloadAndSaveMedia = async (
  msg: proto.IWebMessageInfo,
  baileys: Session
): Promise<string | undefined> => {
  try {
    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      {
        logger: undefined,
        reuploadRequest: baileys.updateMediaMessage
      }
    );

    // Aquí deberías implementar la lógica para guardar el archivo
    // y retornar la URL donde está guardado
    // Por ejemplo, guardar en el sistema de archivos o cloud storage
    
    return "media-url-placeholder"; // Reemplazar con la URL real del archivo guardado
  } catch (err) {
    logger.error(`downloadAndSaveMedia error: ${err}`);
    return undefined;
  }
};

const getGroupContact = async (groupJid: string, baileys: Session) => {
  try {
    const groupMetadata = await baileys.groupMetadata(groupJid);
    return {
      id: groupJid,
      name: groupMetadata.subject,
    };
  } catch (err) {
    logger.error(`getGroupContact error: ${err}`);
    return undefined;
  }
};

const formatBaileysMessage = (msg: proto.IWebMessageInfo) => {
  return {
    id: msg.key.id,
    from: msg.key.remoteJid,
    type: getContentType(msg.message!),
    timestamp: msg.messageTimestamp,
    body: msg.message?.conversation || msg.message?.extendedTextMessage?.text || "",
  };
};