import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { registerExtensionRoutes } from "./routes-extensions";
import { createRequire } from 'module';
import { db } from "./firebase";

dotenv.config();

// Import CommonJS module for Firestore session store
const require = createRequire(import.meta.url);
const FirestoreStoreFactory = require("firestore-store");
const FirestoreStore = FirestoreStoreFactory(session);

const app = express();
app.use(express.json());

// ✅ Dynamic origin handling for local + production
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(o => o.length > 0);

// Add default origins if none configured
if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173", "http://localhost:5000");
}

console.log("🌐 CORS Allowed Origins:", allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`❌ CORS blocked origin: ${origin}`);
    callback(new Error(`CORS blocked: ${origin}. Allowed origins: ${allowedOrigins.join(", ")}`));
  },
  credentials: true,
}));

// ✅ Session configuration with Firestore store for persistence
const isProd = process.env.NODE_ENV === "production";
app.use(session({
  store: new FirestoreStore({
    database: db,
    collection: 'sessions',
  }),
  secret: process.env.SESSION_SECRET || "dev_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,                      // ✅ true only in production (HTTPS)
    sameSite: isProd ? "none" : "lax", // ✅ none for cross-origin prod, lax for local
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// ✅ Attach logged-in user to requests
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

const httpServer = createServer(app);
registerRoutes(app, httpServer);
registerExtensionRoutes(app);

// ✅ Serve static files from client/dist in development
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "../dist/public");

app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;

// Global error handler to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

httpServer.listen(PORT, () => console.log(`🚀 ASPMS running on port ${PORT} [Mode: ${process.env.NODE_ENV}]`));
