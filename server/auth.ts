import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  console.log("Setting up authentication...");

  // Basic session setup with more secure settings
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
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
        res.status(201).json(user);
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
      const user = await storage.getUserByUsername(username);

      console.log("Found user:", user ? { id: user.id, username: user.username } : "null");

      if (!user || user.password !== password) {
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
        res.json(user);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    console.log("Logout request, destroying session");
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

    if (!req.session.userId) {
      console.log("No userId in session");
      return res.sendStatus(401);
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        console.log("User not found:", { id: req.session.userId });
        return res.sendStatus(401);
      }
      console.log("User found:", { id: user.id, username: user.username });
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.sendStatus(500);
    }
  });

  console.log("Authentication setup complete");
}