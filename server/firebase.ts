import admin from "firebase-admin";
import dotenv from "dotenv";

// Only load .env file in development - Render provides env vars directly in production
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Disable Firestore emulator to connect to production
delete process.env.FIRESTORE_EMULATOR_HOST;

// Debug: Log what env vars are available
console.log("🔍 Checking Firebase env vars:");
console.log("  FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID ? "✅ SET" : "❌ MISSING");
console.log("  FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "✅ SET (length: " + process.env.FIREBASE_PRIVATE_KEY.length + ")" : "❌ MISSING");
console.log("  FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL ? "✅ SET" : "❌ MISSING");

// Try to build service account from individual env vars first (Render-friendly)
let serviceAccount: any;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  // Use individual environment variables (easier for Render)
  // Handle both formats: literal \n strings AND actual newlines
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // If the key contains literal \n strings (as text), replace them with actual newlines
  if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  // Ensure the key has the proper BEGIN/END format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('❌ FIREBASE_PRIVATE_KEY is missing BEGIN PRIVATE KEY header');
  }

  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "",
    universe_domain: "googleapis.com"
  };
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Fallback to JSON string (for local development)
  try {
    let serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJSON.includes('\\n')) {
      serviceAccountJSON = serviceAccountJSON.replace(/\\n/g, '\n');
    }
    serviceAccount = JSON.parse(serviceAccountJSON);
  } catch (error) {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Use individual env vars instead.");
  }
} else {
  throw new Error("Missing Firebase credentials. Set either FIREBASE_SERVICE_ACCOUNT or individual vars (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  console.log("✅ Firebase Admin connected to project:", serviceAccount.project_id);
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const db = firestore;
