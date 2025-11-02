import { db } from "./firebase";

async function fixAdmin() {
  try {
    const usersSnapshot = await db.collection("users").where("username", "==", "admin").get();

    if (usersSnapshot.empty) {
      console.log("❌ Admin user not found");
      return;
    }

    const adminDoc = usersSnapshot.docs[0];
    await adminDoc.ref.update({ isActive: true });

    console.log("✅ Admin user updated with isActive: true");
    console.log("Admin ID:", adminDoc.id);
  } catch (err) {
    console.error("❌ Failed to fix admin:", err);
  } finally {
    process.exit();
  }
}

fixAdmin();
