/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";
import SendMessage from "./SendMessage";
import SendMessageSystemProxy from "../../helpers/SendMessageSystemProxy";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

const SendMessagesSchenduleWbot = async (): Promise<void> => {
  const currentDate = new Date(); // Use UTC directly
  const twentyFourHoursAgo = new Date(
    currentDate.getTime() - 24 * 60 * 60 * 1000
  );

  const where = {
    fromMe: true,
    messageId: { [Op.is]: null },
    status: "pending",
    scheduleDate: {
      [Op.lte]: currentDate // Compare directly with UTC date
      // [Op.gte]: twentyFourHoursAgo // Removing this condition for now, as the primary goal is to send messages scheduled up to the current time.
      // If needed, logic to prevent sending very old messages can be added separately.
    }
  };
  const messages = await Message.findAll({
    where,
    include: [
      {
        model: Contact,
        as: "contact"
      },
      {
        model: Ticket,
        as: "ticket",
        where: {
          status: ["open", "pending"]
        },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });

  for (const message of messages) {
    logger.info(
      `Mensaje programado enviado: ${message.id} | Tenant: ${message.tenantId} `
    );

    if (message.ticket.channel !== "whatsapp") {
      try {
        const sent = await SendMessageSystemProxy({
          ticket: message.ticket,
          messageData: message.toJSON(),
          media: null,
          userId: message.userId
        });

        message.update({
          messageId: sent.id?.id || sent.messageId,
          status: "sended",
          ack: 2,
          userId: message.userId
        });
      } catch (error) {
        logger.error(
          "SendMessagesSchenduleWbot > SendMessageSystemProxy",
          error
        );
      }
    } else {
      await SendMessage(message).catch(e => {
        logger.error("SendMessagesSchenduleWbot > SendMessage", e);
      });
    }
  }
};

export default SendMessagesSchenduleWbot;
