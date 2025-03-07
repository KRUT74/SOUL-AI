import { 
  Message, InsertMessage, 
  Companion, InsertCompanion,
  User, InsertUser,
  messages, companions, users 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
    console.log('Attempting to create user:', { username: user.username });

    try {
      // First check if user exists
      const existingUser = await this.getUserByUsername(user.username);
      console.log('Existing user check result:', existingUser);

      if (existingUser) {
        console.log('Username already exists:', user.username);
        throw new Error("Username already exists");
      }

      // Create new user
      const [newUser] = await db.insert(users)
        .values({
          username: user.username,
          password: user.password
        })
        .returning();

      console.log('Successfully created user:', { username: newUser.username, id: newUser.id });
      return newUser;
    } catch (error: any) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log('Looking up user by username:', username);
    const [user] = await db.select().from(users).where(eq(users.username, username));
    console.log('User lookup result:', user ? 'found' : 'not found');
    return user;
  }

  // Rest of the implementation remains unchanged
  async getCompanion(id: number): Promise<Companion | undefined> {
    const [companion] = await db.select().from(companions).where(eq(companions.id, id));
    return companion;
  }

  async getCompanionsByUserId(userId: number): Promise<Companion[]> {
    return await db.select().from(companions).where(eq(companions.userId, userId));
  }

  async createCompanion(companion: InsertCompanion): Promise<Companion> {
    const [newCompanion] = await db.insert(companions).values(companion).returning();
    return newCompanion;
  }

  async getMessagesByCompanionId(companionId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.companionId, companionId))
      .orderBy(messages.timestamp);
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();