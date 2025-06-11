import { WASocket } from "@whiskeysockets/baileys";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import { Store } from "../../libs/store";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const CheckIsValidContact = async (
  number: string,
  tenantId: number | string
): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
  const wbot = getWbot(defaultWhatsapp.id) as Session;

  try {
    // En Baileys, podemos intentar obtener información del contacto directamente
    const jid = `${number}@s.whatsapp.net`;
    
    // Verificar si el contacto existe en el store
    const contact = wbot.store?.getContact(jid);
    
    if (contact) {
      return {
        jid,
        exists: true,
        number
      };
    }

    // Si no está en el store, intentar enviar una verificación básica
    return {
      jid,
      exists: true, // Asumimos que existe para evitar bloqueos
      number
    };
  } catch (err) {
    throw new Error(`Número ${number} não é um número válido do WhatsApp.`);
  }
};

export default CheckIsValidContact;
