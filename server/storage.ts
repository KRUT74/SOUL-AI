import { User, InsertUser, CompanionSettings, Message, insertMessageSchema } from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getPreferences(): Promise<{ settings: CompanionSettings } | undefined>;
  setPreferences(prefs: { settings: CompanionSettings }): Promise<{ settings: CompanionSettings }>;
  getMessages(): Promise<Message[]>;
  addMessage(message: Omit<Message, "id">): Promise<Message>;
}

class MemoryStorage implements IStorage {
  private users: User[] = [];
  private nextId = 1;
  private nextMessageId = 1;
  private preferences?: { settings: CompanionSettings };
  private messages: Message[] = [];

  async createUser(userData: InsertUser): Promise<User> {
    // Check if username exists (case-insensitive)
    const existingUser = await this.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const user: User = {
      id: this.nextId++,
      username: userData.username,
      password: userData.password,
      createdAt: new Date()
    };

    this.users.push(user);
    console.log('Created user:', { id: user.id, username: user.username });
    console.log('Current users in storage:', this.users.map(u => ({ id: u.id, username: u.username })));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    console.log(`Looking up user by id ${id}:`, user ? { id: user.id, username: user.username } : 'not found');
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    console.log(`Looking up user by username ${username}:`, user ? { id: user.id, username: user.username } : 'not found');
    return user;
  }

  async getPreferences(): Promise<{ settings: CompanionSettings } | undefined> {
    console.log('Getting preferences:', this.preferences);
    return this.preferences;
  }

  async setPreferences(prefs: { settings: CompanionSettings }): Promise<{ settings: CompanionSettings }> {
    this.preferences = prefs;
    console.log('Saved preferences:', this.preferences);
    return prefs;
  }

  async getMessages(): Promise<Message[]> {
    return this.messages;
  }

  async addMessage(messageData: Omit<Message, "id">): Promise<Message> {
    const message: Message = {
      ...messageData,
      id: this.nextMessageId++
    };

    this.messages.push(message);
    console.log('Added message:', message);
    return message;
  }
}

export const storage = new MemoryStorage();