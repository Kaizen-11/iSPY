import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("Loaded EMAIL_USER:", process.env.EMAIL_USER);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Logging Middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// --- Email Sending Endpoint ---
app.post(
  "/api/send-email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { to, subject, body } = req.body;

      if (!to || !subject || !body) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail", // update if using another SMTP provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: body, // plain email body
      });

      res.json({ message: "Email sent successfully" });
    } catch (err) {
      next(err);
    }
  },
);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  console.log(">>> Using port:", process.env.PORT);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
