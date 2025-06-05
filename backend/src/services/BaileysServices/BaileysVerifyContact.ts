import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const BaileysVerifyContact = async (
  remoteJid: string,
  tenantId: string | number
): Promise<Contact> => {
  const number = remoteJid.replace("@s.whatsapp.net", "").replace("@c.us", "");
  
  let contact = await Contact.findOne({
    where: { number, tenantId }
  });

  if (!contact) {
    contact = await Contact.create({
      name: number,
      number,
      tenantId,
      isGroup: false
    });
    
    logger.info(`Novo contato criado: ${number}`);
  }

  return contact;
};

export default BaileysVerifyContact;