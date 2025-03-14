declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateResponse } from "./anthropic";
import { companionSettings, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get chat messages - modified to only get the logged-in user's messages
  app.get("/api/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      console.log("Fetching messages for user:", req.session.userId);
      const messages = await storage.getMessages(req.session.userId);
      console.log(`Returning ${messages.length} messages for user ${req.session.userId}:`, 
        messages.map(m => ({ id: m.id, role: m.role, userId: req.session.userId })));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const message = insertMessageSchema.parse({
        content: req.body.content,
        role: "user",
        timestamp: Math.floor(Date.now() / 1000),
      });

      console.log("Adding message for user:", req.session.userId);
      const savedMessage = await storage.addMessage(req.session.userId, message);
      console.log("Saved user message:", { id: savedMessage.id, role: savedMessage.role, userId: req.session.userId });

      const prefs = await storage.getPreferences(req.session.userId);
      if (!prefs) {
        throw new Error("Companion not configured");
      }

      // Get only this user's messages for context
      const messages = await storage.getMessages(req.session.userId);
      const context = messages.slice(-6).map(m => m.content);

      const aiResponse = await generateResponse(
        message.content,
        prefs.settings,
        context
      );

      const assistantMessage = await storage.addMessage(req.session.userId, {
        content: aiResponse,
        role: "assistant",
        timestamp: Math.floor(Date.now() / 1000),
      });
      console.log("Saved AI response:", { id: assistantMessage.id, role: assistantMessage.role, userId: req.session.userId });

      res.json(savedMessage);
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({
        message: "Failed to process message",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get companion preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const prefs = await storage.getPreferences(req.session.userId);
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update companion preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const settings = companionSettings.parse(req.body);
      const prefs = await storage.setPreferences(req.session.userId, { settings });
      console.log("Saved companion preferences:", prefs);
      res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({
        message: "Failed to update preferences",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}