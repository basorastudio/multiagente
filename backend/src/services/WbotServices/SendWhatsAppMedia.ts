import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import { readFile } from "fs/promises";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import { Store } from "../../libs/store";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<WAMessage | null> => {
  const wbot = await GetTicketWbot(ticket) as Session;
  const number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;

  try {
    const mediaBuffer = await readFile(media.path);
    
    let messageData: any = {};

    if (media.mimetype.startsWith('image/')) {
      messageData = {
        image: mediaBuffer,
        caption: body || '',
        mimetype: media.mimetype,
        fileName: media.originalname
      };
    } else if (media.mimetype.startsWith('video/')) {
      messageData = {
        video: mediaBuffer,
        caption: body || '',
        mimetype: media.mimetype,
        fileName: media.originalname
      };
    } else if (media.mimetype.startsWith('audio/')) {
      messageData = {
        audio: mediaBuffer,
        mimetype: media.mimetype,
        ptt: false
      };
    } else {
      messageData = {
        document: mediaBuffer,
        mimetype: media.mimetype,
        fileName: media.originalname,
        caption: body || ''
      };
    }

    const sentMessage = await wbot.sendMessage(number, messageData);

    return sentMessage || null;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
