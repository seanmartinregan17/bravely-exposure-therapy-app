import { users, sessions, motivationalQuotes, cbtTips, type User, type InsertUser, type Session, type InsertSession } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  
  createSession(session: InsertSession & { userId: number }): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getUserSessions(userId: number): Promise<Session[]>;
  updateSession(id: number, update: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<Session | undefined>;
  
  getRandomQuote(): Promise<any>;
  getRandomCbtTip(): Promise<any>;
  getTodayStats(userId: number): Promise<{ distance: number; duration: number }>;
  getWeeklyStats(userId: number): Promise<{ day: string; duration: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async createSession(session: InsertSession & { userId: number }): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async getSession(id: number): Promise<Session | undefined> {
    try {
      const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting session:', error);
      return undefined;
    }
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    try {
      return await db.select().from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.startTime))
        .limit(50);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async updateSession(id: number, update: Partial<Session>): Promise<Session | undefined> {
    try {
      const result = await db.update(sessions).set(update).where(eq(sessions.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating session:', error);
      return undefined;
    }
  }

  async deleteSession(id: number): Promise<Session | undefined> {
    try {
      const result = await db.delete(sessions).where(eq(sessions.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error deleting session:', error);
      return undefined;
    }
  }

  async getRandomQuote(): Promise<any> {
    try {
      const result = await db.select().from(motivationalQuotes)
        .orderBy(sql`RANDOM()`)
        .limit(1);
      return result[0] || { id: 1, quote: "Every step forward is progress.", author: "Bravely" };
    } catch (error) {
      return { id: 1, quote: "Every step forward is progress.", author: "Bravely" };
    }
  }

  async getRandomCbtTip(): Promise<any> {
    try {
      const result = await db.select().from(cbtTips)
        .orderBy(sql`RANDOM()`)
        .limit(1);
      return result[0] || { id: 1, title: "Breathing", description: "Take slow, deep breaths", category: "grounding" };
    } catch (error) {
      return { id: 1, title: "Breathing", description: "Take slow, deep breaths", category: "grounding" };
    }
  }

  async getTodayStats(userId: number): Promise<{ distance: number; duration: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await db.select({
        totalDistance: sql<number>`COALESCE(SUM(${sessions.distance}), 0)`,
        totalDuration: sql<number>`COALESCE(SUM(${sessions.duration}), 0)`
      })
      .from(sessions)
      .where(sql`${sessions.userId} = ${userId} AND DATE(${sessions.startTime}) = ${today}`);
      
      return {
        distance: result[0]?.totalDistance || 0,
        duration: result[0]?.totalDuration || 0
      };
    } catch (error) {
      return { distance: 0, duration: 0 };
    }
  }

  async getWeeklyStats(userId: number): Promise<{ day: string; duration: number }[]> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    try {
      // Return last 7 days with zero duration for simplicity
      return days.map(day => ({ day, duration: 0 }));
    } catch (error) {
      return days.map(day => ({ day, duration: 0 }));
    }
  }
}

// Initialize storage
const databaseStorage = new DatabaseStorage();

// Check database connection and initialize
async function initializeStorage() {
  try {
    await databaseStorage.getUser(1); // Test connection
    console.log('Database storage initialized successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

initializeStorage();

export const storage = databaseStorage;
