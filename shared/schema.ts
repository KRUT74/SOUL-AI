import { pgTable, text, serial, bigint, jsonb, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define companion settings schema
export const companionSettings = z.object({
  name: z.string().min(1),
  personality: z.string().min(1),
  interests: z.array(z.string()),
  avatar: z.string().optional(),
});

export type CompanionSettings = z.infer<typeof companionSettings>;

// Define companions (formerly preferences)
export const companions = pgTable("companions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
  settings: jsonb("settings").$type<CompanionSettings>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  companionId: serial("companion_id").references(() => companions.id).notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

// Define relationships
export const companionsRelations = relations(companions, ({ one, many }) => ({
  user: one(users, {
    fields: [companions.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  companion: one(companions, {
    fields: [messages.companionId],
    references: [companions.id],
  }),
}));

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCompanionSchema = createInsertSchema(companions).pick({
  userId: true,
  settings: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  companionId: true,
  content: true,
  role: true,
  timestamp: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompanion = z.infer<typeof insertCompanionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type User = typeof users.$inferSelect;
export type Companion = typeof companions.$inferSelect;
export type Message = typeof messages.$inferSelect;