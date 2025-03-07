import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define companion settings schema
export const companionSettings = z.object({
  name: z.string().min(1),
  personality: z.string().min(1),
  interests: z.array(z.string()),
  avatar: z.string().optional(),
});

export type CompanionSettings = z.infer<typeof companionSettings>;

// Define message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: integer("timestamp").notNull(),
});

// Define user preferences
export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  settings: jsonb("settings").$type<CompanionSettings>().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  role: true,
  timestamp: true,
});

export const insertPreferencesSchema = createInsertSchema(preferences).pick({
  settings: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Message = typeof messages.$inferSelect;
export type Preferences = typeof preferences.$inferSelect;
