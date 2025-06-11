import {
  WASocket,
  WAMessage,
  proto,
  MessageUpsertType,
  downloadMediaMessage,
  getContentType,
  jidNormalizedUser,
  isJidBroadcast,
  WAMessageKey,
  extractMessageContent
} from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import { promisify } from "util";
import { writeFile } from "fs";
import { join } from "path";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";
import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import { Store } from "../../libs/store";
import { CreateOrUpdateBaileysChatService } from "../BaileysChatServices/CreateOrUpdateBaileysChatService";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";

const writeFileAsync = promisify(writeFile);

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

const isValidMsg = (msg: WAMessage): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  if (msg.key.remoteJid?.endsWith("@g.us") && msg.key.participant === undefined) return false;
  if (msg.messageStubType && msg.messageStubType !== proto.WebMessageInfo.StubType.CIPHERTEXT) return false;
  if (msg.message?.protocolMessage) return false;
  if (msg.message?.reactionMessage) return false;
  
  return true;
};

const getBodyMessage = (msg: WAMessage): string => {
  try {
    if (!msg.message) return "";
    
    const type = getContentType(msg.message);
    
    if (!type) return "";
    
    if (type === "conversation") {
      return msg.message.conversation || "";
    }
    
    if (type === "extendedTextMessage") {
      return msg.message.extendedTextMessage?.text || "";
    }
    
    if (type === "imageMessage") {
      return msg.message.imageMessage?.caption || "";
    }
    
    if (type === "videoMessage") {
      return msg.message.videoMessage?.caption || "";
    }
    
    if (type === "documentMessage") {
      return msg.message.documentMessage?.caption || msg.message.documentMessage?.fileName || "";
    }
    
    if (type === "audioMessage") {
      return "Áudio";
    }
    
    if (type === "stickerMessage") {
      return "Figurinha";
    }
    
    if (type === "contactMessage") {
      return `Contato: ${msg.message.contactMessage?.displayName}`;
    }
    
    if (type === "locationMessage") {
      return "Localização";
    }
    
    return "";
  } catch (error) {
    logger.error("Erro ao extrair corpo da mensagem:", error);
    return "";
  }
};

const downloadMedia = async (msg: WAMessage): Promise<Buffer | null> => {
  try {
    const buffer = await downloadMediaMessage(
      msg,
      'buffer',
      {},
      {
        logger: logger as any,
        reuploadRequest: async () => ({} as any)
      }
    );
    return buffer as Buffer;
  } catch (error) {
    logger.error("Erro ao fazer download da mídia:", error);
    return null;
  }
};

const handleMessage = async (
  msg: WAMessage,
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  try {
    if (!isValidMsg(msg)) return;

    const msgContact = msg.key.fromMe
      ? jidNormalizedUser(wbot.user?.id || "")
      : jidNormalizedUser(msg.key.remoteJid || msg.key.participant || "");

    const msgBody = getBodyMessage(msg);
    const msgId = msg.key.id;
    const msgTimestamp = msg.messageTimestamp as number;

    if (!msgId) return;

    // Verificar se a mensagem já existe
    const existingMessage = await Message.findOne({
      where: { messageId: msgId }
    });

    if (existingMessage) return;

    // Buscar ou criar contato
    const contact = await CreateOrUpdateContactService({
      name: msg.pushName || msgContact,
      number: msgContact.replace(/\D/g, ""),
      isGroup: msg.key.remoteJid?.endsWith("@g.us") || false,
      tenantId: Number(tenantId),
      pushname: msg.pushName || "",
      isUser: true,
      isWAContact: true
    });

    // Buscar ou criar ticket
    const whatsapp = await ShowWhatsAppService({
      id: wbot.id!,
      tenantId: Number(tenantId)
    });

    const ticket = await FindOrCreateTicketService({
      contact,
      whatsappId: whatsapp.id,
      unreadMessages: 1,
      tenantId: Number(tenantId),
      channel: "whatsapp"
    });

    // Criar mensagem
    await CreateMessageService({
      messageData: {
        messageId: msgId,
        ticketId: ticket.id,
        contactId: contact.id,
        body: msgBody,
        fromMe: msg.key.fromMe || false,
        read: msg.key.fromMe || false,
        mediaType: getContentType(msg.message || {}) || "text",
        timestamp: msgTimestamp
      },
      tenantId: Number(tenantId)
    });

    // Atualizar ticket
    await UpdateTicketService({
      ticketData: { 
        lastMessage: msgBody,
        updatedAt: new Date()
      } as any,
      ticketId: ticket.id,
      userIdRequest: contact.id
    });

    // Emitir eventos via socket
    const io = getIO();
    io.to(`${tenantId}:${ticket.status}`)
      .to(`${tenantId}:notification`)
      .emit(`${tenantId}:ticket`, {
        action: "update",
        ticket
      });

  } catch (error) {
    logger.error("Erro ao processar mensagem:", error);
    Sentry.captureException(error);
  }
};

export const wbotMessageListener = (wbot: Session, tenantId: number | string): void => {
  wbot.ev.on("messages.upsert", async ({ messages, type }: ImessageUpsert) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      await handleMessage(msg, wbot, tenantId);
    }
  });

  wbot.ev.on("contacts.upsert", async (contacts) => {
    await createOrUpdateBaileysService({
      whatsappId: wbot.id!,
      contacts
    });
  });

  wbot.ev.on("chats.upsert", async (chats) => {
    for (const chat of chats) {
      await CreateOrUpdateBaileysChatService(wbot.id!, chat);
    }
  });
};
