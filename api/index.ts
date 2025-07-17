import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Initialize routes
let routesInitialized = false;
let routePromise: Promise<void> | null = null;

async function initializeRoutes() {
  if (!routesInitialized && !routePromise) {
    routePromise = registerRoutes(app).then(() => {
      routesInitialized = true;
    });
  }
  return routePromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initializeRoutes();
    
    // Handle the request with Express
    app(req as any, res as any);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
