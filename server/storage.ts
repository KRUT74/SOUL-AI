import { User, InsertUser, CompanionSettings } from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getPreferences(): Promise<{ settings: CompanionSettings } | undefined>;
  setPreferences(prefs: { settings: CompanionSettings }): Promise<{ settings: CompanionSettings }>;
}

class MemoryStorage implements IStorage {
  private users: User[] = [];
  private nextId = 1;
  private preferences?: { settings: CompanionSettings };

  async createUser(userData: InsertUser): Promise<User> {
    // Check if username exists
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
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getPreferences(): Promise<{ settings: CompanionSettings } | undefined> {
    return this.preferences;
  }

  async setPreferences(prefs: { settings: CompanionSettings }): Promise<{ settings: CompanionSettings }> {
    this.preferences = prefs;
    console.log('Saved preferences:', prefs);
    return prefs;
  }
}

export const storage = new MemoryStorage();