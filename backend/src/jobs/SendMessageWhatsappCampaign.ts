/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from "path";
import { readFile } from "fs/promises";
import { WASocket, proto } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import CampaignContacts from "../models/CampaignContacts";
import { Store } from "../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

export default {
  key: "SendMessageWhatsappCampaign",
  options: {
    delay: 15000,
    attempts: 10,
    removeOnComplete: true,
    // removeOnFail: true,
    backoff: {
      type: "fixed",
      delay: 60000 * 5 // 5 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const wbot = getWbot(data.whatsappId) as Session;
      let message: proto.WebMessageInfo | null = null;
      
      const chatId = `${data.number}@s.whatsapp.net`;
      
      if (data.mediaUrl) {
        const customPath = join(__dirname, "..", "..", "public");
        const mediaPath = join(customPath, data.mediaName);
        
        try {
          const mediaBuffer = await readFile(mediaPath);
          
          // Determinar el tipo de media basado en la extensión
          const fileExtension = data.mediaName.split('.').pop()?.toLowerCase();
          let messageData: any = {};
          
          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
            messageData = {
              image: mediaBuffer,
              caption: data.message,
              fileName: data.mediaName
            };
          } else if (['mp4', 'avi', 'mov', 'mkv'].includes(fileExtension || '')) {
            messageData = {
              video: mediaBuffer,
              caption: data.message,
              fileName: data.mediaName
            };
          } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension || '')) {
            messageData = {
              audio: mediaBuffer,
              ptt: true
            };
          } else {
            messageData = {
              document: mediaBuffer,
              fileName: data.mediaName,
              caption: data.message
            };
          }
          
          const result = await wbot.sendMessage(chatId, messageData);
          message = result || null;
        } catch (error) {
          logger.error("Error reading media file:", error);
          // Fallback: enviar solo el texto
          const result = await wbot.sendMessage(chatId, { text: data.message });
          message = result || null;
        }
      } else {
        const result = await wbot.sendMessage(chatId, { text: data.message });
        message = result || null;
      }

      if (message) {
        await CampaignContacts.update(
          {
            messageId: message.key?.id || '',
            messageRandom: data.messageRandom,
            body: data.message,
            mediaName: data.mediaName,
            timestamp: (message.messageTimestamp as number) || Date.now(),
            jobId: data.jobId
          },
          { where: { id: data.campaignContact.id } }
        );
      }

      return message;
    } catch (error) {
      logger.error(`Error enviar message campaign: ${error}`);
      throw new Error(error);
    }
  }
};
