import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  console.log("Setting up authentication...");

  const PostgresStore = connectPg(session);

  // Session setup with PostgreSQL store
  app.use(session({
    store: new PostgresStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Must be false in development
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Register endpoint with minimal validation
  app.post("/api/register", async (req, res) => {
    console.log("Registration attempt with body:", req.body);

    try {
      const { username, password } = req.body;
      if (!username || !password) {
        console.log("Registration failed: Missing credentials");
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.createUser({ username, password });
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        console.log("User registered successfully:", { id: user.id, username: user.username });
        res.status(201).json({ id: user.id, username: user.username });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    console.log("Login attempt with body:", req.body);

    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      console.log("Found user:", user ? { id: user.id, username: user.username } : "null");

      if (!user || !await storage.verifyPassword(username, password)) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        console.log("Login successful, session saved:", { userId: req.session.userId });
        res.json({ id: user.id, username: user.username });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    console.log("Logout request, destroying session");
    if (!req.session.userId) {
      return res.sendStatus(200); // Already logged out
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    console.log("Get user request, session:", req.session);

    try {
      if (!req.session.userId) {
        console.log("No userId in session");
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        console.log("User not found:", { id: req.session.userId });
        return res.status(401).json({ error: "User not found" });
      }

      console.log("User found:", { id: user.id, username: user.username });
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  console.log("Authentication setup complete");
}