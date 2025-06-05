import { WAMessage, downloadMediaMessage, getDevice } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";
import { join } from "path";
import mime from "mime-types";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";

const BaileysVerifyMediaMessage = async (
  whatsapp: any,
  message: WAMessage,
  ticket: any,
  contact: any
): Promise<void> => {
  try {
    const messageMedia = message.message?.imageMessage ||
                        message.message?.videoMessage ||
                        message.message?.audioMessage ||
                        message.message?.documentMessage ||
                        message.message?.stickerMessage;

    if (!messageMedia) return;

    const buffer = await downloadMediaMessage(message, "buffer", {});
    
    const fileName = `${Date.now()}-${message.key.id}`;
    const extension = mime.extension(messageMedia.mimetype || "");
    const fullFileName = extension ? `${fileName}.${extension}` : fileName;
    
    const mediaPath = join(__dirname, "..", "..", "..", "public", fullFileName);
    await writeFile(mediaPath, buffer);

    const mediaType = messageMedia.mimetype?.split("/")[0] || "application";
    const caption = messageMedia.caption || "";

    const messageData = {
      messageId: message.key.id,
      ticketId: ticket.id,
      contactId: contact.id,
      body: caption || fullFileName,
      fromMe: false,
      read: false,
      mediaType,
      mediaUrl: fullFileName,
      timestamp: message.messageTimestamp ? Number(message.messageTimestamp) * 1000 : Date.now()
    };

    await CreateMessageService({
      messageData,
      tenantId: ticket.tenantId
    });

    await ticket.update({
      lastMessage: caption || "📎 Mídia",
      lastMessageAt: new Date(messageData.timestamp),
      answered: false
    });

    logger.info(`Mensagem de mídia processada: ${message.key.id}, tipo: ${mediaType}`);
  } catch (error) {
    logger.error(`Erro ao processar mensagem de mídia Baileys: ${error}`);
    throw error;
  }
};

export default BaileysVerifyMediaMessage;