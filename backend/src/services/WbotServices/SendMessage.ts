import { join } from "path";
import { readFile } from "fs/promises";
import { WASocket } from "@whiskeysockets/baileys";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";
import { getWbot } from "../../libs/wbot";
import { Store } from "../../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const SendMessage = async (message: Message): Promise<void> => {
  logger.info(`SendMessage: ${message.id}`);
  const wbot = getWbot(message.ticket.whatsappId) as Session;
  let sendedMessage;

  const { ticket } = message;
  const contactNumber = message.contact.number;
  const chatId = `${contactNumber}@${ticket?.isGroup ? "g.us" : "s.whatsapp.net"}`;

  // Buscar mensaje citado si existe
  let quotedMessage;
  if (message.quotedMsg) {
    const chatMessages = wbot.store?.getMessages(chatId) || [];
    quotedMessage = chatMessages.find(m => m.key.id === message.quotedMsg?.messageId);
  }

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
        sendedMessage = await wbot.sendMessage(chatId, messageData, { quoted: quotedMessage });
      } else {
        sendedMessage = await wbot.sendMessage(chatId, messageData);
      }
    } catch (error) {
      logger.error("Error sending media message:", error);
      throw error;
    }
  } else {
    const options = quotedMessage ? { quoted: quotedMessage } : {};
    sendedMessage = await wbot.sendMessage(chatId, { text: message.body }, options);
  }

  // enviar old_id para substituir no front a mensagem corretamente
  const messageToUpdate = {
    ...message,
    id: message.id,
    messageId: sendedMessage?.key?.id || null,
    status: "sended"
  };

  await Message.update({ ...messageToUpdate }, { where: { id: message.id } });

  logger.info("rabbit::sendedMessage", sendedMessage?.key?.id);
};

export default SendMessage;
