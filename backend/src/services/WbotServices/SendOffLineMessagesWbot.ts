import { join } from "path";
import { WASocket, proto } from "@whiskeysockets/baileys";
import { readFile } from "fs/promises";
import Message from "../../models/Message";
import MessagesOffLine from "../../models/MessageOffLine";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import SendWhatsAppMedia from "./SendWhatsAppMedia";
import { getIO } from "../../libs/socket";
import UserMessagesLog from "../../models/UserMessagesLog";

type Session = WASocket & {
  id?: number;
};

const SendOffLineMessagesWbot = async (
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  const messages = await MessagesOffLine.findAll({
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        where: { tenantId },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["updatedAt", "ASC"]]
  });
  
  const io = getIO();
  
  await Promise.all(
    messages.map(async message => {
      logger.info(`Send Message OffLine: ${message}`);
      try {
        if (message.mediaType !== "chat" && message.mediaName) {
          const customPath = join(__dirname, "..", "..", "..", "public");
          const mediaPath = join(
            process.env.PATH_OFFLINE_MEDIA || customPath,
            message.mediaName
          );
          
          try {
            const mediaBuffer = await readFile(mediaPath);
            const { number } = message.ticket.contact;
            const chatId = `${number}@${message.ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
            
            // Enviar media usando Baileys
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
            
            const sendMessage = await wbot.sendMessage(chatId, messageData);
            
            try {
              if (message.userId && sendMessage?.key?.id) {
                await UserMessagesLog.create({
                  messageId: sendMessage.key.id,
                  userId: message.userId,
                  ticketId: message.ticketId
                });
              }
            } catch (error) {
              logger.error(`Error criar log mensagem ${error}`);
            }
          } catch (error) {
            logger.error(`Error reading media file: ${error}`);
          }
        } else {
          await SendWhatsAppMessage({
            body: message.body,
            ticket: message.ticket,
            quotedMsg: message.quotedMsg
          });
        }
        
        await MessagesOffLine.destroy({ where: { id: message.id } });
        io.to(`${tenantId}-${message.ticketId.toString()}`).emit(
          `${tenantId}-appMessage`,
          {
            action: "delete",
            message
          }
        );
      } catch (error) {
        logger.error(`Error enviar messageOffLine: ${error}`);
      }
    })
  );
};

export default SendOffLineMessagesWbot;
