import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import { removeBaileys, getBaileys } from "../libs/baileys";
import { apagarPastaSessao } from "../helpers/apagarPastaSessao";
import { apagarPastaSessaoBaileys } from "../services/BaileysServices/BaileysDeleteSession";

import StartWhatsAppSession from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  const whatsapp = await ShowWhatsAppService({
    id: whatsappId,
    tenantId,
    isInternal: true
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { isQrcode } = req.body;
  const { tenantId } = req.user;

  const whatsapp = await ShowWhatsAppService({
    id: whatsappId,
    tenantId,
    isInternal: true
  });

  if (isQrcode) {
    if (whatsapp.type === "whatsapp") {
      await apagarPastaSessao(whatsappId);
    } else if (whatsapp.type === "baileys") {
      await apagarPastaSessaoBaileys(whatsappId);
    }
  }

  const { whatsapp: updatedWhatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" },
    tenantId
  });

  StartWhatsAppSession(updatedWhatsapp);
  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  const channel = await ShowWhatsAppService({ id: whatsappId, tenantId });

  const io = getIO();

  try {
    if (channel.type === "whatsapp") {
      const wbot = getWbot(channel.id);
      await setValue(`${channel.id}-retryQrCode`, 0);
      await wbot
        .logout()
        .catch(error => logger.error("Erro ao fazer logout da conexão", error));
      removeWbot(channel.id);
    }

    if (channel.type === "baileys") {
      const baileys = getBaileys(channel.id);
      await baileys.logout()
        .catch(error => console.error("Erro ao fazer logout Baileys", error));
      removeBaileys(channel.id);
    }

    if (channel.type === "telegram") {
      const tbot = getTbot(channel.id);
      await tbot.telegram
        .logOut()
        .catch(error => logger.error("Erro ao fazer logout da conexão", error));
      removeTbot(channel.id);
    }

    if (channel.type === "instagram") {
      const instaBot = getInstaBot(channel.id);
      // await instaBot.destroy();
      removeInstaBot(channel.id);
    }
  } catch (error) {
    logger.error(error);
  }

  await channel.update({
    status: "DISCONNECTED",
    session: "",
    qrcode: "",
    retries: 0
  });

  io.emit(`${tenantId}:whatsappSession`, {
    action: "update",
    session: channel
  });

  return res.status(200).json({ message: "Session disconnected." });
};

export { store, remove, update };
