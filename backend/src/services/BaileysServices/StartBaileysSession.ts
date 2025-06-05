import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { initBaileys } from "../../libs/baileys";
import BaileysMessageListener from "./BaileysMessageListener";
import BaileysMonitor from "./BaileysMonitor";

export const StartBaileysSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit(`${whatsapp.tenantId}:whatsappSession`, {
    action: "update",
    session: whatsapp,
  });

  try {
    const baileys = await initBaileys(whatsapp);
    BaileysMessageListener(baileys, whatsapp);
    BaileysMonitor(baileys, whatsapp);

    logger.info(`Session Baileys iniciada | Empresa: ${whatsapp.tenantId}`);
  } catch (err) {
    logger.error(`StartBaileysSession | Error: ${err}`);
    await whatsapp.update({ status: "DISCONNECTED" });
    io.emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp,
    });
  }
};