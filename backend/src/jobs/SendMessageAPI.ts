/* eslint-disable @typescript-eslint/no-explicit-any */
import { WASocket } from "@whiskeysockets/baileys";
import fs from "fs";
import { v4 as uuid } from "uuid";
import axios from "axios";
import mime from "mime-types";
import { join } from "path";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import UpsertMessageAPIService from "../services/ApiMessageService/UpsertMessageAPIService";
import Queue from "../libs/Queue";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import AppError from "../errors/AppError";
import VerifyContact from "../services/WbotServices/helpers/VerifyContact";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";
import { Store } from "../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

export default {
  key: "SendMessageAPI",
  options: {
    delay: 6000,
    attempts: 50,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const wbot = getWbot(data.sessionId) as Session;
      
      try {
        // En Baileys, verificamos si el número es válido usando nuestro servicio
        const jid = `${data.number}@s.whatsapp.net`;
        
        // Verificar si el contacto existe usando nuestro servicio
        let isValidContact = true;
        try {
          await CheckIsValidContact(data.number, data.tenantId);
        } catch (error) {
          isValidContact = false;
        }

        if (!isValidContact) {
          const payload = {
            ack: -1,
            body: data.body,
            messageId: "",
            number: data.number,
            externalKey: data.externalKey,
            error: "number invalid in whatsapp",
            type: "hookMessageStatus",
            authToken: data.authToken
          };

          if (data.media) {
            // excluir o arquivo se o número não existir
            fs.unlinkSync(data.media.path);
          }

          if (data?.apiConfig?.urlMessageStatus) {
            Queue.add("WebHooksAPI", {
              url: data.apiConfig.urlMessageStatus,
              type: payload.type,
              payload
            });
          }
          return payload;
        }

        // En Baileys, obtenemos el contacto del store o creamos uno básico
        let contactData = wbot.store?.getContact(jid);
        if (!contactData) {
          contactData = {
            id: jid,
            name: data.number,
            notify: data.number
          };
        }

        const contact = await VerifyContact(contactData, data.tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages: 0,
          tenantId: data.tenantId,
          groupContact: undefined,
          msg: data,
          channel: "whatsapp"
        });

        await CreateMessageSystemService({
          msg: data,
          tenantId: data.tenantId,
          ticket,
          sendType: "API",
          status: "pending"
        });

        await ticket.update({
          apiConfig: {
            ...data.apiConfig,
            externalKey: data.externalKey
          }
        });
      } catch (error) {
        const payload = {
          ack: -2,
          body: data.body,
          messageId: "",
          number: data.number,
          externalKey: data.externalKey,
          error: "error session",
          type: "hookMessageStatus",
          authToken: data.authToken
        };

        if (data?.apiConfig?.urlMessageStatus) {
          Queue.add("WebHooksAPI", {
            url: data.apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }
        throw new Error(error);
      }
    } catch (error) {
      logger.error({ message: "Error send message api", error });
      throw new Error(error);
    }
  }
};
