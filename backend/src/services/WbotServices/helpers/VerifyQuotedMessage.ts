import { WAMessage, proto } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";

const VerifyQuotedMessage = async (msg: WAMessage): Promise<proto.IMessage | null> => {
  try {
    // Implementación específica para Baileys para verificar mensajes citados
    if (!msg.message) return null;

    // En Baileys, los mensajes citados se encuentran en diferentes lugares según el tipo
    let quotedMessage: proto.IMessage | null = null;

    if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    } else if (msg.message.imageMessage?.contextInfo?.quotedMessage) {
      quotedMessage = msg.message.imageMessage.contextInfo.quotedMessage;
    } else if (msg.message.videoMessage?.contextInfo?.quotedMessage) {
      quotedMessage = msg.message.videoMessage.contextInfo.quotedMessage;
    } else if (msg.message.documentMessage?.contextInfo?.quotedMessage) {
      quotedMessage = msg.message.documentMessage.contextInfo.quotedMessage;
    } else if (msg.message.audioMessage?.contextInfo?.quotedMessage) {
      quotedMessage = msg.message.audioMessage.contextInfo.quotedMessage;
    }

    return quotedMessage;
  } catch (err) {
    logger.error(`Error verifying quoted message: ${err}`);
    return null;
  }
};

export default VerifyQuotedMessage;
