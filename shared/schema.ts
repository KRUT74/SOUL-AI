import { z } from "zod";
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

// Database schema
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Changed to text for Firebase UID
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const companions = pgTable('companions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(), // Changed to text for Firebase UID
  name: text('name').notNull(),
  personality: text('personality').notNull(),
  interests: text('interests').array().notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(), // Changed to text for Firebase UID
  content: text('content').notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  timestamp: integer('timestamp').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

export const companionSettings = z.object({
  name: z.string().min(1, "Name is required"),
  personality: z.string().min(1, "Personality description is required"),
  interests: z.array(z.string()),
  avatar: z.string().optional(),
});

export const insertMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  role: z.enum(["user", "assistant"]),
  timestamp: z.number(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = Omit<typeof users.$inferSelect, 'password'>;
export type CompanionSettings = z.infer<typeof companionSettings>;
export type Message = z.infer<typeof insertMessageSchema> & {
  id: number;
};