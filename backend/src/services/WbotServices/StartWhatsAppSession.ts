import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import wbotMonitor from "./wbotMonitor";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  tenantId: number | string
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit(`${tenantId}:whatsappSession`, {
    action: "update",
    session: whatsapp
  });

  try {
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot, tenantId);
    await wbotMonitor(wbot, whatsapp, Number(tenantId));
  } catch (err) {
    logger.error(`StartWhatsAppSession | Error: ${err}`);
  }
};
