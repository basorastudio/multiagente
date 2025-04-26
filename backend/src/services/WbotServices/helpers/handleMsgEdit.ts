import { Message as WbotMessage } from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import socketEmit from "../../../helpers/socketEmit";

const handleMsgEdit = async (
  msg: WbotMessage,
  newBody: string
): Promise<void> => {
  
  try {
    // Buscar el mensaje en la base de datos
    const editedMsg = await Message.findOne({ 
	where: { messageId: msg.id.id },
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
      return;
    }

    // Actualizar el campo 'edited'
    await editedMsg.update({ edited: newBody });
	
	const { ticket } = editedMsg;
	   socketEmit({
       tenantId: ticket.tenantId,
       type: "chat:update",
       payload: editedMsg
      });

  } catch (err) {
    console.error(`Error al manejar la edición del mensaje con ID ${msg.id.id}. Error: ${err}`);
  }
}

export default handleMsgEdit;