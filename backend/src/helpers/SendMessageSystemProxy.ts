import { getInstaBot } from "../libs/InstaBot";
import { getTbot } from "../libs/tbot";
import { getBaileys } from "../libs/baileys";
import InstagramSendMessagesSystem from "../services/InstagramBotServices/InstagramSendMessagesSystem";
import TelegramSendMessagesSystem from "../services/TbotServices/TelegramSendMessagesSystem";
import SendBaileysMessage from "../services/BaileysServices/SendBaileysMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type Payload = {
  ticket: any;
  messageData: any;
  media: any;
  userId: any;
};

const SendMessageSystemProxy = async ({
  ticket,
  messageData,
  media,
  userId
}: Payload): Promise<any> => {
  let message;

  if (messageData.mediaName) {
    switch (ticket.channel) {
      case "instagram":
        message = await InstagramSendMessagesSystem(
          getInstaBot(ticket.whatsappId),
          ticket,
          { ...messageData, media }
        );
        break;

      case "telegram":
        message = await TelegramSendMessagesSystem(
          getTbot(ticket.whatsappId),
          ticket,
          { ...messageData, media }
        );
        break;

      case "baileys":
        message = await SendBaileysMessage({
          body: messageData.body,
          ticket,
          quotedMsg: messageData?.quotedMsg,
          userId,
          mediaPath: media?.path || media?.filename,
          mediaType: media?.mimetype?.split("/")[0]
        });
        break;

      default:
        message = await SendWhatsAppMedia({ media, ticket, userId });
        break;
    }
  }

  if (!media) {
    switch (ticket.channel) {
      case "instagram":
        message = await InstagramSendMessagesSystem(
          getInstaBot(ticket.whatsappId),
          ticket,
          messageData
        );
        break;

      case "telegram":
        message = await TelegramSendMessagesSystem(
          getTbot(ticket.whatsappId),
          ticket,
          messageData
        );
        break;

      case "baileys":
        message = await SendBaileysMessage({
          body: messageData.body,
          ticket,
          quotedMsg: messageData?.quotedMsg,
          userId
        });
        break;

      default:
        message = await SendWhatsAppMessage({
          body: messageData.body,
          ticket,
          quotedMsg: messageData?.quotedMsg
        });
        break;
    }
  }

  return message;
};

export default SendMessageSystemProxy;
