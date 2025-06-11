/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { join } from "path";
import { readFile } from "fs/promises";
import { WASocket, proto } from "@whiskeysockets/baileys";
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import { sleepRandomTime } from "../../utils/sleepRandomTime";
import Contact from "../../models/Contact";
import { Store } from "../../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const SendMessagesSystemWbot = async (
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  const where = {
    fromMe: true,
    messageId: { [Op.is]: null },
    status: "pending",
    [Op.or]: [
      {
        scheduleDate: {
          [Op.lte]: new Date()
        }
      },
      {
        scheduleDate: { [Op.is]: null }
      }
    ]
  };
  const messages = await Message.findAll({
    where,
    include: [
      {
        model: Contact,
        as: "contact",
        where: {
          tenantId,
          number: {
            [Op.notIn]: ["", "null"]
          }
        }
      },
      {
        model: Ticket,
        as: "ticket",
        where: {
          tenantId,
          [Op.or]: {
            status: { [Op.ne]: "closed" },
            isFarewellMessage: true
          },
          channel: "whatsapp",
          whatsappId: wbot.id
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
  let sendedMessage: proto.WebMessageInfo | null = null;

  for (const message of messages) {
    const { ticket } = message;
    const contactNumber = ticket.contact.number;
    const chatId = `${contactNumber}@${ticket?.isGroup ? "g.us" : "s.whatsapp.net"}`;

    // Buscar mensaje citado si existe
    let quotedMessage;
    if (message.quotedMsg) {
      const chatMessages = wbot.store?.getMessages(chatId) || [];
      quotedMessage = chatMessages.find(m => m.key.id === message.quotedMsg?.messageId);
    }

    try {
      if (message.mediaType !== "chat" && message.mediaName) {
        const customPath = join(__dirname, "..", "..", "..", "public");
        const mediaPath = join(customPath, message.mediaName);
        
        try {
          const mediaBuffer = await readFile(mediaPath);
          
          let messageData: any = {};
          
          if (message.mediaType === "image") {
            messageData = {
              image: mediaBuffer,
              caption: message.body || '',
              fileName: message.mediaName
            };
          } else if (message.mediaType === "video") {
            messageData = {
              video: mediaBuffer,
              caption: message.body || '',
              fileName: message.mediaName
            };
          } else if (message.mediaType === "audio") {
            messageData = {
              audio: mediaBuffer,
              ptt: true
            };
          } else {
            messageData = {
              document: mediaBuffer,
              fileName: message.mediaName,
              caption: message.body || ''
            };
          }

          if (quotedMessage) {
            const result = await wbot.sendMessage(chatId, messageData, { quoted: quotedMessage });
            sendedMessage = result || null;
          } else {
            const result = await wbot.sendMessage(chatId, messageData);
            sendedMessage = result || null;
          }
          logger.info("sendMessage media");
        } catch (error) {
          logger.error("Error reading media file:", error);
          // Fallback: enviar solo el texto
          const options = quotedMessage ? { quoted: quotedMessage } : {};
          const result = await wbot.sendMessage(chatId, { text: message.body }, options);
          sendedMessage = result || null;
        }
      } else {
        const options = quotedMessage ? { quoted: quotedMessage } : {};
        const result = await wbot.sendMessage(chatId, { text: message.body }, options);
        sendedMessage = result || null;
        logger.info("sendMessage text");
      }

      if (sendedMessage) {
        // enviar old_id para substituir no front a mensagem corretamente
        const messageToUpdate = {
          ...message,
          id: message.id,
          messageId: sendedMessage.key?.id || null,
          status: "sended"
        };

        await Message.update(
          { ...messageToUpdate },
          { where: { id: message.id } }
        );

        logger.info("Message Update");

        // delay para processamento da mensagem
        await sleepRandomTime({
          minMilliseconds: Number(process.env.MIN_SLEEP_INTERVAL || 500),
          maxMilliseconds: Number(process.env.MAX_SLEEP_INTERVAL || 2000)
        });

        logger.info("sendMessage", sendedMessage.key?.id);
      }
    } catch (error) {
      const idMessage = message.id;
      const ticketId = message.ticket.id;

      if (error.code === "ENOENT") {
        await Message.destroy({
          where: { id: message.id }
        });
      }

      logger.error(
        `Error message is (tenant: ${tenantId} | Ticket: ${ticketId})`
      );
      logger.error(`Error send message (id: ${idMessage})::${error}`);
    }
  }
};

export default SendMessagesSystemWbot;
