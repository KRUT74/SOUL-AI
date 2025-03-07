import { z } from "zod";

// User schema
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & {
  id: number;
  createdAt: Date;
};