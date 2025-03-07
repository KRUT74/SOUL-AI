import { z } from "zod";

// User schema with validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Companion settings schema
export const companionSettings = z.object({
  name: z.string().min(1, "Name is required"),
  personality: z.string().min(1, "Personality description is required"),
  interests: z.array(z.string()),
  avatar: z.string().optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & {
  id: number;
  createdAt: Date;
};

export type CompanionSettings = z.infer<typeof companionSettings>;