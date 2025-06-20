import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

const EditWhatsAppMessage = async (
  id: string,
  messageId: string,
  tenantId: string | number,
  newBody: string
): Promise<void> => {

  if (!id || id === "null") {
    throw new AppError("ERR_NO_MESSAGE_ID_PROVIDED");
  }
  const message = await Message.findOne({
    where: { messageId: messageId },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"],
        where: { tenantId }
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }
  
  // Verificar se já se passaram mais de 10 minutos desde que a mensagem foi enviada
  const messageAgeInMinutes = (new Date().getTime() - new Date(message.createdAt).getTime()) / 60000;
  if (messageAgeInMinutes > 10) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  // Verificar se a coluna 'edited' não é NULL
  if (message.edited !== null) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  const { ticket } = message;

  const messageToEdit = await GetWbotMessage(ticket, messageId);




  try {
    if (!messageToEdit) {
      throw new AppError("ERROR_NOT_FOUND_MESSAGE");
    }
    
    // En Baileys, no existe el método .edit() como en WWebJS
    // La edición de mensajes en WhatsApp requiere una implementación diferente
    logger.info(`Attempting to edit message ${messageId} using Baileys - Feature not fully implemented`);
    
    // Por ahora, actualizaremos solo en la base de datos
    // La implementación completa requeriría usar la API de edición de WhatsApp
  } catch (err) {
    logger.error(`Error editing message: ${err}`);
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  const io = getIO();
  io.to(`tenant:${tenantId}:${message.ticket.id}`).emit(
    `tenant:${tenantId}:appMessage`,
    {
      action: "update",
      message,
      contact: ticket.contact
    }
  );
};

export default EditWhatsAppMessage;
