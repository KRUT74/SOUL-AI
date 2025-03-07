import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, companions, messages } from '@shared/schema';
import type { User, InsertUser, CompanionSettings, Message } from '@shared/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getPreferences(userId: number): Promise<{ settings: CompanionSettings } | undefined>;
  setPreferences(userId: number, prefs: { settings: CompanionSettings }): Promise<{ settings: CompanionSettings }>;
  getMessages(userId: number): Promise<Message[]>;
  addMessage(userId: number, message: Omit<Message, "id">): Promise<Message>;
}

class DatabaseStorage implements IStorage {
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);

    const [user] = await db.insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      });

    console.log('Created user:', { id: user.id, username: user.username });
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    console.log(`Looking up user by id ${id}:`, user ? { id: user.id, username: user.username } : 'not found');
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<(User & { password: string }) | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    console.log(`Looking up user by username ${username}:`, user ? { id: user.id, username: user.username } : 'not found');
    return user || undefined;
  }

  async getPreferences(userId: number): Promise<{ settings: CompanionSettings } | undefined> {
    const companion = await db.query.companions.findFirst({
      where: eq(companions.userId, userId),
    });

    if (!companion) return undefined;

    return {
      settings: {
        name: companion.name,
        personality: companion.personality,
        interests: companion.interests,
        avatar: companion.avatar,
      }
    };
  }

  async setPreferences(userId: number, prefs: { settings: CompanionSettings }): Promise<{ settings: CompanionSettings }> {
    const { settings } = prefs;

    // Delete existing companion if any
    await db.delete(companions)
      .where(eq(companions.userId, userId));

    // Create new companion
    await db.insert(companions)
      .values({
        userId,
        name: settings.name,
        personality: settings.personality,
        interests: settings.interests,
        avatar: settings.avatar,
      });

    console.log('Saved preferences for user:', userId);
    return prefs;
  }

  async getMessages(userId: number): Promise<Message[]> {
    const dbMessages = await db.query.messages.findMany({
      where: eq(messages.userId, userId),
      orderBy: (messages, { asc }) => [asc(messages.timestamp)],
    });

    return dbMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as "user" | "assistant",
      timestamp: msg.timestamp,
    }));
  }

  async addMessage(userId: number, messageData: Omit<Message, "id">): Promise<Message> {
    const [message] = await db.insert(messages)
      .values({
        userId,
        content: messageData.content,
        role: messageData.role,
        timestamp: messageData.timestamp,
      })
      .returning();

    console.log('Added message:', message);
    return {
      id: message.id,
      content: message.content,
      role: message.role as "user" | "assistant",
      timestamp: message.timestamp,
    };
  }

  async verifyPassword(username: string, password: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    return comparePasswords(password, user.password);
  }
}

export const storage = new DatabaseStorage();