import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Disable Firestore emulator to connect to production
delete process.env.FIRESTORE_EMULATOR_HOST;

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT in .env");
}

// Handle both escaped and unescaped newlines in the private key
let serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;

// If the JSON has literal \n characters (not actual newlines), replace them
if (serviceAccountJSON.includes('\\n')) {
  serviceAccountJSON = serviceAccountJSON.replace(/\\n/g, '\n');
}

const serviceAccount = JSON.parse(serviceAccountJSON);

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
