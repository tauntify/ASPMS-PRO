import * as functions from "firebase-functions";
import express from "express";
import session from "express-session";
import cors from "cors";
import admin from "firebase-admin";

// Initialize Firebase Admin (uses Application Default Credentials in Cloud Functions)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Import Firestore Store (CommonJS module)
const FirestoreStoreFactory = require("firestore-store");
const FirestoreStore = FirestoreStoreFactory(session);

// Import routes dynamically
import { registerRoutes } from "./server/routes";
import { registerExtensionRoutes } from "./server/routes-extensions";
import { attachUser } from "./server/auth";
import { requestLogger, errorLogger, logger } from "./server/logger";

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

// CORS - Firebase hosting same domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://aspms-pro-v1.web.app",
  "https://aspms-pro-v1.firebaseapp.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Session with same-domain cookies (for backward compatibility)
app.use(
  session({
    store: new FirestoreStore({ database: db, collection: "sessions" }),
    secret: process.env.SESSION_SECRET || "aspms_production_secret_2025",
    resave: false,
    saveUninitialized: false,
    name: "connect.sid",
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax", // Same domain
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// Request logging middleware
app.use(requestLogger);

// Attach user to request (checks JWT token first, then session)
app.use(attachUser);

// Health Check - Updated with new admin features
app.get("/api/health", async (_req, res) => {
  try {
    await db.collection('_health_check').limit(1).get();
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      firebase: "connected",
      firestore: "operational",
      hosting: "Firebase Cloud Functions",
      version: "2.0.0"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "degraded",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Register all routes
registerRoutes(app);
registerExtensionRoutes(app);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found",
    path: req.originalUrl
  });
});

// Error logging middleware
app.use(errorLogger);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Unhandled API error", err, {
    path: req.path,
    method: req.method,
  });

  return res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

// Export Cloud Function (2nd Gen)
// Note: Not setting invoker to allow Firebase Hosting internal access
export const api = functions.https.onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    maxInstances: 10,
    secrets: ["JWT_SECRET"], // Make JWT_SECRET available as environment variable
  },
  app
);
// Updated Mon, Nov  3, 2025  3:23:07 AM
