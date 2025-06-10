import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import { logger } from "../utils/logger";

// CONVERTIR MP3 A MP4
const convertMp3ToMp4 = (input: string, outputMP4: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath);
    logger.info(`Convirtiendo ${input} a ${outputMP4}`);

    if (!fs.existsSync(input)) {
      const errorMsg = `El archivo de entrada no existe: ${input}`;
      logger.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    ffmpeg(input)
      .inputFormat("mp3")
      .output(outputMP4)
      .outputFormat("mp4")
      .on("start", (commandLine) => {
        logger.info(`Comando Ffmpeg iniciado: ${commandLine}`);
      })
      .on("error", (error: Error) => {
        logger.info(`Error de codificación: ${error.message}`);
        reject(error);
      })
      .on("progress", (progress) => {
        logger.info(`Procesando: ${progress.percent}% completado`);
      })
      .on("end", () => {
        logger.info("¡Transcodificación de video exitosa!");
        resolve();
      })
      .run();
  });
};

export { convertMp3ToMp4 };