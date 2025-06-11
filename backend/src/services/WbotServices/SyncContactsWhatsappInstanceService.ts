import { WASocket } from "@whiskeysockets/baileys";
import { getWbot } from "../../libs/wbot";
import { Store } from "../../libs/store";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const SyncContactsWhatsappInstanceService = async (
  whatsappId: number,
  tenantId: number
): Promise<void> => {
  const wbot = getWbot(whatsappId) as Session;

  try {
    // En Baileys, obtenemos los contactos del store
    const contacts = wbot.store?.contacts || {};
    const contactsArray = Object.values(contacts);

    if (contactsArray.length === 0) {
      logger.info("No contacts found in store");
      return;
    }

    for (const contact of contactsArray) {
      try {
        const number = contact.id.replace(/\D/g, "");
        
        if (number && number.length > 10) {
          await CreateOrUpdateContactService({
            name: contact.name || contact.notify || number,
            number,
            isGroup: contact.id.endsWith("@g.us"),
            tenantId,
            pushname: contact.notify || "",
            isUser: true,
            isWAContact: true
          });
        }
      } catch (error) {
        logger.error(`Error syncing contact ${contact.id}:`, error);
      }
    }

    logger.info(`Synced ${contactsArray.length} contacts for WhatsApp ${whatsappId}`);
  } catch (err) {
    logger.error("Error syncing contacts:", err);
    throw new Error("Could not sync contacts from Baileys store.");
  }
};

export default SyncContactsWhatsappInstanceService;
