import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback_jwt_secret_change_in_production";
const JWT_EXPIRES_IN = "7d"; // 7 days

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    return parts[1];
  }

  // If no Bearer prefix, assume the entire header is the token
  return authHeader;
}
