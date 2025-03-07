import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateResponse } from "./anthropic";
import { companionSettings, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get chat messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/messages", async (req, res) => {
    try {
      const message = insertMessageSchema.parse({
        content: req.body.content,
        role: "user",
        timestamp: Math.floor(Date.now() / 1000), // Convert to seconds
      });

      const savedMessage = await storage.addMessage(message);

      const prefs = await storage.getPreferences();
      if (!prefs) {
        throw new Error("Companion not configured");
      }

      const messages = await storage.getMessages();
      const context = messages.slice(-6).map(m => m.content);

      const aiResponse = await generateResponse(
        message.content,
        prefs.settings,
        context
      );

      const assistantMessage = await storage.addMessage({
        content: aiResponse,
        role: "assistant",
        timestamp: Math.floor(Date.now() / 1000), // Convert to seconds
      });

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
      const prefs = await storage.getPreferences();
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update companion preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      const settings = companionSettings.parse(req.body);
      const prefs = await storage.setPreferences({ settings });
      console.log("Saved companion preferences:", prefs);
      res.json(prefs);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}