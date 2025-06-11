/* eslint-disable camelcase */
import * as Sentry from "@sentry/node";
import makeWASocket, {
  WASocket,
  Browsers,
  WAMessage,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  WAMessageKey,
  jidNormalizedUser,
  CacheStore
} from "@whiskeysockets/baileys";
import { Op } from "sequelize";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import authState from "../helpers/authState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import NodeCache from 'node-cache';
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import path from "path";
import { rm } from "fs/promises";

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

const msgRetryCounterCache = new NodeCache({
  stdTTL: 600,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

const msgCache = new NodeCache({
  stdTTL: 60,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

type Session = WASocket & {
  id?: number;
};

const sessions: Session[] = [];
const retriesQrCodeMap = new Map<number, number>();

export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  // Solo limpiar la carpeta de sesiones de Baileys
  const sessionDir = path.resolve(__dirname, "..", "..", "WWebJS", "session");
  const sessionFile = `${sessionDir}/session-wbot-${id}.json`;
  
  try {
    await rm(sessionFile, { force: true });
    logger.info(`Archivo de sesión Baileys removido: ${sessionFile}`);
  } catch (error) {
    logger.info(`Archivo de sesión no encontrado o ya removido: ${sessionFile}`);
  }
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = (
  whatsappId: number,
  isLogout = true
): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        try {
          sessions[sessionIndex].logout();
          sessions[sessionIndex].ws.close();
        } catch (error) {
          logger.error("Error closing session:", error);
        }
      }
      sessions.splice(sessionIndex, 1);
    }
    // Limpar do mapa de tentativas
    retriesQrCodeMap.delete(whatsappId);
  } catch (err) {
    logger.error("removeWbot | err: %s", err);
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        const io = getIO();
        const whatsappUpdate = await Whatsapp.findByPk(whatsapp.id);

        if (!whatsappUpdate) {
          reject(new Error("WhatsApp connection not found"));
          return;
        }

        const { id, name, tenantId } = whatsappUpdate;
        
        // Verificar se já existe uma sessão ativa
        const existingSessionIndex = sessions.findIndex(s => s.id === id);
        if (existingSessionIndex !== -1) {
          logger.info(`Session ${name} já existe, removendo para recriar`);
          removeWbot(id, false);
        }

        const { version, isLatest } = await fetchLatestBaileysVersion();
        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`Starting session ${name}`);

        // Resetar contador de tentativas
        let retriesQrCode = retriesQrCodeMap.get(id) || 0;
        
        let wsocket: Session | null = null;

        // Usar o helper de autenticação
        const { state, saveState } = await authState(whatsapp);

        wsocket = makeWASocket({
          logger: loggerBaileys as any,
          printQRInTerminal: true, // Habilitar impressão no terminal para debug
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, loggerBaileys as any),
          },
          version,
          browser: Browsers.appropriate("Desktop"),
          defaultQueryTimeoutMs: 60000, // Aumentar timeout
          msgRetryCounterCache,
          markOnlineOnConnect: false,
          connectTimeoutMs: 60_000, // Aumentar timeout de conexão
          retryRequestDelayMs: 1000,
          emitOwnEvents: true,
          fireInitQueries: true,
          generateHighQualityLinkPreview: true,
          syncFullHistory: false,
          transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
          shouldIgnoreJid: jid => isJidBroadcast(jid),
        });

        wsocket.ev.on(
          "connection.update",
          async ({ connection, lastDisconnect, qr }) => {
            logger.info(`Socket ${name} Connection Update - Connection: ${connection || "undefined"} - LastDisconnect: ${lastDisconnect?.error?.message || "none"}`);

            const disconect = (lastDisconnect?.error as Boom)?.output?.statusCode;

            if (connection === "close") {
              logger.info(`Connection closed for ${name} - Code: ${disconect}`);
              
              if (disconect === 403) {
                await whatsapp.update({ status: "PENDING", session: "", number: "", qrcode: "" });
                removeWbot(id, false);
                await DeleteBaileysService(whatsapp.id);

                io.emit(`${whatsapp.tenantId}:whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                return;
              }

              if (disconect !== DisconnectReason.loggedOut) {
                logger.info(`Tentando reconectar ${name} em 3 segundos...`);
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.tenantId), 3000);
              } else {
                await whatsapp.update({ status: "PENDING", session: "", number: "", qrcode: "" });
                await DeleteBaileysService(whatsapp.id);

                io.emit(`${whatsapp.tenantId}:whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
              }
            }

            if (connection === "open") {
              logger.info(`Connection opened for ${name}`);
              
              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                number: jidNormalizedUser(wsocket?.user?.id || "")
              });

              io.emit(`${whatsapp.tenantId}:whatsappSession`, {
                action: "update",
                session: whatsapp
              });

              const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
              if (sessionIndex === -1) {
                wsocket!.id = whatsapp.id;
                sessions.push(wsocket as Session);
              }

              // Limpar contador de tentativas após conexão bem-sucedida
              retriesQrCodeMap.delete(id);
              resolve(wsocket as Session);
            }

            if (qr !== undefined) {
              logger.info(`QR Code gerado para ${name} - Tentativa: ${retriesQrCode + 1}`);
              
              if (retriesQrCode >= 4) {
                logger.error(`Máximo de tentativas de QR Code atingido para ${name}`);
                await whatsapp.update({
                  status: "DISCONNECTED",
                  qrcode: "",
                  retries: retriesQrCode
                });
                io.emit(`${whatsapp.tenantId}:whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                wsocket?.ev.removeAllListeners("connection.update");
                wsocket?.ws.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
                reject(new Error("Max QR code retries reached"));
                return;
              }

              retriesQrCode += 1;
              retriesQrCodeMap.set(id, retriesQrCode);

              await whatsapp.update({
                qrcode: qr,
                status: "qrcode",
                retries: retriesQrCode
              });

              const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
              if (sessionIndex === -1) {
                wsocket!.id = whatsapp.id;
                sessions.push(wsocket as Session);
              }

              io.emit(`${whatsapp.tenantId}:whatsappSession`, {
                action: "update",
                session: whatsapp
              });
            }
          }
        );

        wsocket.ev.on("creds.update", saveState);

        // Definir timeout para rejeitar se não conseguir conectar em 2 minutos
        setTimeout(() => {
          logger.error(`Timeout na inicialização da sessão ${name}`);
          reject(new Error("Session initialization timeout"));
        }, 120000);

      })();
    } catch (error) {
      Sentry.captureException(error);
      logger.error("initWbot error:", error);
      reject(error);
    }
  });
};
