import { Op } from "sequelize";
// import { initInstaBot } from "../../libs/InstaBot";
import Whatsapp from "../../models/Whatsapp";
import { StartInstaBotSession } from "../InstagramBotServices/StartInstaBotSession";
import { StartMessengerBot } from "../MessengerChannelServices/StartMessengerBot";
import { StartTbotSession } from "../TbotServices/StartTbotSession";
import { StartWaba360 } from "../WABA360/StartWaba360";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
import { StartBaileysSession } from "../BaileysServices/StartBaileysSession";
// import { StartTbotSession } from "../TbotServices/StartTbotSession";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  const whatsapps = await Whatsapp.findAll({
    where: {
      [Op.or]: [
        {
          [Op.and]: {
            type: {
              [Op.in]: ["instagram", "telegram", "waba", "messenger", "baileys"]
            },
            status: {
              [Op.notIn]: ["DISCONNECTED"]
            }
          }
        },
        {
          [Op.and]: {
            type: "whatsapp"
          },
          status: {
            [Op.notIn]: ["DISCONNECTED", "qrcode"]
            // "DISCONNECTED"
          }
        }
      ],
      isActive: true
    }
  });
  const whatsappSessions = whatsapps.filter(w => w.type === "whatsapp");
  const baileysSessions = whatsapps.filter(w => w.type === "baileys");
  const telegramSessions = whatsapps.filter(
    w => w.type === "telegram" && !!w.tokenTelegram
  );
  const instagramSessions = whatsapps.filter(w => w.type === "instagram");
  const waba360Sessions = whatsapps.filter(w => w.type === "waba");
  const messengerSessions = whatsapps.filter(w => w.type === "messenger");

  if (whatsappSessions.length > 0) {
    whatsappSessions.forEach(whatsapp => {
      StartWhatsAppSession(whatsapp);
    });
  }

  if (baileysSessions.length > 0) {
    baileysSessions.forEach(whatsapp => {
      StartBaileysSession(whatsapp);
    });
  }

  if (telegramSessions.length > 0) {
    telegramSessions.forEach(whatsapp => {
      StartTbotSession(whatsapp);
    });
  }

  if (instagramSessions.length > 0) {
    instagramSessions.forEach(whatsapp => {
      StartInstaBotSession(whatsapp);
    });
  }

  if (waba360Sessions.length > 0) {
    waba360Sessions.forEach(whatsapp => {
      StartWaba360(whatsapp);
    });
  }

  if (messengerSessions.length > 0) {
    messengerSessions.forEach(whatsapp => {
      StartMessengerBot(whatsapp);
    });
  }
};
