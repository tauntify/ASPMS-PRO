import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { registerExtensionRoutes } from "./routes-extensions";
import { createRequire } from "module";
import { db } from "./firebase";

// Only load .env file in development - Render provides env vars directly in production
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const require = createRequire(import.meta.url);
const FirestoreStoreFactory = require("firestore-store");
const FirestoreStore = FirestoreStoreFactory(session);

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

/* -------------------------------------------------------------------------- */
/* ✅ 1. Correct CORS Configuration                                           */
/* -------------------------------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://aspms-pro.web.app",
  "https://aspms-pro.firebaseapp.com",
  "https://aspms-pro-backend.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* -------------------------------------------------------------------------- */
/* ✅ 2. Session Configuration with Firestore                                 */
/* -------------------------------------------------------------------------- */
app.use(
  session({
    store: new FirestoreStore({ database: db, collection: "sessions" }),
    secret: process.env.SESSION_SECRET || "dev_secret_key",
    resave: false,
    saveUninitialized: false,
    name: "connect.sid",
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

/* -------------------------------------------------------------------------- */
/* ✅ 3. Attach Logged-in User to Request (Optional Auth Hook)                */
/* -------------------------------------------------------------------------- */
app.use(async (req: any, _res, next) => {
  if (req.session && req.session.userId) {
    try {
      const { storage } = await import("./storage");
      req.user = await storage.getUser(req.session.userId);
    } catch (err) {
      console.error("Session attach failed:", err);
    }
  }
  next();
});

/* -------------------------------------------------------------------------- */
/* ✅ 4. Health Check Endpoint (for Render and monitoring)                    */
/* -------------------------------------------------------------------------- */
app.get("/api/health", async (_req, res) => {
  try {
    // Test Firestore connection
    const testQuery = await db.collection('_health_check').limit(1).get();

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      firebase: "connected",
      firestore: "operational"
    });
  } catch (error) {
    console.error("❌ Health check failed - Firebase connection issue:", error);
    res.status(503).json({
      status: "degraded",
      timestamp: new Date().toISOString(),
      firebase: "error",
      firestore: "failed",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ 5. API Routes                                                           */
/* -------------------------------------------------------------------------- */
registerRoutes(app);
registerExtensionRoutes(app);

/* -------------------------------------------------------------------------- */
/* ✅ 6. API 404 Handler (No Static File Serving on Backend)                 */
/* -------------------------------------------------------------------------- */
// Backend should ONLY serve API endpoints, not static files
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "API endpoint not found",
    path: req.originalUrl,
    message: "This backend server only serves API endpoints under /api"
  });
});

/* -------------------------------------------------------------------------- */
/* ✅ 7. Global Error Handling                                                */
/* -------------------------------------------------------------------------- */
// API Error Handler Middleware
app.use((err: any, req: any, res: any, next: any) => {
  // Only handle API errors
  if (req.path.startsWith("/api")) {
    console.error("❌ API Error:", err);
    return res.status(err.status || 500).json({
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
  next(err);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "Reason:", reason);
});

/* -------------------------------------------------------------------------- */
/* ✅ 8. Start Server                                                         */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
httpServer.listen(PORT, () =>
  console.log(`🚀 ASPMS running on port ${PORT} [Mode: ${process.env.NODE_ENV}]`)
);
