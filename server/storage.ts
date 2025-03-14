import { adminFirestore } from "./firebase";
import * as bcrypt from "bcrypt";
import { db } from "./db";
import { companions } from "@shared/schema";
import { eq } from "drizzle-orm";

// Collections
const usersCollection = adminFirestore.collection("users");
const companionsCollection = adminFirestore.collection("companions");
const messagesCollection = adminFirestore.collection("messages");

// User operations
export const storage = {
  // User CRUD operations
  async createUser({ username, password }: { username: string; password: string }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDoc = await usersCollection.add({
      username,
      password: hashedPassword,
      createdAt: Date.now()
    });

    return { 
      id: userDoc.id, 
      username,
      createdAt: new Date()
    };
  },

  async getUserByUsername(username: string) {
    const snapshot = await usersCollection.where("username", "==", username).limit(1).get();

    if (snapshot.empty) return null;

    const userData = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      username: userData.username,
      password: userData.password,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
    };
  },

  async getUserById(id: string) {
    const doc = await usersCollection.doc(id).get();

    if (!doc.exists) return null;

    const userData = doc.data();
    return {
      id: doc.id,
      username: userData?.username,
      createdAt: userData?.createdAt ? new Date(userData.createdAt) : new Date()
    };
  },

  async verifyPassword(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (!user) return false;

    return bcrypt.compare(password, user.password);
  },

  // Companion CRUD operations
  async createCompanion({ userId, name, personality, interests, avatar }: { 
    userId: string; 
    name: string; 
    personality: string; 
    interests: string[]; 
    avatar?: string;
  }) {
    const companionDoc = await companionsCollection.add({
      userId,
      name,
      personality,
      interests,
      avatar: avatar || null,
      createdAt: Date.now()
    });

    return { 
      id: companionDoc.id, 
      userId,
      name,
      personality,
      interests,
      avatar: avatar || null,
      createdAt: new Date()
    };
  },

  async getCompanionsByUserId(userId: string) {
    const snapshot = await companionsCollection.where("userId", "==", userId).get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        personality: data.personality,
        interests: data.interests,
        avatar: data.avatar,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
      };
    });
  },

  // Message CRUD operations
  async createMessage({ userId, content, role, timestamp }: {
    userId: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: number;
  }) {
    const messageDoc = await messagesCollection.add({
      userId,
      content,
      role,
      timestamp,
      createdAt: Date.now()
    });

    return {
      id: messageDoc.id,
      userId,
      content,
      role,
      timestamp,
      createdAt: new Date()
    };
  },

  async getMessagesByUserId(userId: string) {
    const snapshot = await messagesCollection
      .where("userId", "==", userId)
      .orderBy("timestamp", "asc")
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        content: data.content,
        role: data.role,
        timestamp: data.timestamp,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
      };
    });
  },

  async getPreferences(userId: string) {
    const prefs = await db.select().from(companions).where(eq(companions.userId, userId));
    return prefs[0];
  }
};