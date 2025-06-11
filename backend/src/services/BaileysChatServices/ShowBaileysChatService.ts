import BaileysChats from "../../models/BaileysChats";

export const ShowBaileysChatService = async (
  whatsappId: number,
  jid: string,
): Promise<BaileysChats | null> => {
  const baileysChat = await BaileysChats.findOne({
    where: {
      whatsappId,
      jid,
    }
  });

  return baileysChat;
};