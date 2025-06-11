// ARCHIVO TEMPORALMENTE DESACTIVADO PARA MIGRACIÓN A BAILEYS
// import { Contact as WbotContact, Call, Client } from "whatsapp-web.js";
import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import Tenant from "../../models/Tenant";
// import VerifyContact from "./helpers/VerifyContact";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";
// import SendMessagesSystemWbot from "./SendMessagesSystemWbot";

// NOTA: Este archivo está temporalmente desactivado durante la migración a Baileys
// La verificación de llamadas ahora se maneja con Baileys

// interface Session extends Client {
//   id: number;
// }

const VerifyCall = async (call: any, wbot: any): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    logger.info("VerifyCall (whatsapp-web.js) temporarily disabled - using Baileys implementation");
    resolve();
  });
};

export default VerifyCall;
