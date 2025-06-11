import { Contact as BaileysContact } from "@whiskeysockets/baileys";
import Contact from "../../../models/Contact";
import CreateOrUpdateContactService from "../../ContactServices/CreateOrUpdateContactService";

type ContactType = BaileysContact | any;

const VerifyContact = async (
  msgContact: ContactType,
  tenantId: string | number
): Promise<Contact> => {
  let profilePicUrl;

  // Solo manejar contactos de Baileys
  profilePicUrl = undefined; // Para Baileys necesitaremos obtener la imagen por separado

  // Extraer datos del contacto adaptándose al formato de Baileys
  const number =
    msgContact.id?.user ||
    msgContact.id?.split("@")[0] ||
    msgContact.number ||
    msgContact.id;

  const name =
    msgContact.name ||
    msgContact.pushName ||
    msgContact.notify ||
    msgContact.verifiedName ||
    number;

  const contactData = {
    name,
    number,
    profilePicUrl,
    tenantId,
    pushname: name,
    isUser: true,
    isWAContact: true,
    isGroup: msgContact.id?.includes("@g.us") || false
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

export default VerifyContact;
