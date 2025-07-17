import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Bravely API is running" });
  });

  // Serve a simple API response
  app.get("/api/app-info", (req, res) => {
    res.json({ 
      name: "Bravely", 
      description: "Exposure Therapy Tracking App",
      version: "1.0.0"
    });
  });

  const server = createServer(app);
  return server;
}
