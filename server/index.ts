import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { registerExtensionRoutes } from "./routes-extensions";
import { createRequire } from "module";
import { db } from "./firebase";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const require = createRequire(import.meta.url);
const FirestoreStoreFactory = require("firestore-store");
const FirestoreStore = FirestoreStoreFactory(session);

const app = express();
app.use(express.json());

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
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`❌ CORS blocked origin: ${origin}`);
      return callback(
        new Error(
          `CORS blocked: ${origin}. Allowed: ${allowedOrigins.join(", ")}`
        )
      );
    },
    credentials: true,
  })
);

/* -------------------------------------------------------------------------- */
/* ✅ 2. Session Configuration with Firestore                                 */
/* -------------------------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";
app.use(
  session({
    store: new FirestoreStore({
      database: db,
      collection: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "dev_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // HTTPS only in production
      sameSite: isProd ? "none" : "lax",
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
/* ✅ 4. API Routes Registered BEFORE Static Serve                            */
/* -------------------------------------------------------------------------- */
registerRoutes(app);
registerExtensionRoutes(app);

/* -------------------------------------------------------------------------- */
/* ✅ 5. Static Files Serve (for client build)                                */
/* -------------------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "../dist/public");

// Serve built React files
app.use(express.static(clientDist));

/* 
   Important: Only serve index.html for routes *not starting* with /api.
   This prevents API responses from returning "<!DOCTYPE html>".
*/
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next(); // skip for API routes
  res.sendFile(path.join(clientDist, "index.html"));
});

/* -------------------------------------------------------------------------- */
/* ✅ 6. Global Error Handling                                                */
/* -------------------------------------------------------------------------- */
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "Reason:", reason);
});

/* -------------------------------------------------------------------------- */
/* ✅ 7. Start Server                                                         */
/* -------------------------------------------------------------------------- */
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
httpServer.listen(PORT, () =>
  console.log(`🚀 ASPMS running on port ${PORT} [Mode: ${process.env.NODE_ENV}]`)
);
