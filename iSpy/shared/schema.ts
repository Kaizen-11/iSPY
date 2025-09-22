import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
});

export const emails = pgTable("emails", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  trackingPixelId: varchar("tracking_pixel_id").notNull(),
  readStatus: text("read_status").notNull().default("pending"), // pending, read, unread
  readAt: timestamp("read_at"),
  readTime: integer("read_time"), // in seconds
  openCount: integer("open_count").default(0),
});

export const readReceipts = pgTable("read_receipts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  emailId: varchar("email_id").notNull(),
  trackingPixelId: varchar("tracking_pixel_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  readAt: timestamp("read_at").defaultNow(),
  sessionDuration: integer("session_duration"), // in seconds
});

export const aiSummaries = pgTable("ai_summaries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(), // email, notification, mixed
  sourceData: text("source_data"), // JSON string of source emails/notifications
  createdAt: timestamp("created_at").defaultNow(),
  priority: text("priority").default("normal"), // urgent, normal, low
});
export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  trackingId: string;
  status: "sent" | "opened";
  createdAt: Date;
}

export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // read_receipt, ai_summary, system
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  data: text("data"), // JSON string for additional data
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  userId: true,
  sentAt: true,
  trackingPixelId: true,
  readStatus: true,
  readAt: true,
  readTime: true,
  openCount: true,
});

export const insertReadReceiptSchema = createInsertSchema(readReceipts).omit({
  id: true,
  readAt: true,
});

export const insertAiSummarySchema = createInsertSchema(aiSummaries).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  userId: true,
  createdAt: true,
  isRead: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;

export type ReadReceipt = typeof readReceipts.$inferSelect;
export type InsertReadReceipt = z.infer<typeof insertReadReceiptSchema>;

export type AiSummary = typeof aiSummaries.$inferSelect;
export type InsertAiSummary = z.infer<typeof insertAiSummarySchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
