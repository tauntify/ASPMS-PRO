import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';
import { storage } from './storage';
import { auth as firebaseAuth } from './firebase';
import bcrypt from 'bcrypt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      firebaseUser?: any;
    }
  }
}

// Extend express-session to include userId
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Middleware to verify Firebase token and attach user
export async function attachUser(req: Request, res: Response, next: NextFunction) {
  try {
    // First, check for session-based authentication
    if (req.session?.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    
    // If no session user, check for Firebase token in header
    if (!req.user) {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          // Verify Firebase token
          const decodedToken = await firebaseAuth.verifyIdToken(token);
          req.firebaseUser = decodedToken;
          
          // Get user from database by Firebase UID
          const user = await storage.getUserByFirebaseUid(decodedToken.uid);
          if (user) {
            req.user = user;
          }
        } catch (error) {
          console.error('Error verifying Firebase token:', error);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in attachUser middleware:', error);
    next();
  }
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
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

// Secure password hashing using bcrypt (kept for backward compatibility if needed)
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// Helper function to create Firebase user
export async function createFirebaseUser(email: string, password: string, displayName: string) {
  try {
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName,
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    throw error;
  }
}

// Helper function to delete Firebase user
export async function deleteFirebaseUser(uid: string) {
  try {
    await firebaseAuth.deleteUser(uid);
  } catch (error) {
    console.error('Error deleting Firebase user:', error);
    throw error;
  }
}

// Helper function to update Firebase user
export async function updateFirebaseUser(uid: string, updates: {
  email?: string;
  password?: string;
  displayName?: string;
  disabled?: boolean;
}) {
  try {
    await firebaseAuth.updateUser(uid, updates);
  } catch (error) {
    console.error('Error updating Firebase user:', error);
    throw error;
  }
}
