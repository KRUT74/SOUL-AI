import express, { type Request, Response, NextFunction } from "express";
import { setupAuth } from "./auth";
import { setupVite } from "./vite";
import { createServer } from "http";
import { registerRoutes } from "./routes";

console.log("Starting server initialization...");

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  console.log(`${req.method} ${path} - started`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${path} ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// Setup minimal auth routes
setupAuth(app);

// Create HTTP server
const server = createServer(app);

// Register API routes
registerRoutes(app).then(() => {
  // Setup Vite for development
  setupVite(app, server);

  // Start server
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server started and listening on port ${port}`);
  });
});