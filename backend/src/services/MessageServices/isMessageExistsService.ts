import { WAMessage } from "@whiskeysockets/baileys";
import { logger } from "../../utils/logger";

const isMessageExistsService = async (
  msg: WAMessage
): Promise<boolean> => {
  try {
    logger.info(`isMessageExistsService - Checking message: ${msg.key.id}`);

    return false; 
  } catch (err) {
    logger.error(`Error checking if message exists: ${err}`);
    return false;
  }
};

export default isMessageExistsService;
