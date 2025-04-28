import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";

interface Request {
  id: string;
  tenantId: number | string;
}

const DeleteCampaignService = async ({
  id,
  tenantId
}: Request): Promise<void> => {
  const campaign = await Campaign.findOne({
    where: { id, tenantId }
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  // Eliminada la restricción de estado para permitir borrar cualquier campaña

  try {
    await campaign.destroy();
  } catch (error) {
    throw new AppError("ERROR_CAMPAIGN_NOT_EXISTS", 404);
  }
};

export default DeleteCampaignService;
