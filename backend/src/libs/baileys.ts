import {
  WASocket,
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as path from "path";
import * as fs from "fs";
import { logger } from "../utils/logger";
import Whatsapp from "../models/Whatsapp";

interface Session {
  id: number;
  socket: WASocket;
}

const sessions: Session[] = [];

export const initBaileys = async (whatsapp: Whatsapp): Promise<WASocket> => {
  const sessionPath = path.join(__dirname, "..", "..", "..", "baileys_sessions", `session_${whatsapp.id}`);
  
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  logger.info(`Usando Baileys v${version.join(".")}, isLatest: ${isLatest}`);

  const store = makeInMemoryStore({ logger });
  store.readFromFile(path.join(sessionPath, "baileys_store.json"));

  setInterval(() => {
    store.writeToFile(path.join(sessionPath, "baileys_store.json"));
  }, 10_000);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    shouldIgnoreJid: (jid) => {
      return !!(jid?.endsWith("@g.us") || jid?.endsWith("@broadcast"));
    },
    generateHighQualityLinkPreview: true
  });

  store.bind(sock.ev);

  const sessionIndex = sessions.findIndex((s) => s.id === Number(whatsapp.id));
  if (sessionIndex === -1) {
    sessions.push({ id: Number(whatsapp.id), socket: sock });
  } else {
    sessions[sessionIndex].socket = sock;
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info(`QR Code gerado para WhatsApp ID: ${whatsapp.id}`);
      
      await whatsapp.update({
        qrcode: qr,
        status: "qrcode",
        retries: 0
      });
    }

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      
      logger.info(`Conexão Baileys fechada para WhatsApp ID: ${whatsapp.id}, reconectando: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        setTimeout(() => {
          initBaileys(whatsapp);
        }, 2000);
      } else {
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: "",
          retries: 0
        });
      }
    }

    if (connection === "open") {
      logger.info(`Conexão Baileys aberta para WhatsApp ID: ${whatsapp.id}`);
      
      const info = sock.user;
      const number = sock.user?.id?.split(":")[0];

      await whatsapp.update({
        status: "CONNECTED",
        qrcode: "",
        retries: 0,
        number: number
      });
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
};

export const getBaileys = (whatsappId: string | number): WASocket => {
  const sessionIndex = sessions.findIndex((s) => s.id === Number(whatsappId));
  
  if (sessionIndex === -1) {
    throw new Error(`Sessão Baileys não encontrada para WhatsApp ID: ${whatsappId}`);
  }

  return sessions[sessionIndex].socket;
};

export const removeBaileys = (whatsappId: string | number): void => {
  const sessionIndex = sessions.findIndex((s) => s.id === Number(whatsappId));
  
  if (sessionIndex !== -1) {
    sessions[sessionIndex].socket.end(undefined);
    sessions.splice(sessionIndex, 1);
    logger.info(`Sessão Baileys removida para WhatsApp ID: ${whatsappId}`);
  }

  // Remover pasta de sessão
  const sessionPath = path.join(__dirname, "..", "..", "..", "baileys_sessions", `session_${whatsappId}`);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    logger.info(`Pasta de sessão Baileys removida: ${sessionPath}`);
  }
};