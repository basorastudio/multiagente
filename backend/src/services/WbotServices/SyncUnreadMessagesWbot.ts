import { WASocket } from "@whiskeysockets/baileys";
import { logger } from "../../utils/logger";

const SyncUnreadMessagesWbot = async (
  wbot: WASocket,
  tenantId: string | number
): Promise<void> => {
  try {
    logger.info(`SyncUnreadMessagesWbot - Syncing unread messages for tenant: ${tenantId}`);
  } catch (err) {
    logger.error(`Error syncing unread messages: ${err}`);
  }
};

export default SyncUnreadMessagesWbot;
