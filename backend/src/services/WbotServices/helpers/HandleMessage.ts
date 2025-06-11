// ARCHIVO TEMPORALMENTE DESACTIVADO PARA MIGRACIÓN A BAILEYS
// import {
//   Contact as WbotContact,
//   Message as WbotMessage,
//   Client
// } from "whatsapp-web.js";
import { WAMessage, getContentType } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";
import Ticket from "../../../models/Ticket";
import Contact from "../../../models/Contact";
import CreateMessageService from "../../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import VerifyContact from "./VerifyContact";
import VerifyMessage from "./VerifyMessage";
import VerifyQuotedMessage from "./VerifyQuotedMessage";

// NOTA: Este archivo está temporalmente desactivado durante la migración a Baileys
// Las funciones de HandleMessage ahora se manejan en wbotMessageListener.ts con Baileys

// interface Session extends Client {
//   id: number;
// }

const HandleMessage = async (
  msg: WAMessage,
  wbot: any,
  tenantId: number | string
): Promise<void> => {
  try {
    logger.info("HandleMessage (Baileys) - Processing message");

    if (!msg || !msg.key || !msg.message) {
      logger.warn("Invalid message received");
      return;
    }

    const messageType = getContentType(msg.message);
    if (!messageType) {
      logger.warn(`Unknown message type for message: ${msg.key.id}`);
      return;
    }

    // Extraer información del contacto
    const contactId = msg.key.remoteJid;
    const fromMe = msg.key.fromMe;
    
    if (!contactId) {
      logger.warn("No contact ID found in message");
      return;
    }

    // Verificar y crear/actualizar contacto
    const contact = await VerifyContact(
      { id: contactId, name: msg.pushName || contactId.split('@')[0] },
      tenantId
    );

    // Encontrar o crear ticket
    const ticket = await FindOrCreateTicketService({
      contact,
      whatsappId: wbot.id,
      unreadMessages: 0,
      tenantId,
      channel: "whatsapp",
      isGroup: contactId.includes("@g.us")
    });

    // Verificar mensaje citado si existe
    const quotedMsg = await VerifyQuotedMessage(msg);

    // Procesar y crear el mensaje
    const messageData = await VerifyMessage(msg, ticket, contact);
    
    if (messageData) {
      await CreateMessageService({
        messageData: {
          ...messageData,
          quotedMsgId: quotedMsg ? String(quotedMsg) : null
        },
        tenantId
      });
    }

    logger.info(`HandleMessage (Baileys) - Message processed successfully: ${msg.key.id}`);

  } catch (err) {
    logger.error(`Error handling message: ${err}`);
  }
};

export default HandleMessage;
