import { WASocket } from "@whiskeysockets/baileys";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { StartBaileysSession } from "./StartBaileysSession";

interface Session extends WASocket {
  id?: number;
}

const baileysMonitor = async (
  baileys: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {
    baileys.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      
      logger.info(`Monitor session: ${sessionName} - Connection: ${connection}`);
      
      try {
        await whatsapp.update({ status: connection || "DISCONNECTED" });
      } catch (err) {
        logger.error(err);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp,
      });

      if (connection === "close") {
        logger.info(`Session: ${sessionName} disconnected`);
        try {
          await whatsapp.update({
            status: "OPENING",
            session: "",
            qrcode: null,
          });

          setTimeout(() => StartBaileysSession(whatsapp), 2000);
        } catch (err) {
          logger.error(err);
        }

        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp,
        });
      }
    });

    // Monitor para cambios de presencia
    baileys.ev.on("presence.update", async (presenceUpdate) => {
      logger.debug(`Presence update for session: ${sessionName}`, presenceUpdate);
    });

    // Monitor para actualizaciones de chat
    baileys.ev.on("chats.update", (chatUpdate) => {
      logger.debug(`Chat update for session: ${sessionName}`, chatUpdate);
    });

  } catch (err) {
    logger.error(`baileysMonitor error: ${err}`);
  }
};

export default baileysMonitor;