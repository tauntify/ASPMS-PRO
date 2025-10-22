import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Health check endpoint - ABSOLUTE FIRST - No dependencies, no imports, no async operations
// This MUST respond immediately for deployment platform health checks
app.get('/', (req, res, next) => {
  // Health check: requests without cookies are health checks from deployment platform
  if (!req.headers.cookie) {
    return res.status(200).send('OK');
  }
  // Regular requests with cookies proceed to the app
  next();
});

// Security check: Ensure SESSION_SECRET is set (after health check)
if (!process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET environment variable is not set!");
  console.error("Server will not start without a secure session secret.");
  process.exit(1);
}

// Import routes and auth AFTER health check is established
// This prevents any database initialization from blocking the health check
import { registerRoutes } from "./routes";
import { attachUser } from "./auth";

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

// Start server without async wrapper to prevent early exit
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
      log(`Health check endpoint ready at /`);
      
      // Database seeding has been removed from server startup
      // Run seeding manually as a separate one-time setup:
      // npm run db:seed (or tsx server/seed.ts)
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
