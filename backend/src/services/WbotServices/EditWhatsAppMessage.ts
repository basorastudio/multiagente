import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { getIO } from "../../libs/socket";

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
    throw new AppError("No se encontró ningún mensaje con este ID.");
  }
  
  // Verificar si ya pasaron más de 10 minutos desde que se envió el mensaje
  const messageAgeInMinutes = (new Date().getTime() - new Date(message.createdAt).getTime()) / 60000;
  if (messageAgeInMinutes > 10) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  // Verificar si la columna 'edited' no es NULL
  if (message.edited !== null) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  const { ticket } = message;

  const messageToEdit = await GetWbotMessage(ticket, messageId);

  try {
    if (!messageToEdit) {
      throw new AppError("ERROR_NOT_FOUND_MESSAGE");
    }
    await messageToEdit.edit(newBody);
  } catch (err) {
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }

  const io = getIO();
  io.to(`tenant:${tenantId}:${message.ticket.id}`).emit(
    `Empresa:${tenantId}:appMessage`,
    {
      action: "update",
      message,
      contact: ticket.contact
    }
  );
};

export default EditWhatsAppMessage;