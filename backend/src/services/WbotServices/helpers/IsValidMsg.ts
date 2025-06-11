import { WAMessage } from "@whiskeysockets/baileys";
import { logger } from "../../../utils/logger";

const IsValidMsg = (msg: WAMessage): boolean => {
  try {
    // Validación específica para mensajes de Baileys
    if (!msg || !msg.key) {
      return false;
    }

    // Verificar si el mensaje es válido según los criterios de Baileys
    if (msg.key.fromMe === undefined) {
      return false;
    }

    // Verificar si tiene contenido válido
    if (!msg.message) {
      return false;
    }

    return true;
  } catch (err) {
    logger.error(`Error validating message: ${err}`);
    return false;
  }
};

export default IsValidMsg;
