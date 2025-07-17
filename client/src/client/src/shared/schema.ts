import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, cancelled, past_due
  subscriptionEndDate: timestamp("subscription_end_date"),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  isTrialUsed: boolean("is_trial_used").default(false),
  // Progressive Goal Settings
  progressiveGoalsEnabled: boolean("progressive_goals_enabled").default(true),
  goalGrowthRate: real("goal_growth_rate").default(5.0), // percentage per period
  goalGrowthPeriod: text("goal_growth_period").default("weekly"), // weekly, monthly
  currentDistanceGoal: real("current_distance_goal").default(1.0), // miles
  currentDurationGoal: integer("current_duration_goal").default(15), // minutes
  destinationGoals: text("destination_goals").array(),
  lastGoalUpdate: timestamp("last_goal_update"),
  // Monthly Session Goals
  monthlySessionGoal: integer("monthly_session_goal").default(10), // sessions per month
  sessionGoalLastUpdated: timestamp("session_goal_last_updated"),
  // Daily reminder preferences
  dailyRemindersEnabled: boolean("daily_reminders_enabled").default(true),
  reminderTime: text("reminder_time").default("09:00"), // HH:MM format
  reminderFrequency: text("reminder_frequency").default("daily"), // daily, weekly, custom
  lastReminderSent: timestamp("last_reminder_sent"),
  // Profile customization
  profileIcon: text("profile_icon").default("🦸‍♂️"), // emoji for profile avatar
  // Onboarding
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: integer("onboarding_step").default(0), // current step in onboarding
  // Bravery Streak
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastSessionDate: text("last_session_date"), // YYYY-MM-DD format
  // New features from ChatGPT suggestions
  dailyIntention: text("daily_intention"), // Today's small goal
  enableSoundFeedback: boolean("enable_sound_feedback").default(true),
  enableHapticFeedback: boolean("enable_haptic_feedback").default(true),
  lastWeeklyReviewDate: text("last_weekly_review_date"), // YYYY-MM-DD format
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionType: text("session_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  distance: real("distance"), // in miles
  fearLevelBefore: integer("fear_level_before").notNull(),
  fearLevelAfter: integer("fear_level_after"),
  moodBefore: integer("mood_before").notNull(),
  moodAfter: integer("mood_after"),
  notes: text("notes"),
  routeData: text("route_data"), // JSON string of GPS coordinates
  isActive: boolean("is_active").default(false),
  // New ChatGPT suggestions
  moodTag: text("mood_tag"), // anxious, neutral, accomplished, brave, reflective
  dailyIntention: text("daily_intention"), // today's small goal/intention
  toolsUsed: text("tools_used").array(), // CBT tools used during session
  reflection: text("reflection"), // Post-session reflection for therapeutic insights
});

export const motivationalQuotes = pgTable("motivational_quotes", {
  id: serial("id").primaryKey(),
  quote: text("quote").notNull(),
  author: text("author"),
});

export const cbtTips = pgTable("cbt_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
});

export const dailyReminders = pgTable("daily_reminders", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  tone: text("tone").notNull().default("empathetic"), // empathetic, encouraging, gentle, supportive
  category: text("category").notNull(), // morning, afternoon, evening, general
  isPersonalized: boolean("is_personalized").default(false), // true for AI-generated
  userId: integer("user_id"), // null for general reminders, user-specific for personalized
});

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  username: text("username").notNull(),
  eventType: text("event_type").notNull(), // registration, welcome_sent, unsubscribe
  registrationDate: timestamp("registration_date").defaultNow(),
  welcomeEmailSent: boolean("welcome_email_sent").default(false),
  welcomeEmailSentDate: timestamp("welcome_email_sent_date"),
  notes: text("notes"),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertSessionSchema = createInsertSchema(sessions);
export const insertQuoteSchema = createInsertSchema(motivationalQuotes);
export const insertCbtTipSchema = createInsertSchema(cbtTips);
export const insertReminderSchema = createInsertSchema(dailyReminders);
export const insertEmailLogSchema = createInsertSchema(emailLogs);

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type MotivationalQuote = typeof motivationalQuotes.$inferSelect;
export type CbtTip = typeof cbtTips.$inferSelect;
export type DailyReminder = typeof dailyReminders.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
