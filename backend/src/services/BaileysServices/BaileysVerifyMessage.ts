import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";

interface MessageData {
  id: string;
  body: string;
  fromMe: boolean;
  messageId: string;
  timestamp: number;
  quotedMsgId?: string;
}

const BaileysVerifyMessage = async (
  msgData: MessageData,
  ticket: any,
  contact: any
): Promise<void> => {
  try {
    const quotedMsg = msgData.quotedMsgId ? await getQuotedMessage(msgData.quotedMsgId) : null;

    const messageData = {
      messageId: msgData.id,
      ticketId: ticket.id,
      contactId: contact.id,
      body: msgData.body,
      fromMe: msgData.fromMe,
      read: false,
      mediaType: "chat",
      timestamp: msgData.timestamp,
      quotedMsgId: quotedMsg?.id
    };

    await CreateMessageService({
      messageData,
      tenantId: ticket.tenantId
    });

    await ticket.update({
      lastMessage: msgData.body,
      lastMessageAt: new Date(msgData.timestamp),
      answered: false
    });

    logger.info(`Mensagem de texto processada: ${msgData.id}`);
  } catch (error) {
    logger.error(`Erro ao verificar mensagem Baileys: ${error}`);
    throw error;
  }
};

const getQuotedMessage = async (quotedMsgId: string): Promise<any> => {
  try {
    const { default: Message } = await import("../../models/Message");
    return await Message.findOne({
      where: { messageId: quotedMsgId }
    });
  } catch (error) {
    logger.error(`Erro ao buscar mensagem citada: ${error}`);
    return null;
  }
};

export default BaileysVerifyMessage;