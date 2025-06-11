import { WAMessage, getContentType } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";
import Contact from "../../../models/Contact";
import Ticket from "../../../models/Ticket";
import CreateMessageService from "../../MessageServices/CreateMessageService";
import VerifyQuotedMessage from "./VerifyQuotedMessage";

const VerifyMessage = async (
  msg: WAMessage,
  ticket: any,
  contact: any
): Promise<any> => {
  try {
    // Verificar que el mensaje y su contenido existan
    if (!msg || !msg.message) {
      logger.warn(`Message or message content is null/undefined for message: ${msg?.key?.id}`);
      return null;
    }

    const messageType = getContentType(msg.message);
    
    if (!messageType) {
      logger.warn(`Message type not recognized for message: ${msg.key.id}`);
      return null;
    }

    let messageBody = "";
    let mediaUrl = "";
    let messageId = msg.key.id;
    let fromMe = msg.key.fromMe;
    let timestamp = msg.messageTimestamp;

    // Extraer contenido según el tipo de mensaje con verificaciones de null
    switch (messageType) {
      case "conversation":
        messageBody = msg.message.conversation || "";
        break;
      case "extendedTextMessage":
        messageBody = msg.message.extendedTextMessage?.text || "";
        break;
      case "imageMessage":
        messageBody = msg.message.imageMessage?.caption || "";
        break;
      case "videoMessage":
        messageBody = msg.message.videoMessage?.caption || "";
        break;
      case "documentMessage":
        messageBody = msg.message.documentMessage?.caption || "";
        break;
      case "audioMessage":
        messageBody = "🎵 Audio";
        break;
      default:
        messageBody = `Mensaje de tipo: ${messageType}`;
    }

    return {
      messageId,
      body: messageBody,
      fromMe,
      timestamp,
      messageType,
      mediaUrl,
      quotedMsgId: msg.message?.extendedTextMessage?.contextInfo?.stanzaId || null
    };

  } catch (err) {
    logger.error(`Error verifying message: ${err}`);
    return null;
  }
};

export default VerifyMessage;
