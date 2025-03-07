import { 
  Message, InsertMessage, 
  Companion, InsertCompanion,
  User, InsertUser,
  messages, companions, users 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Companion operations
  getCompanion(id: number): Promise<Companion | undefined>;
  getCompanionsByUserId(userId: number): Promise<Companion[]>;
  createCompanion(companion: InsertCompanion): Promise<Companion>;

  // Message operations
  getMessagesByCompanionId(companionId: number): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(user: InsertUser): Promise<User> {
    try {
      const hashedPassword = await hashPassword(user.password);
      const [newUser] = await db.insert(users)
        .values({
          ...user,
          password: hashedPassword,
        })
        .returning();
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  // Companion operations
  async getCompanion(id: number): Promise<Companion | undefined> {
    const [companion] = await db.select().from(companions).where(eq(companions.id, id));
    return companion;
  }

  async getCompanionsByUserId(userId: number): Promise<Companion[]> {
    return await db.select()
      .from(companions)
      .where(eq(companions.userId, userId));
  }

  async createCompanion(companion: InsertCompanion): Promise<Companion> {
    const [newCompanion] = await db.insert(companions)
      .values(companion)
      .returning();
    return newCompanion;
  }

  // Message operations
  async getMessagesByCompanionId(companionId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.companionId, companionId))
      .orderBy(messages.timestamp);
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();