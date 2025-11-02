import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';

// Clear any emulator environment variables
delete process.env.FIRESTORE_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

// Load service account key
const serviceAccountPath = 'C:\\Users\\PC\\Desktop\\ASPMS-1\\aspms-pro-v1-firebase-adminsdk-fbsvc-3fdb4c7bf0.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: 'aspms-pro-v1',
  databaseURL: `https://aspms-pro-v1.firebaseio.com`
});

const db = getFirestore();
const auth = getAuth();

// Ensure we're not using emulator
db.settings({
  host: 'firestore.googleapis.com',
  ssl: true
});

async function createAccount(accountData: {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: string;
  firstName: string;
  lastName: string;
  isArkaAdmin?: boolean;
  isFounder?: boolean;
}) {
  const { email, password, username, displayName, role, firstName, lastName, isArkaAdmin, isFounder } = accountData;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create Firebase Auth user
  let uid: string;
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true,
    });
    uid = userRecord.uid;
    console.log(`✓ Created Firebase Auth user: ${email} (${uid})`);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      const existingUser = await auth.getUserByEmail(email);
      uid = existingUser.uid;
      console.log(`✓ Firebase Auth user already exists: ${email} (${uid})`);
    } else {
      throw error;
    }
  }

  // Create Firestore user document
  const userData = {
    id: uid,
    username: username,
    email: email,
    password: hashedPassword,
    role: role,
    firstName: firstName,
    lastName: lastName,
    phone: '+92-300-0000000',
    dateOfBirth: new Date('1990-01-01'),
    address: 'ARKA Services Office',
    city: 'Lahore',
    country: 'Pakistan',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...(isArkaAdmin && { isArkaAdmin: true }),
    ...(isFounder && { isFounder: true }),
    // NO subscriptionId - these accounts never need subscriptions
  };

  await db.collection('users').doc(uid).set(userData);
  console.log(`✓ Created Firestore user document for ${email}`);

  return { uid, email, username, password, role };
}

async function createBothAdmins() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  Creating ARKA SERVICES Admin Accounts               ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Account 1: Main Founder/Administrator Account
    console.log('1️⃣  Creating FOUNDER/ADMINISTRATOR Account...\n');
    const founder = await createAccount({
      email: 'founder@arka.pk',
      password: 'Founder2025!',
      username: 'founder',
      displayName: 'Founder Administrator',
      role: 'admin',
      firstName: 'Founder',
      lastName: 'Admin',
      isFounder: true, // Special founder flag
      isArkaAdmin: true, // Also has admin privileges
    });

    console.log('\n2️⃣  Creating OFFICE/PRINCIPLE Account...\n');
    // Account 2: Office Account (Principle role, no subscription)
    const office = await createAccount({
      email: 'office@arka.pk',
      password: 'Office2025!',
      username: 'arkaoffice',
      displayName: 'ARKA Services Office',
      role: 'principle',
      firstName: 'ARKA',
      lastName: 'Office',
      isArkaAdmin: true, // Bypasses subscription checks
    });

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  Both Admin Accounts Created Successfully!           ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  FOUNDER/ADMINISTRATOR ACCOUNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Email:    ', founder.email);
    console.log('   Username: ', founder.username);
    console.log('   Password: ', founder.password);
    console.log('   Role:     ', 'Admin (Full System Access)');
    console.log('   Purpose:  ', 'Main system administrator & founder');
    console.log('   Access:   ', 'Admin panel, user management, system settings');
    console.log('   Special:  ', 'isFounder: true, isArkaAdmin: true');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  OFFICE/PRINCIPLE ACCOUNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Email:    ', office.email);
    console.log('   Username: ', office.username);
    console.log('   Password: ', office.password);
    console.log('   Role:     ', 'Principle (Organization Management)');
    console.log('   Purpose:  ', 'Manage ARKA office operations');
    console.log('   Access:   ', 'Projects, employees, clients, budgets, timesheets');
    console.log('   Special:  ', 'isArkaAdmin: true (No subscription required)');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚠️  IMPORTANT: Change both passwords after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin accounts:');
    console.error(error);
    process.exit(1);
  }
}

createBothAdmins();
