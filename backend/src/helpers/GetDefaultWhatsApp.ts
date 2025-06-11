import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

const GetDefaultWhatsApp = async (
  tenantId: number | string,
  userId?: number
): Promise<Whatsapp> => {
  let connection: Whatsapp | null = null;

  const defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: true, tenantId }
  });

  if (defaultWhatsapp?.status === 'CONNECTED') {
    connection = defaultWhatsapp;
  } else {
    const whatsapp = await Whatsapp.findOne({
      where: { status: "CONNECTED", tenantId }
    });
    if (whatsapp) {
      connection = whatsapp;
    }
  }

  if (!connection) {
    throw new AppError(`ERR_NO_DEF_WAPP_FOUND in TENANT ${tenantId}`);
  }

  return connection;
};

export default GetDefaultWhatsApp;
