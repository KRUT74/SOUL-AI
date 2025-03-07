import { User, InsertUser } from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
}

class MemoryStorage implements IStorage {
  private users: User[] = [];
  private nextId = 1;

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
}

export const storage = new MemoryStorage();