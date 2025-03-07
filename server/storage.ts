import { 
  Message, InsertMessage, 
  Companion, InsertCompanion,
  User, InsertUser
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

export class MemoryStorage implements IStorage {
  private users: Map<number, User>;
  private companions: Map<number, Companion>;
  private messages: Map<number, Message>;
  private nextUserId: number;
  private nextCompanionId: number;
  private nextMessageId: number;

  constructor() {
    this.users = new Map();
    this.companions = new Map();
    this.messages = new Map();
    this.nextUserId = 1;
    this.nextCompanionId = 1;
    this.nextMessageId = 1;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Check if username exists using case-insensitive comparison
    const existingUser = Array.from(this.users.values()).find(
      u => u.username.toLowerCase() === userData.username.toLowerCase()
    );

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const user: User = {
      id: this.nextUserId++,
      username: userData.username,
      password: userData.password,
      createdAt: new Date()
    };

    this.users.set(user.id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getCompanion(id: number): Promise<Companion | undefined> {
    return this.companions.get(id);
  }

  async getCompanionsByUserId(userId: number): Promise<Companion[]> {
    return Array.from(this.companions.values()).filter(c => c.userId === userId);
  }

  async createCompanion(companionData: InsertCompanion): Promise<Companion> {
    const companion: Companion = {
      id: this.nextCompanionId++,
      userId: companionData.userId,
      settings: companionData.settings,
      createdAt: new Date()
    };

    this.companions.set(companion.id, companion);
    return companion;
  }

  async getMessagesByCompanionId(companionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.companionId === companionId);
  }

  async addMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      ...messageData
    };

    this.messages.set(message.id, message);
    return message;
  }
}

// Create a single instance of the storage
export const storage = new MemoryStorage();