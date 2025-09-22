import { 
  type User, 
  type InsertUser, 
  type Email, 
  type InsertEmail,
  type ReadReceipt,
  type InsertReadReceipt,
  type AiSummary,
  type InsertAiSummary,
  type Notification,
  type InsertNotification,
  users,
  emails,
  readReceipts,
  aiSummaries,
  notifications
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Emails
  getEmailsByUserId(userId: string): Promise<Email[]>;
  getEmail(id: string): Promise<Email | undefined>;
  createEmail(userId: string, email: InsertEmail): Promise<Email>;
  updateEmailReadStatus(id: string, status: string, readAt?: Date, readTime?: number): Promise<void>;
  getEmailByTrackingPixel(trackingPixelId: string): Promise<Email | undefined>;

  // Read Receipts
  createReadReceipt(receipt: InsertReadReceipt): Promise<ReadReceipt>;
  getReadReceiptsByEmailId(emailId: string): Promise<ReadReceipt[]>;

  // AI Summaries
  getAiSummariesByUserId(userId: string): Promise<AiSummary[]>;
  createAiSummary(userId: string, summary: InsertAiSummary): Promise<AiSummary>;

  // Notifications
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private emails: Map<string, Email> = new Map();
  private readReceipts: Map<string, ReadReceipt> = new Map();
  private aiSummaries: Map<string, AiSummary> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    // Create a demo user
    const demoUser: User = {
      id: "demo-user",
      username: "demo",
      password: "demo123",
      email: "john@company.com",
      name: "John Doe"
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEmailsByUserId(userId: string): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.userId === userId)
      .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());
  }

  async getEmail(id: string): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(userId: string, insertEmail: InsertEmail): Promise<Email> {
    const id = randomUUID();
    const trackingPixelId = randomUUID();
    const email: Email = {
      ...insertEmail,
      id,
      userId,
      trackingPixelId,
      sentAt: new Date(),
      readStatus: "pending",
      readAt: null,
      readTime: null,
      openCount: 0,
    };
    this.emails.set(id, email);
    return email;
  }

  async updateEmailReadStatus(id: string, status: string, readAt?: Date, readTime?: number): Promise<void> {
    const email = this.emails.get(id);
    if (email) {
      email.readStatus = status;
      email.readAt = readAt || null;
      email.readTime = readTime || null;
      email.openCount = (email.openCount || 0) + 1;
      this.emails.set(id, email);
    }
  }

  async getEmailByTrackingPixel(trackingPixelId: string): Promise<Email | undefined> {
    return Array.from(this.emails.values()).find(email => email.trackingPixelId === trackingPixelId);
  }

  async createReadReceipt(insertReceipt: InsertReadReceipt): Promise<ReadReceipt> {
    const id = randomUUID();
    const receipt: ReadReceipt = {
      ...insertReceipt,
      id,
      readAt: new Date(),
      sessionDuration: null,
      ipAddress: insertReceipt.ipAddress || null,
      userAgent: insertReceipt.userAgent || null,
    };
    this.readReceipts.set(id, receipt);
    return receipt;
  }

  async getReadReceiptsByEmailId(emailId: string): Promise<ReadReceipt[]> {
    return Array.from(this.readReceipts.values()).filter(receipt => receipt.emailId === emailId);
  }

  async getAiSummariesByUserId(userId: string): Promise<AiSummary[]> {
    return Array.from(this.aiSummaries.values())
      .filter(summary => summary.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createAiSummary(userId: string, insertSummary: InsertAiSummary): Promise<AiSummary> {
    const id = randomUUID();
    const summary: AiSummary = {
      ...insertSummary,
      id,
      userId,
      createdAt: new Date(),
      sourceData: insertSummary.sourceData || null,
      priority: insertSummary.priority || null,
    };
    this.aiSummaries.set(id, summary);
    return summary;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createNotification(userId: string, insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      userId,
      createdAt: new Date(),
      isRead: false,
      data: insertNotification.data || null,
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }
}

export class PostgreSQLStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(client);
    
    // Ensure demo user exists
    this.initializeDemoUser();
  }

  private async initializeDemoUser() {
    try {
      const existingUser = await this.getUserByUsername("demo");
      if (!existingUser) {
        await this.createUser({
          username: "demo",
          password: "demo123",
          email: "john@company.com",
          name: "John Doe"
        });
      }
    } catch (error) {
      console.error("Error initializing demo user:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Emails
  async getEmailsByUserId(userId: string): Promise<Email[]> {
    return await this.db.select().from(emails).where(eq(emails.userId, userId)).orderBy(desc(emails.sentAt));
  }

  async getEmail(id: string): Promise<Email | undefined> {
    const result = await this.db.select().from(emails).where(eq(emails.id, id)).limit(1);
    return result[0];
  }

  async createEmail(userId: string, insertEmail: InsertEmail): Promise<Email> {
    const result = await this.db.insert(emails).values({
      ...insertEmail,
      userId,
      readStatus: "pending",
      openCount: 0
    }).returning();
    return result[0];
  }

  async updateEmailReadStatus(id: string, status: string, readAt?: Date, readTime?: number): Promise<void> {
    const updateData: any = { readStatus: status };
    if (readAt) updateData.readAt = readAt;
    if (readTime) updateData.readTime = readTime;
    
    // Increment open count when status changes to "read"
    if (status === "read") {
      const currentEmail = await this.getEmail(id);
      if (currentEmail) {
        updateData.openCount = (currentEmail.openCount || 0) + 1;
      }
    }
    
    await this.db.update(emails).set(updateData).where(eq(emails.id, id));
  }

  async getEmailByTrackingPixel(trackingPixelId: string): Promise<Email | undefined> {
    const result = await this.db.select().from(emails).where(eq(emails.trackingPixelId, trackingPixelId)).limit(1);
    return result[0];
  }

  // Read Receipts
  async createReadReceipt(insertReceipt: InsertReadReceipt): Promise<ReadReceipt> {
    const result = await this.db.insert(readReceipts).values(insertReceipt).returning();
    return result[0];
  }

  async getReadReceiptsByEmailId(emailId: string): Promise<ReadReceipt[]> {
    return await this.db.select().from(readReceipts).where(eq(readReceipts.emailId, emailId));
  }

  // AI Summaries
  async getAiSummariesByUserId(userId: string): Promise<AiSummary[]> {
    return await this.db.select().from(aiSummaries).where(eq(aiSummaries.userId, userId)).orderBy(desc(aiSummaries.createdAt));
  }

  async createAiSummary(userId: string, insertSummary: InsertAiSummary): Promise<AiSummary> {
    const result = await this.db.insert(aiSummaries).values({
      ...insertSummary,
      userId
    }).returning();
    return result[0];
  }

  // Notifications
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await this.db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(userId: string, insertNotification: InsertNotification): Promise<Notification> {
    const result = await this.db.insert(notifications).values({
      ...insertNotification,
      userId,
      isRead: false
    }).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
}

export const storage = new PostgreSQLStorage();
