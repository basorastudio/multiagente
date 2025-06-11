import { proto, WAMessage } from "@whiskeysockets/baileys";
import { readFile } from "fs/promises";
import { join } from "path";
import { getBaileys } from "../../libs/baileys";
import { logger } from "../../utils/logger";
import CreateMessageService from "../MessageServices/CreateMessageService";

interface SendBaileysMessageData {
  body: string;
  ticket: any;
  quotedMsg?: any;
  userId?: string | number;
  mediaPath?: string;
  mediaType?: string;
}

const SendBaileysMessage = async ({
  body,
  ticket,
  quotedMsg,
  userId,
  mediaPath,
  mediaType,
}: SendBaileysMessageData): Promise<WAMessage> => {
  const baileys = getBaileys(ticket.whatsappId);
  const chatId = `${ticket.contact.number}@s.whatsapp.net`;

  try {
    let sentMessage: any;

    if (mediaPath) {
      // Enviar mensaje con media
      const mediaBuffer = await readFile(
        join(__dirname, "..", "..", "..", "public", mediaPath)
      );

      if (mediaType === "image") {
        sentMessage = await baileys.sendMessage(chatId, {
          image: mediaBuffer,
          caption: body,
        });
      } else if (mediaType === "video") {
        sentMessage = await baileys.sendMessage(chatId, {
          video: mediaBuffer,
          caption: body,
        });
      } else if (mediaType === "audio") {
        sentMessage = await baileys.sendMessage(chatId, {
          audio: mediaBuffer,
          mimetype: "audio/mp4",
        });
      } else {
        sentMessage = await baileys.sendMessage(chatId, {
          document: mediaBuffer,
          fileName: mediaPath,
          caption: body,
        });
      }
    } else {
      // Enviar mensaje de texto
      const messageOptions: any = {
        text: body,
      };

      if (quotedMsg) {
        messageOptions.quoted = {
          key: {
            remoteJid: chatId,
            fromMe: true,
            id: quotedMsg.messageId,
          },
          message: {
            conversation: quotedMsg.body,
          },
        };
      }

      sentMessage = await baileys.sendMessage(chatId, messageOptions);
    }

    // Crear registro de mensaje en la base de datos
    const messageData = {
      messageId: sentMessage.key.id,
      ticketId: ticket.id,
      contactId: ticket.contactId,
      body: body || mediaPath,
      fromMe: true,
      read: true,
      mediaType: mediaType || "chat",
      mediaUrl: mediaPath,
      timestamp: Date.now(),
      quotedMsgId: quotedMsg?.id,
    };

    await CreateMessageService({
      messageData,
      tenantId: ticket.tenantId,
    });

    await ticket.update({
      lastMessage: body || "📎 Mídia",
      lastMessageAt: new Date(),
      answered: true,
    });

    logger.info(`Mensagem Baileys enviada: ${sentMessage.key.id}`);
    return sentMessage;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem Baileys: ${error}`);
    throw error;
  }
};

export default SendBaileysMessage;