import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger";

export const apagarPastaSessaoBaileys = async (whatsappId: string | number): Promise<void> => {
  const sessionsPath = path.join(__dirname, "..", "..", "..", "baileys_sessions");
  const sessionPath = path.join(sessionsPath, `session_${whatsappId}`);

  try {
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      logger.info(`Pasta de sessão Baileys removida: ${sessionPath}`);
    } else {
      logger.info(`Pasta de sessão Baileys não existe: ${sessionPath}`);
    }
  } catch (error) {
    logger.error(`Erro ao remover pasta de sessão Baileys: ${error}`);
  }
};