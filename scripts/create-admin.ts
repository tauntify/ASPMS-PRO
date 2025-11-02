#!/usr/bin/env tsx

/**
 * Create System Admin Account
 *
 * This script creates the first system administrator account for ARKA SERVICES.
 * Run this once to set up the admin account.
 *
 * Usage: npx tsx scripts/create-admin.ts
 */

import admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Disable Firestore emulator to connect to production
delete process.env.FIRESTORE_EMULATOR_HOST;

// Try to build service account from individual env vars
let serviceAccount: any;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Handle base64 encoded private key
  if (!privateKey.includes('-----BEGIN') && !privateKey.includes('\\n')) {
    try {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    } catch (e) {
      console.error("❌ Failed to decode base64 private key:", e);
    }
  }

  // Handle literal \n strings
  if (privateKey.includes('\\n') && !privateKey.includes('\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    let serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJSON.includes('\\n')) {
      serviceAccountJSON = serviceAccountJSON.replace(/\\n/g, '\n');
    }
    serviceAccount = JSON.parse(serviceAccountJSON);
  } catch (error) {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON");
  }
} else {
  throw new Error("Missing Firebase credentials. Set either FIREBASE_SERVICE_ACCOUNT or individual vars (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)");
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || 'aspms-pro-v1',
  });
}

const db = admin.firestore();

async function createAdminAccount() {
  console.log('🔧 ARKA SERVICES - System Admin Setup');
  console.log('=====================================\n');

  const adminData = {
    email: 'vevart@vevarte.com',
    fullName: 'ARKA System Administrator',
    username: 'arkadmin',
    password: 'Admin@ARKA2025', // Change this after first login
    role: 'admin' as const,
  };

  try {
    // Check if admin already exists
    console.log('🔍 Checking for existing admin account...');
    const usersSnapshot = await db.collection('users').where('role', '==', 'admin').get();

    if (!usersSnapshot.empty) {
      console.log('⚠️  Admin account already exists!');
      console.log('\nExisting admin accounts:');
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.username} (${data.email})`);
      });
      console.log('\n❌ Setup aborted. Delete existing admin first or use different credentials.');
      process.exit(1);
    }

    // Check if username already taken
    const usernameCheck = await db.collection('users')
      .where('username', '==', adminData.username)
      .get();

    if (!usernameCheck.empty) {
      console.log(`❌ Username "${adminData.username}" already taken!`);
      process.exit(1);
    }

    // Check if email already taken
    const emailCheck = await db.collection('users')
      .where('email', '==', adminData.email)
      .get();

    if (!emailCheck.empty) {
      console.log(`❌ Email "${adminData.email}" already registered!`);
      process.exit(1);
    }

    console.log('✅ No existing admin found. Creating new admin account...\n');

    // Hash password
    const hashedPassword = bcrypt.hashSync(adminData.password, 10);

    // Create admin user
    const userRef = db.collection('users').doc();
    await userRef.set({
      id: userRef.id,
      firebaseUid: '', // Not using Firebase Auth for admin
      username: adminData.username,
      password: hashedPassword,
      role: adminData.role,
      fullName: adminData.fullName,
      email: adminData.email,
      phone: '',
      accountType: 'individual',
      isActive: true,
      createdAt: new Date(),
    });

    console.log('✅ System Admin Account Created Successfully!\n');
    console.log('📧 Admin Credentials:');
    console.log('=====================================');
    console.log(`   Email:    ${adminData.email}`);
    console.log(`   Username: ${adminData.username}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('=====================================\n');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Change the password immediately after first login');
    console.log('   2. Store these credentials securely');
    console.log('   3. Do not share admin access');
    console.log('   4. Enable 2FA when available\n');
    console.log('🚀 You can now login at: https://aspms-pro-v1.web.app/login');
    console.log('   Navigate to /admin after logging in\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }
}

// Run the script
createAdminAccount();
