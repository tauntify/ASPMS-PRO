import { Request, Response, NextFunction } from 'express';
import { User } from '../shared/schema';
import { storage } from './storage';
import { auth as firebaseAuth } from './firebase';
import bcrypt from 'bcrypt';
import { verifyToken, extractTokenFromHeader } from './jwt';

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
    userId: number;
  }
}

// Middleware to verify token and attach user
export async function attachUser(req: Request, res: Response, next: NextFunction) {
  try {
    console.log(`🔐 attachUser middleware - Path: ${req.path}, Auth header: ${req.headers.authorization ? 'EXISTS' : 'NONE'}`);

    // Check if Authorization header exists
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log(`🎫 Token found: ${token.substring(0, 20)}...`);

      // Priority 1: Try JWT token first
      const jwtPayload = verifyToken(token);
      if (jwtPayload) {
        console.log(`✅ JWT payload verified: userId=${jwtPayload.userId}, role=${jwtPayload.role}`);
        const user = await storage.getUser(String(jwtPayload.userId));
        if (user) {
          req.user = user;
          console.log(`✅ User attached from JWT: ${user.username} (${user.role})`);
          return next();
        } else {
          console.warn(`⚠️ User not found in DB for userId: ${jwtPayload.userId}`);
        }
      }

      // Priority 2: Try Firebase token (for Google Sign-In)
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        req.firebaseUser = decodedToken;
        console.log(`✅ Firebase token verified: ${decodedToken.email}`);

        // Get user from database by Firebase UID
        const user = await storage.getUserByFirebaseUid(decodedToken.uid);
        if (user) {
          req.user = user;
          console.log(`✅ User attached from Firebase: ${user.username}`);
          return next();
        }
      } catch (firebaseError) {
        // Not a Firebase token, that's okay
        console.log(`ℹ️ Not a valid Firebase token (this is normal for JWT auth)`);
      }
    }

    // Priority 3: Fallback to session-based authentication (backward compatibility)
    if (req.session?.userId) {
      console.log(`🍪 Session found for userId: ${req.session.userId}`);
      const user = await storage.getUser(String(req.session.userId));
      if (user) {
        req.user = user;
        console.log(`✅ User attached from session: ${user.username}`);
        return next();
      }
    }

    console.log(`🏁 attachUser complete - req.user: ${req.user ? 'SET' : 'NOT SET'}`);
    next();
  } catch (error) {
    console.error('❌ Error in attachUser middleware:', error);
    next();
  }
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log(`🔒 requireAuth - Path: ${req.path}, req.user: ${req.user ? `${req.user.username} (${req.user.role})` : 'NOT SET'}`);
  if (!req.user) {
    console.warn(`❌ 401 Unauthorized - No user attached to request for path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log(`✅ requireAuth passed for ${req.user.username}`);
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
