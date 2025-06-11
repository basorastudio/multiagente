import { WAMessage, getContentType } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";

const HandleReaction = async (
  msg: WAMessage,
  wbot: any,
  tenantId: number | string
): Promise<void> => {
  try {
    logger.info("HandleReaction (Baileys) - Processing reaction");

    if (!msg || !msg.key || !msg.message) {
      logger.warn("Invalid reaction message received");
      return;
    }

    const messageType = getContentType(msg.message);
    
    if (messageType === 'reactionMessage' && msg.message.reactionMessage) {
      const reactionMessage = msg.message.reactionMessage;
      
      logger.info(`Reaction received: ${reactionMessage.text} for message: ${reactionMessage.key?.id}`);
      
      // Aquí se puede implementar la lógica para manejar reacciones
      // Por ejemplo, actualizar la base de datos con la reacción
      // o emitir eventos de socket para notificar a los clientes
      
      // Ejemplo de estructura de datos de reacción:
      const reactionData = {
        messageId: reactionMessage.key?.id,
        reaction: reactionMessage.text,
        fromJid: msg.key.remoteJid,
        timestamp: msg.messageTimestamp
      };
      
      logger.info("Reaction data:", reactionData);
    }

    logger.info(`HandleReaction (Baileys) - Reaction processed successfully: ${msg.key.id}`);

  } catch (err) {
    logger.error(`Error handling reaction: ${err}`);
  }
};

export default HandleReaction;
