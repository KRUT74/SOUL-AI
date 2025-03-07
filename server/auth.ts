import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  console.log("Setting up authentication...");

  // Basic session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false
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

      console.log("User registered successfully:", { id: user.id, username: user.username });
      res.status(201).json(user);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    console.log("Login attempt:", req.body);

    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        console.log("Login failed: Invalid credentials");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.sendStatus(401);
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.sendStatus(401);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.sendStatus(500);
    }
  });

  console.log("Authentication setup complete");
}