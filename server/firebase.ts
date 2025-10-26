import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Disable Firestore emulator to connect to production
delete process.env.FIRESTORE_EMULATOR_HOST;

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT in .env");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

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
