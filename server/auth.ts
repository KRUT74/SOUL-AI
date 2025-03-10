import { Express, Request, Response } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { auth, adminAuth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export function setupAuth(app: Express) {
  console.log("Setting up Firebase authentication...");

  const PostgresStore = connectPg(session);

  // Session setup with PostgreSQL store (keeping for session management)
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

  // Register endpoint with Firebase
  app.post("/api/register", async (req, res) => {
    console.log("Registration attempt with body:", req.body);

    try {
      const { username, password } = req.body;
      if (!username || !password) {
        console.log("Registration failed: Missing credentials");
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Format email if not provided in email format
      const email = username.includes('@') ? username : `${username}@example.com`;

      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user session
      req.session.userId = user.uid;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        console.log("User registered successfully:", { id: user.uid, username: user.email });
        res.status(201).json({ id: user.uid, username: user.email });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Username already exists";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      }
      res.status(400).json({ error: errorMessage });
    }
  });

  // Login endpoint with Firebase
  app.post("/api/login", async (req, res) => {
    console.log("Login attempt with body:", req.body);

    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Format email if not provided in email format
      const email = username.includes('@') ? username : `${username}@example.com`;

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      req.session.userId = user.uid;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        console.log("Login successful, session saved:", { userId: req.session.userId });
        res.json({ id: user.uid, username: user.email });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Invalid credentials";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid username or password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      }
      res.status(401).json({ error: errorMessage });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req, res) => {
    console.log("Logout request, destroying session");

    try {
      await signOut(auth);

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.sendStatus(200);
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: error.message || "Failed to logout" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    console.log("Get user request, session:", req.session);

    try {
      if (!req.session.userId) {
        console.log("No userId in session");
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user from Firebase Admin
      const user = await adminAuth.getUser(req.session.userId);
      if (!user) {
        console.log("User not found:", { id: req.session.userId });
        return res.status(401).json({ error: "User not found" });
      }

      console.log("User found:", { id: user.uid, username: user.email });
      res.json({ id: user.uid, username: user.email });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user data" });
    }
  });

  console.log("Firebase authentication setup complete");
}