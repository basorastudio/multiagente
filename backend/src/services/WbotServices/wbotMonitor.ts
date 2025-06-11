import {
  WASocket,
  BinaryNode,
  Contact as BContact,
} from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { Store } from "../../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp,
  tenantId: number
): Promise<void> => {
  try {
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content?.[0] as any;

      if (content?.tag === "offer") {
        const { from, id } = node.attrs;
      }

      if (content?.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "call", tenantId },
        });

        if (sendMsgCall?.value === "disabled") {
          await wbot.sendMessage(node.attrs.from, {
            text:
              "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitadas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado",
          });

          const number = node.attrs.from.replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { tenantId, number },
          });

          if (contact && wbot.id) {
            const ticket = await Ticket.findOne({
              where: {
                contactId: contact.id,
                whatsappId: wbot.id,
                status: {
                  [Op.or]: ["open", "pending"]
                }
              },
            });

            if (ticket) {
              await CreateMessageService({
                messageData: {
                  messageId: `call_${Date.now()}`,
                  body: "*Chamada de voz/vídeo realizada*",
                  fromMe: false,
                  read: true,
                  mediaType: "call_log",
                  timestamp: Math.floor(Date.now() / 1000),
                  ticketId: ticket.id,
                  contactId: contact.id
                },
                tenantId
              });
            }
          }
        }
      }
    });

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
      await createOrUpdateBaileysService({
        whatsappId: wbot.id!,
        contacts
      });
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
