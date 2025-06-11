import { WASocket } from "@whiskeysockets/baileys";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { Store } from "../../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const GetProfilePicUrl = async (
  number: string,
  tenantId: number | string
): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
  const wbot = getWbot(defaultWhatsapp.id) as Session;

  try {
    const jid = `${number}@s.whatsapp.net`;
    
    // En Baileys, usamos profilePictureUrl en lugar de getProfilePicUrl
    const profilePicUrl = await wbot.profilePictureUrl(jid, 'image');
    
    return profilePicUrl || "";
  } catch (err) {
    return "";
  }
};

export default GetProfilePicUrl;
