import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { Store } from "../../libs/store";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
}: Request): Promise<WAMessage | null> => {
  let options = {};
  const wbot = await GetTicketWbot(ticket) as Session;
  const number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  if (quotedMsg) {
    const chatMessages = wbot.store?.getMessages(number) || [];
    const quotedMessage = chatMessages.find(m => m.key.id === quotedMsg.messageId);
    
    if (quotedMessage) {
      options = {
        quoted: quotedMessage
      };
    }
  }

  try {
    const sentMessage = await wbot.sendMessage(number, {
      text: body
    }, options);

    return sentMessage || null;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
