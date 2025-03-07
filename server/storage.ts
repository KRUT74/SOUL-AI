import { 
  Message, InsertMessage, 
  Companion, InsertCompanion,
  User, InsertUser,
} from "@shared/schema";

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

// Simple in-memory storage for testing
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private companions: Companion[] = [];
  private messages: Message[] = [];
  private nextUserId = 1;
  private nextCompanionId = 1;
  private nextMessageId = 1;

  // User operations
  async createUser(userData: InsertUser): Promise<User> {
    // Check if username exists
    const existing = this.users.find(u => u.username === userData.username);
    if (existing) {
      throw new Error("Username already exists");
    }

    const user: User = {
      id: this.nextUserId++,
      username: userData.username,
      password: userData.password,
      createdAt: new Date(),
    };

    this.users.push(user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  // Companion operations
  async getCompanion(id: number): Promise<Companion | undefined> {
    return this.companions.find(c => c.id === id);
  }

  async getCompanionsByUserId(userId: number): Promise<Companion[]> {
    return this.companions.filter(c => c.userId === userId);
  }

  async createCompanion(companionData: InsertCompanion): Promise<Companion> {
    const companion: Companion = {
      id: this.nextCompanionId++,
      userId: companionData.userId,
      settings: companionData.settings,
      createdAt: new Date(),
    };

    this.companions.push(companion);
    return companion;
  }

  // Message operations
  async getMessagesByCompanionId(companionId: number): Promise<Message[]> {
    return this.messages.filter(m => m.companionId === companionId);
  }

  async addMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      ...messageData,
    };

    this.messages.push(message);
    return message;
  }
}

export const storage = new MemoryStorage();