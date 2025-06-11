import path from "path";
import { readdir } from "fs/promises";
import { getIO } from "../libs/socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

export const diagnosticQR = async (whatsappId: number) => {
  try {
    logger.info("=== INICIO DIAGNÓSTICO QR ===");
    logger.info(`WhatsApp ID: ${whatsappId}`);
    
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      logger.error(`WhatsApp ${whatsappId} no encontrado`);
      return;
    }
    
    logger.info(`Status: ${whatsapp.status}`);
    logger.info(`Nombre: ${whatsapp.name}`);
    logger.info(`Número: ${whatsapp.number || "Sin número"}`);
    logger.info(`QR Code: ${whatsapp.qrcode ? "Presente" : "Ausente"}`);
    logger.info(`Intentos: ${whatsapp.retries}`);
    
    // Solo verificar directorio de sesiones de Baileys
    const sessionDir = path.resolve(__dirname, "..", "..", "WWebJS", "session");
    
    try {
      const files = await readdir(sessionDir);
      const sessionFiles = files.filter(file => file.includes(`session-wbot-${whatsappId}`));
      logger.info(`Archivos de sesión Baileys: ${sessionFiles.length} - ${sessionFiles.join(', ')}`);
    } catch (err) {
      logger.warn("Directorio de sesiones Baileys no existe");
    }
    
    logger.info("=== FIN DIAGNÓSTICO ===");
    
  } catch (error) {
    logger.error("Error en diagnóstico QR:", error);
  }
};

export const forceQRRegeneration = async (whatsappId: number) => {
  try {
    logger.info(`Forzando regeneración de QR para WhatsApp ID: ${whatsappId}`);
    
    const whatsapp = await Whatsapp.findByPk(whatsappId);
    if (!whatsapp) {
      logger.error(`WhatsApp ${whatsappId} no encontrado`);
      return;
    }
    
    // Limpiar estado
    await whatsapp.update({
      status: "OPENING",
      qrcode: "",
      session: "",
      retries: 0
    });
    
    const io = getIO();
    io.emit(`${whatsapp.tenantId}:whatsappSession`, {
      action: "update",
      session: whatsapp
    });
    
    logger.info(`Estado limpiado para WhatsApp ${whatsappId}, iniciando nueva sesión...`);
    
  } catch (error) {
    logger.error("Error forzando regeneración QR:", error);
  }
};