import { WASocket, Chat, Contact, WAMessage, WAMessageUpdate } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger";
import createOrUpdateBaileysService from "../services/BaileysServices/CreateOrUpdateBaileysService";
import { CreateOrUpdateBaileysChatService } from "../services/BaileysChatServices/CreateOrUpdateBaileysChatService";

export class Store {
  chats: { [key: string]: Chat } = {};
  contacts: { [key: string]: Contact } = {};
  messages: { [key: string]: WAMessage[] } = {};

  bind(ev: WASocket["ev"]) {
    ev.on("chats.upsert", this.chatsUpsert.bind(this));
    ev.on("contacts.upsert", this.contactsUpsert.bind(this));
    ev.on("messages.upsert", this.messagesUpsert.bind(this));
    ev.on("messages.update", this.messagesUpdate.bind(this));
    ev.on("presence.update", this.presenceUpdate.bind(this));
  }

  private chatsUpsert(chats: Chat[]) {
    for (const chat of chats) {
      this.chats[chat.id] = chat;
    }
  }

  private contactsUpsert(contacts: Contact[]) {
    for (const contact of contacts) {
      this.contacts[contact.id] = contact;
    }
  }

  private messagesUpsert({ messages, type }: { messages: WAMessage[]; type: "append" | "notify" }) {
    for (const message of messages) {
      const jid = message.key.remoteJid!;
      if (!this.messages[jid]) this.messages[jid] = [];
      
      const messageIndex = this.messages[jid].findIndex(m => m.key.id === message.key.id);
      if (messageIndex !== -1) {
        this.messages[jid][messageIndex] = message;
      } else {
        this.messages[jid].push(message);
      }
    }
  }

  private messagesUpdate(updates: WAMessageUpdate[]) {
    for (const { key, update } of updates) {
      const jid = key.remoteJid;
      if (!jid || !this.messages[jid]) continue;
      
      const messageIndex = this.messages[jid].findIndex(m => m.key.id === key.id);
      if (messageIndex !== -1) {
        Object.assign(this.messages[jid][messageIndex], update);
      }
    }
  }

  private presenceUpdate({ id, presences }: { id: string; presences: { [participant: string]: any } }) {
    // Handle presence updates if needed
  }

  getChat(jid: string): Chat | undefined {
    return this.chats[jid];
  }

  getContact(jid: string): Contact | undefined {
    return this.contacts[jid];
  }

  getMessages(jid: string): WAMessage[] {
    return this.messages[jid] || [];
  }

  getMessage(jid: string, messageId: string): WAMessage | undefined {
    const messages = this.getMessages(jid);
    return messages.find(m => m.key.id === messageId);
  }
}