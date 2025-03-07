import { Message, InsertMessage, Preferences, InsertPreferences, CompanionSettings } from "@shared/schema";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  getPreferences(): Promise<Preferences | undefined>;
  setPreferences(prefs: InsertPreferences): Promise<Preferences>;
}

export class MemStorage implements IStorage {
  private messages: Map<number, Message>;
  private preferences: Preferences | undefined;
  private currentMessageId: number;
  private currentPrefsId: number;

  constructor() {
    this.messages = new Map();
    this.currentMessageId = 1;
    this.currentPrefsId = 1;
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = { ...message, id };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getPreferences(): Promise<Preferences | undefined> {
    return this.preferences;
  }

  async setPreferences(prefs: InsertPreferences): Promise<Preferences> {
    const id = this.currentPrefsId;
    this.preferences = { ...prefs, id };
    return this.preferences;
  }
}

export const storage = new MemStorage();
