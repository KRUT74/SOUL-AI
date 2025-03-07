import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  // Basic session setup
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false
  }));

  // Simple middleware to attach user to request
  app.use(async (req: any, res, next) => {
    if (req.session.userId) {
      req.user = await storage.getUser(req.session.userId);
    }
    next();
  });

  // Simple registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.createUser({ username, password });
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Simple login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json(user);
    } catch (error) {
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
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    res.json(req.user);
  });
}