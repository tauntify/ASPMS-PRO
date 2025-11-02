const functions = require("firebase-functions");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const admin = require("firebase-admin");
const FirestoreStoreFactory = require("firestore-store");

// Initialize Firebase Admin with service account
const serviceAccount = require("./service-account-key.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();
const FirestoreStore = FirestoreStoreFactory(session);

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

// Session with same-domain cookies
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

// Attach user to request
app.use(async (req, _res, next) => {
  if (req.session && req.session.userId) {
    try {
      const { storage } = require("./server/storage");
      req.user = await storage.getUser(req.session.userId);
    } catch (err) {
      console.error("Session attach failed:", err);
    }
  }
  next();
});

// Health Check
app.get("/api/health", async (_req, res) => {
  try {
    await db.collection('_health_check').limit(1).get();
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      firebase: "connected",
      firestore: "operational",
      hosting: "Firebase Cloud Functions"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "degraded",
      error: error.message || String(error)
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

// Error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  return res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

// Export Cloud Function
exports.api = functions.https.onRequest(app);
