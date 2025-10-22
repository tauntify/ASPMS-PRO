import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';
import { storage } from './storage';
import bcrypt from 'bcrypt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Middleware to check specific role
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Middleware to attach user to request
export async function attachUser(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      req.user = user;
    }
  }
  next();
}

// Secure password hashing using bcrypt
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
