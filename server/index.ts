import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { attachUser } from "./auth";
import { seedDatabase } from "./seed";

// Security check: Ensure SESSION_SECRET is set
if (!process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET environment variable is not set!");
  console.error("Server will not start without a secure session secret.");
  process.exit(1);
}

const app = express();

// Health check endpoint - MUST be first, before any middleware
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

// Simplified root endpoint health check
app.get("/", (req, res, next) => {
  // Simple health check: respond OK for GET requests without cookies
  if (!req.headers.cookie) {
    return res.status(200).send("OK");
  }
  next();
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Session typing
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Session store configuration
const PgSession = connectPgSimple(session);
const sessionStore = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
  ? new PgSession({
      pool: new Pool({ connectionString: process.env.DATABASE_URL }),
      tableName: 'session',
      createTableIfMissing: true,
    })
  : undefined; // Use default MemoryStore in development

// Session middleware
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  }
}));

// Attach user to request if session exists
app.use(attachUser);

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

// Start server without async IIFE wrapper to prevent early exit
registerRoutes(app).then((server) => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup vite in development, serve static in production
  const setupPromise = app.get("env") === "development"
    ? setupVite(app, server)
    : Promise.resolve(serveStatic(app));

  setupPromise.then(() => {
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      
      // Seed database asynchronously after server starts
      seedDatabase().catch((error) => {
        console.error('⚠️ Database seeding failed (non-fatal):', error);
      });
    });

    // Handle server errors without exiting
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
