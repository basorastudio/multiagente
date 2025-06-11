import { downloadMediaMessage, WAMessage, getContentType } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";
import { join } from "path";
import { logger } from "../../../utils/logger";

const VerifyMediaMessage = async (
  msg: WAMessage,
  ticket: any,
  contact: any
): Promise<any> => {
  try {
    if (!msg || !msg.message) {
      logger.warn(`Message or message content is null for message: ${msg?.key?.id}`);
      return null;
    }

    const messageType = getContentType(msg.message);
    
    if (!messageType) {
      return null;
    }

    // Verificar si es un mensaje de media
    const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
    
    if (!mediaTypes.includes(messageType)) {
      return null;
    }

    let fileName = "";
    let mimeType = "";

    try {
      // Descargar el media usando Baileys
      const buffer = await downloadMediaMessage(msg, 'buffer', {});
      
      if (!buffer) {
        logger.warn(`No media buffer for message: ${msg.key.id}`);
        return null;
      }

      // Determinar el tipo de archivo y nombre según el tipo de mensaje
      switch (messageType) {
        case 'imageMessage':
          mimeType = msg.message.imageMessage?.mimetype || 'image/jpeg';
          fileName = `image_${msg.key.id}.${mimeType.split('/')[1]}`;
          break;
        case 'videoMessage':
          mimeType = msg.message.videoMessage?.mimetype || 'video/mp4';
          fileName = `video_${msg.key.id}.${mimeType.split('/')[1]}`;
          break;
        case 'audioMessage':
          mimeType = msg.message.audioMessage?.mimetype || 'audio/ogg';
          fileName = `audio_${msg.key.id}.${mimeType.split('/')[1]}`;
          break;
        case 'documentMessage':
          mimeType = msg.message.documentMessage?.mimetype || 'application/octet-stream';
          fileName = msg.message.documentMessage?.fileName || `document_${msg.key.id}`;
          break;
        case 'stickerMessage':
          mimeType = msg.message.stickerMessage?.mimetype || 'image/webp';
          fileName = `sticker_${msg.key.id}.webp`;
          break;
      }

      // Guardar el archivo en el directorio público
      const publicDir = join(__dirname, '..', '..', '..', '..', 'public');
      const filePath = join(publicDir, fileName);
      
      await writeFile(filePath, buffer);

      return {
        mediaType: messageType,
        fileName,
        mimeType,
        filePath: `/public/${fileName}`,
        buffer
      };

    } catch (downloadError) {
      logger.error(`Error downloading media: ${downloadError}`);
      return null;
    }

  } catch (err) {
    logger.error(`Error verifying media message: ${err}`);
    return null;
  }
};

export default VerifyMediaMessage;
