import { db } from "./firebase";
import dotenv from "dotenv";

dotenv.config();

async function updateUserRole() {
  try {
    const firebaseUid = "eN6wwLejRENybJfRg4BqFW9inun1";

    console.log("Searching for user with Firebase UID:", firebaseUid);

    const snapshot = await db.collection('users').where('firebaseUid', '==', firebaseUid).get();

    if (snapshot.empty) {
      console.log("No user found with that Firebase UID");
      return;
    }

    const doc = snapshot.docs[0];
    const userData = doc.data();

    console.log("Found user:", {
      id: doc.id,
      username: userData.username,
      email: userData.email,
      role: userData.role
    });

    console.log("Updating role to 'principle'...");

    await db.collection('users').doc(doc.id).update({
      role: 'principle'
    });

    console.log("✅ User role updated successfully!");
    console.log("Please log out and log in again to see the changes.");

    process.exit(0);
  } catch (error) {
    console.error("Error updating user role:", error);
    process.exit(1);
  }
}

updateUserRole();
