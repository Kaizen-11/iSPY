import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSchema, insertNotificationSchema, insertAiSummarySchema } from "@shared/schema";
import { generateTrackingPixel, embedTrackingInEmail, generateReadReceiptNotification } from "./services/email-tracking";
import { generateEmailSummary, summarizeNotifications } from "./services/openai";
import nodemailer from "nodemailer";

// Create reusable SMTP transporter to avoid reconnecting for every email
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true, // Use connection pool for better performance
    maxConnections: 5,
    maxMessages: 10,
  });
};

// Intelligent function to determine if pixel access is from real user vs automated prefetching
async function isRealUserOpen(email: any, userAgent: string, currentTime: Date): Promise<boolean> {
  // Check timing - if accessed too quickly after sending, likely automated
  if (!email.sentAt) {
    return false; // No sent time available, treat as automated for safety
  }
  
  const timeSinceSent = currentTime.getTime() - new Date(email.sentAt).getTime();
  const MINIMUM_HUMAN_DELAY = 15 * 1000; // 15 seconds minimum for human interaction
  
  if (timeSinceSent < MINIMUM_HUMAN_DELAY) {
    return false; // Too quick, likely automated
  }
  
  // Check for known automated/proxy user agents (NOT legitimate email clients)
  const automatedUserAgents = [
    'GoogleImageProxy',
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot',
    'Slackbot',
    'EmailTracker',
    'bot',
    'crawler',
    'spider',
    'prefetch',
    'scanner',
    'security'
  ];
  
  const lowerUserAgent = userAgent.toLowerCase();
  const isAutomatedAgent = automatedUserAgents.some(agent => 
    lowerUserAgent.includes(agent.toLowerCase())
  );
  
  if (isAutomatedAgent) {
    return false; // Known automated system
  }
  
  // Check recent access patterns for this email (with error handling)
  try {
    const recentReadReceipts = await storage.getReadReceiptsByEmailId(email.id);
    const recentAccesses = recentReadReceipts.filter(receipt => {
      const receiptTime = new Date(receipt.readAt).getTime();
      const fiveMinutesAgo = currentTime.getTime() - (5 * 60 * 1000);
      return receiptTime > fiveMinutesAgo;
    });
    
    // If multiple rapid accesses in last 5 minutes, likely automated
    if (recentAccesses.length > 2) {
      return false; // Too many rapid accesses, likely prefetching
    }
    
    // Check for suspicious rapid-fire pattern
    if (recentAccesses.length >= 2) {
      const accessTimes = recentAccesses.map(r => new Date(r.readAt).getTime()).sort();
      const timeBetweenAccesses = accessTimes[1] - accessTimes[0];
      
      if (timeBetweenAccesses < 10000) { // Less than 10 seconds apart
        return false; // Rapid-fire pattern suggests automation
      }
    }
  } catch (error) {
    console.error("Error checking access patterns:", error);
    // If we can't check patterns, allow the read (don't block legitimate users)
    return true;
  }
  
  // If it passes all checks, likely a real user
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = "demo-user";
  
  // Initialize reusable email transporter
  const emailTransporter = createEmailTransporter();

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const emails = await storage.getEmailsByUserId(DEMO_USER_ID);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayEmails = emails.filter(email => 
        email.sentAt && new Date(email.sentAt) >= today
      );
      
      const readEmails = emails.filter(email => email.readStatus === "read");
      const readRate = emails.length > 0 ? Math.round((readEmails.length / emails.length) * 100) : 0;
      
      const aiSummaries = await storage.getAiSummariesByUserId(DEMO_USER_ID);
      
      const avgReadTime = readEmails.length > 0 
        ? readEmails.reduce((sum, email) => sum + (email.readTime || 0), 0) / readEmails.length
        : 0;

      res.json({
        sentToday: todayEmails.length,
        emailsRead: readEmails.length,
        readRate: `${readRate}%`,
        aiSummaries: aiSummaries.length,
        avgReadTime: `${Math.floor(avgReadTime / 60)}m`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get emails
  app.get("/api/emails", async (req, res) => {
    try {
      const emails = await storage.getEmailsByUserId(DEMO_USER_ID);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  // Get email by ID
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const email = await storage.getEmail(req.params.id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email" });
    }
  });

  // Send email with tracking
  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse(req.body);
      
      // Generate tracking pixel
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const trackingData = generateTrackingPixel(baseUrl);
      
      // Embed tracking pixel in email content
      const trackedContent = embedTrackingInEmail(
        validatedData.content, 
        trackingData.pixelHtml
      );

      // Create email with tracking in database
      const email = await storage.createEmail(DEMO_USER_ID, {
        ...validatedData,
        content: trackedContent,
        trackingPixelId: trackingData.pixelId,
      });

      // **ACTUALLY SEND THE EMAIL VIA SMTP**
      console.log("Sending email via SMTP to:", validatedData.recipient);
      
      // Send the actual email using reusable transporter
      const mailOptions = {
        from: `"iSpy" <${process.env.EMAIL_USER}>`,
        to: validatedData.recipient,
        subject: validatedData.subject,
        html: trackedContent,
      };

      const info = await emailTransporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);

      // Update the email with tracking pixel ID
      await storage.updateEmailReadStatus(email.id, "pending");

      res.json({ 
        ...email, 
        trackingPixelId: trackingData.pixelId,
        success: true,
        messageId: info.messageId
      });
    } catch (error) {
      console.error("Error sending email:", error);
      // Update the specific email status to failed
      try {
        await storage.updateEmailReadStatus(email.id, "failed");
      } catch (updateError) {
        console.error("Failed to update email status:", updateError);
      }
      
      res.status(500).json({ 
        message: "Failed to send email", 
        error: error.message || "Unknown error"
      });
    }
  });

  // Smart tracking pixel endpoint that distinguishes real opens from prefetching
  app.get("/api/track/:pixelId", async (req, res) => {
    // Always return the pixel first to avoid broken images
    const pixelBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64"
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(pixelBuffer);

    // Process tracking logic asynchronously (don't block pixel delivery)
    setImmediate(async () => {
      try {
        const { pixelId } = req.params;
        const email = await storage.getEmailByTrackingPixel(pixelId);
        
        if (email) {
          const userAgent = req.get("User-Agent") || "";
          const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
          const currentTime = new Date();
          
          // Always create a read receipt to track all pixel accesses
          await storage.createReadReceipt({
            emailId: email.id,
            trackingPixelId: pixelId,
            ipAddress,
            userAgent,
          });

          // Check if this is likely a real user open vs automated prefetching
          const isLikelyRealOpen = await isRealUserOpen(email, userAgent, currentTime);
          
          // Only mark as "read" if it seems like a real user opened it
          if (isLikelyRealOpen && email.readStatus === "pending") {
            const readTime = Math.floor(Math.random() * 300) + 60; // Simulate 1-5 minutes
            
            await storage.updateEmailReadStatus(email.id, "read", currentTime, readTime);
            
            // Create notification for real opens only
            const notificationContent = generateReadReceiptNotification(email, readTime);
            await storage.createNotification(DEMO_USER_ID, {
              type: "read_receipt",
              title: "Email Read",
              content: notificationContent,
              data: JSON.stringify({ emailId: email.id, readTime })
            });
          }
        }
      } catch (error) {
        console.error("Error processing tracking pixel:", error);
        // Log error but don't fail - pixel was already delivered
      }
    });
  });

  // Get AI summaries
  app.get("/api/summaries", async (req, res) => {
    try {
      const summaries = await storage.getAiSummariesByUserId(DEMO_USER_ID);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summaries" });
    }
  });

  // Generate AI summary for recent emails
  app.post("/api/summaries/generate", async (req, res) => {
    try {
      const emails = await storage.getEmailsByUserId(DEMO_USER_ID);
      const recentEmails = emails.slice(0, 5); // Last 5 emails

      if (recentEmails.length === 0) {
        return res.status(400).json({ message: "No emails to summarize" });
      }

      const emailsForSummary = recentEmails.map(email => ({
        subject: email.subject,
        content: email.content,
        sender: email.recipient, // In this context, it's who we sent to
        timestamp: email.sentAt?.toISOString() || new Date().toISOString()
      }));

      const summaryResult = await generateEmailSummary({ emails: emailsForSummary });

      const aiSummary = await storage.createAiSummary(DEMO_USER_ID, {
        title: summaryResult.title,
        content: summaryResult.content,
        source: "email",
        sourceData: JSON.stringify(emailsForSummary),
        priority: summaryResult.priority,
      });

      // Create notification
      await storage.createNotification(DEMO_USER_ID, {
        type: "ai_summary",
        title: "New AI Summary Available",
        content: `Generated summary: ${summaryResult.title}`,
        data: JSON.stringify({ summaryId: aiSummary.id })
      });

      res.json(aiSummary);
    } catch (error) {
      console.error("Error generating summary:", error);
      res.status(500).json({ message: "Failed to generate AI summary" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(DEMO_USER_ID);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
