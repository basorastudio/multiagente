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

  // Permitir eliminar campañas en estado pending, canceled o finished
  if (
    campaign?.status !== "pending" && 
    campaign?.status !== "canceled" && 
    campaign?.status !== "finished"
  ) {
    throw new AppError("ERR_NO_DELETE_CAMPAIGN_INVALID_STATUS", 404);
  }

  try {
    await campaign.destroy();
  } catch (error) {
    throw new AppError("ERROR_CAMPAIGN_NOT_EXISTS", 404);
  }
};

export default DeleteCampaignService;
