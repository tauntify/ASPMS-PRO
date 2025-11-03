/**
 * Cloud Logging Utility for Firebase Functions
 * Uses Google Cloud Logging for structured logging
 */

import { Request, Response, NextFunction } from 'express';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Structured log entry
 */
interface LogEntry {
  severity: LogLevel;
  message: string;
  [key: string]: any;
}

/**
 * Log a structured message
 */
function log(entry: LogEntry) {
  // Google Cloud Functions automatically captures console.log as structured logs
  // when using JSON format
  const logData = {
    severity: entry.severity,
    message: entry.message,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Use console methods based on severity
  switch (entry.severity) {
    case LogLevel.DEBUG:
      console.debug(JSON.stringify(logData));
      break;
    case LogLevel.INFO:
      console.info(JSON.stringify(logData));
      break;
    case LogLevel.WARNING:
      console.warn(JSON.stringify(logData));
      break;
    case LogLevel.ERROR:
    case LogLevel.CRITICAL:
      console.error(JSON.stringify(logData));
      break;
    default:
      console.log(JSON.stringify(logData));
  }
}

/**
 * Logger class with convenience methods
 */
export class Logger {
  private context: string;

  constructor(context: string = 'app') {
    this.context = context;
  }

  debug(message: string, metadata?: Record<string, any>) {
    log({
      severity: LogLevel.DEBUG,
      message,
      context: this.context,
      ...metadata,
    });
  }

  info(message: string, metadata?: Record<string, any>) {
    log({
      severity: LogLevel.INFO,
      message,
      context: this.context,
      ...metadata,
    });
  }

  warn(message: string, metadata?: Record<string, any>) {
    log({
      severity: LogLevel.WARNING,
      message,
      context: this.context,
      ...metadata,
    });
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, any>) {
    const errorData: any = {
      severity: LogLevel.ERROR,
      message,
      context: this.context,
      ...metadata,
    };

    if (error instanceof Error) {
      errorData.error_message = error.message;
      errorData.error_stack = error.stack;
      errorData.error_name = error.name;
    } else if (error) {
      errorData.error_data = String(error);
    }

    log(errorData);
  }

  critical(message: string, error?: Error | unknown, metadata?: Record<string, any>) {
    const errorData: any = {
      severity: LogLevel.CRITICAL,
      message,
      context: this.context,
      ...metadata,
    };

    if (error instanceof Error) {
      errorData.error_message = error.message;
      errorData.error_stack = error.stack;
      errorData.error_name = error.name;
    } else if (error) {
      errorData.error_data = String(error);
    }

    log(errorData);
  }
}

/**
 * Express middleware for request logging
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger('http');
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    user_id: (req as any).user?.id,
    ip: req.ip,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? LogLevel.WARNING : LogLevel.INFO;

    log({
      severity: level,
      message: 'Request completed',
      context: 'http',
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: duration,
      user_id: (req as any).user?.id,
    });
  });

  next();
}

/**
 * Express error handler middleware
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  const logger = new Logger('error');

  logger.error('Unhandled error in request', err, {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    user_id: (req as any).user?.id,
  });

  // Pass to next error handler
  next(err);
}

// Export default logger instance
export const logger = new Logger('app');
