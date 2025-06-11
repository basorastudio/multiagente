import { AuthenticationState, BufferJSON, initAuthCreds, proto, SignalKeyStoreWithTransaction } from "@whiskeysockets/baileys";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

const authState = async (whatsapp: Whatsapp) => {
  const { id: whatsappId } = whatsapp;
  
  // Crear directorio si no existe
  const sessionDir = join(__dirname, "..", "..", "WWebJS", "session");
  const authPath = join(sessionDir, `session-wbot-${whatsappId}.json`);

  // Garantizar que el directorio existe
  if (!existsSync(sessionDir)) {
    try {
      await mkdir(sessionDir, { recursive: true });
      logger.info(`Directorio de sesión creado: ${sessionDir}`);
    } catch (error) {
      logger.error("Error creando directorio de sesión:", error);
    }
  }

  const readAuthState = async (): Promise<AuthenticationState> => {
    try {
      if (!existsSync(authPath)) {
        logger.info(`Archivo de autenticación no existe, creando nuevo: ${authPath}`);
        const creds = initAuthCreds();
        return {
          creds,
          keys: {
            get: async () => null,
            set: async () => {},
            clear: async () => {},
            isInTransaction: () => false,
            transaction: async (work) => work()
          } as SignalKeyStoreWithTransaction
        };
      }

      const data = await readFile(authPath, { encoding: "utf-8" });
      const authState = JSON.parse(data, BufferJSON.reviver);
      logger.info(`Estado de autenticación cargado para WhatsApp ${whatsappId}`);
      return authState;
    } catch (error) {
      logger.error(`Error leyendo estado de autenticación para WhatsApp ${whatsappId}:`, error);
      // En caso de error, crear credenciales nuevas
      const creds = initAuthCreds();
      return {
        creds,
        keys: {
          get: async () => null,
          set: async () => {},
          clear: async () => {},
          isInTransaction: () => false,
          transaction: async (work) => work()
        } as SignalKeyStoreWithTransaction
      };
    }
  };

  const saveState = async (state: AuthenticationState) => {
    try {
      await writeFile(authPath, JSON.stringify(state, BufferJSON.replacer, 2));
      logger.info(`Estado de autenticación guardado para WhatsApp ${whatsappId}`);
    } catch (error) {
      logger.error(`Error guardando estado de autenticación para WhatsApp ${whatsappId}:`, error);
    }
  };

  const state = await readAuthState();

  return {
    state,
    saveState: () => saveState(state)
  };
};

export default authState;