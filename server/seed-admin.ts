import { hashPassword } from "./auth";
import { storage } from "./storage";

async function seedAdmin() {
  try {
    const admin = await storage.getUserByUsername("admin");
    if (admin) {
      console.log("✅ Admin already exists:", admin.username);
      return;
    }
    const newAdmin = await storage.createUser({
      username: "admin",
      password: hashPassword("admin123"),
      fullName: "System Administrator",
      role: "principle",
      firebaseUid: "",
    });
    console.log("✅ Admin user created:", newAdmin.username);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
  } finally {
    process.exit();
  }
}
seedAdmin();
