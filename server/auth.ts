import { Express, Request, Response } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { auth, adminAuth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export function setupAuth(app: Express) {
  console.log("Setting up Firebase authentication...");

  const PostgresStore = connectPg(session);

  // Session setup with PostgreSQL store
  app.use(session({
    store: new PostgresStore({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Must be false in development
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Register endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const email = username.includes('@') ? username : `${username}@soulmate.ai`;

      try {
        // Create user with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user session
        req.session.userId = user.uid;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        console.log("User registered successfully:", { id: user.uid, username });
        res.status(201).json({ id: user.uid, username });
      } catch (firebaseError: any) {
        console.error("Firebase registration error:", firebaseError);
        let errorMessage = "Registration failed";

        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = "Username already exists";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid username format";
            break;
          case 'auth/weak-password':
            errorMessage = "Password must be at least 6 characters";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/Password authentication is not enabled in Firebase Console";
            break;
          default:
            errorMessage = firebaseError.message || "Failed to create account";
        }

        res.status(400).json({ error: errorMessage });
      }
    } catch (error) {
      console.error("Server error during registration:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const email = username.includes('@') ? username : `${username}@soulmate.ai`;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        req.session.userId = user.uid;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        console.log("Login successful:", { id: user.uid, username });
        res.json({ id: user.uid, username });
      } catch (firebaseError: any) {
        console.error("Firebase login error:", firebaseError);
        let errorMessage = "Invalid credentials";

        switch (firebaseError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = "Invalid username or password";
            break;
          case 'auth/invalid-email':
            errorMessage = "Invalid username format";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/Password authentication is not enabled in Firebase Console";
            break;
          default:
            errorMessage = firebaseError.message || "Login failed";
        }

        res.status(401).json({ error: errorMessage });
      }
    } catch (error) {
      console.error("Server error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      await signOut(auth);
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.sendStatus(200);
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      try {
        const user = await adminAuth.getUser(req.session.userId);
        const username = user.email?.split('@')[0] || user.email;
        console.log("User found:", { id: user.uid, username });
        res.json({ id: user.uid, username });
      } catch (firebaseError) {
        console.error("Firebase get user error:", firebaseError);
        res.status(401).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Server error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  console.log("Firebase authentication setup complete");
}