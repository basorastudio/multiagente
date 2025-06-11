import { WAMessage } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";

const handleMsgEdit = async (msg: WAMessage): Promise<void> => {
  try {
    // Implementación específica para Baileys para manejar edición de mensajes
    logger.info(`HandleMsgEdit - Message edited: ${msg.key.id}`);
    
    if (!msg.key?.id) {
      logger.warn("Message ID is missing");
      return;
    }

    // Buscar el mensaje en la base de datos
    const editedMsg = await Message.findOne({ 
      where: { messageId: msg.key.id },
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId", "apiConfig"]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (!editedMsg) {
      logger.warn(`Message not found for editing: ${msg.key.id}`);
      return;
    }

    // Extraer el nuevo contenido del mensaje editado
    let newBody = "";
    if (msg.message?.editedMessage?.message?.extendedTextMessage?.text) {
      newBody = msg.message.editedMessage.message.extendedTextMessage.text;
    } else if (msg.message?.extendedTextMessage?.text) {
      newBody = msg.message.extendedTextMessage.text;
    } else if (msg.message?.conversation) {
      newBody = msg.message.conversation;
    }

    // Atualizar o campo 'edited'
    await editedMsg.update({ edited: newBody });
	
	const { ticket } = editedMsg;
	   socketEmit({
       tenantId: ticket.tenantId,
       type: "chat:update",
       payload: editedMsg
      });

    logger.info(`Message edited successfully: ${msg.key.id}`);

  } catch (err) {
    logger.error(`Error handling message edit for ID ${msg.key?.id}: ${err}`);
  }
}

export default handleMsgEdit;
