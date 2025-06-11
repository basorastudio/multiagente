import { WAMessage } from "@whiskeysockets/baileys";
import AppError from "../errors/AppError";
import GetTicketWbot from "./GetTicketWbot";
import { logger } from "../utils/logger";

const GetWbotMessage = async (
  ticket: any,
  messageId: string
): Promise<WAMessage | null> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    logger.info(`Searching for message ${messageId} using Baileys`);

    return null;
  } catch (err) {
    logger.error(`Error getting Baileys message: ${err}`);
    throw new AppError("ERR_WBOT_MESSAGE_NOT_FOUND");
  }
};

export default GetWbotMessage;
