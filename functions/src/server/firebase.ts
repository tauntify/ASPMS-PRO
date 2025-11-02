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
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  console.log("🔍 Private key format check:");
  console.log("  - Length:", privateKey.length);
  console.log("  - Starts with:", privateKey.substring(0, 30));
  console.log("  - Contains \\n (literal):", privateKey.includes('\\n'));
  console.log("  - Contains newlines (actual):", privateKey.includes('\n'));
  console.log("  - Contains BEGIN header:", privateKey.includes('-----BEGIN PRIVATE KEY-----'));

  // Option 1: Check if it's base64 encoded (recommended for Render)
  // Base64 encoded keys are more reliable in environment variables
  if (!privateKey.includes('-----BEGIN') && !privateKey.includes('\\n')) {
    try {
      console.log("🔄 Detected base64 encoded private key, decoding...");
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
      console.log("✅ Base64 decode successful");
    } catch (e) {
      console.error("❌ Failed to decode base64 private key:", e);
    }
  }

  // Option 2: Handle literal \n strings (like -----BEGIN PRIVATE KEY-----\nMIIE...)
  if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
    console.log("🔄 Converting literal \\n to actual newlines...");
    privateKey = privateKey.replace(/\\n/g, '\n');
    console.log("✅ Newline conversion complete");
  }

  // Validate the key format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('❌ FIREBASE_PRIVATE_KEY is missing BEGIN PRIVATE KEY header');
    console.error('❌ First 100 chars:', privateKey.substring(0, 100));
  } else {
    console.log("✅ Private key format looks valid");
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
  // If no env vars, assume Firebase Admin is initialized elsewhere (e.g., in index.ts)
  console.log("⚠️  No Firebase env vars found - assuming admin is initialized elsewhere");
  serviceAccount = null;
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log("✅ Firebase Admin initialized for project:", serviceAccount.project_id);

    // Test Firestore connection
    const testDb = admin.firestore();
    testDb.collection('_test_connection').limit(1).get()
      .then(() => {
        console.log("✅ Firestore connection test: SUCCESS");
      })
      .catch((error) => {
        console.error("❌ Firestore connection test: FAILED");
        console.error("❌ Error:", error.message);
        console.error("❌ This usually means Firebase credentials are invalid or incorrectly formatted");
      });
  } catch (initError) {
    console.error("❌ Firebase Admin initialization FAILED:");
    console.error(initError);
    throw initError;
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const db = firestore;
