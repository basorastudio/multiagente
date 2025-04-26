import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";

export const UpdateMessageAck = async (messageId: string): Promise<void> => {
  try {

    const message = await Message.findOne({
      where: {
        messageId
      },
    });

    if (!message) {
     // console.error("Mensaje no encontrado para el ID:", messageId);
   //   console.log("Intentando buscar nuevamente en 10 segundos...");

      setTimeout(async () => {
        await UpdateMessageAck(messageId);
      }, 5000);
      return;
    }

   // console.log("Mensaje encontrado:", message);
  //  console.log("Actualizando campo 'ack' a 3");

    await message.update({
      ack: 2,
    });

	    socketEmit({
        tenantId: message.tenantId,
        type: "chat:update",
        payload: message
      });

  // console.log("Campo 'ack' actualizado correctamente");
  } catch (error) {
    console.error("Error al intentar actualizar el campo 'ack':", error);
  }
};