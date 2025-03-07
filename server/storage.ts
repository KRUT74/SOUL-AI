import { Message, InsertMessage, Preferences, InsertPreferences } from "@shared/schema";
import { messages, preferences } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  getPreferences(): Promise<Preferences | undefined>;
  setPreferences(prefs: InsertPreferences): Promise<Preferences>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getPreferences(): Promise<Preferences | undefined> {
    const [prefs] = await db.select().from(preferences);
    return prefs;
  }

  async setPreferences(prefs: InsertPreferences): Promise<Preferences> {
    // Delete existing preferences first since we only want one record
    await db.delete(preferences);
    const [newPrefs] = await db.insert(preferences).values(prefs).returning();
    return newPrefs;
  }
}

export const storage = new DatabaseStorage();