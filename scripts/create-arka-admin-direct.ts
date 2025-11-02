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

// Initialize Firebase Admin with explicit settings to avoid emulator
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

async function createArkaServicesAdmin() {
  try {
    console.log('Creating ARKA SERVICES admin account...');
    console.log('Project ID:', 'aspms-pro-v1');

    const email = 'admin@arka.pk';
    const password = 'ArkaServices2025!'; // Strong default password
    const username = 'arkaservices';

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Firebase Auth user
    let uid: string;
    try {
      console.log('Creating Firebase Auth user...');
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: 'ARKA SERVICES',
        emailVerified: true, // Pre-verify the email
      });
      uid = userRecord.uid;
      console.log('✓ Created Firebase Auth user:', uid);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log('Auth user already exists, fetching...');
        const existingUser = await auth.getUserByEmail(email);
        uid = existingUser.uid;
        console.log('✓ Firebase Auth user already exists:', uid);
      } else {
        throw error;
      }
    }

    // Create Firestore user document
    console.log('Creating Firestore document...');
    const userData = {
      id: uid,
      username: username,
      email: email,
      password: hashedPassword,
      role: 'admin',
      firstName: 'ARKA',
      lastName: 'SERVICES',
      phone: '+92-300-0000000',
      dateOfBirth: new Date('1990-01-01'),
      address: 'ARKA Services Office',
      city: 'Lahore',
      country: 'Pakistan',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Special flags for ARKA admin
      isArkaAdmin: true, // Special flag to bypass all subscription checks
      // NO subscriptionId - this account never needs a subscription
    };

    await db.collection('users').doc(uid).set(userData);
    console.log('✓ Created Firestore user document');

    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║  ARKA SERVICES Admin Account Created     ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('\nCredentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  Role: admin');
    console.log('  Special: Bypasses all subscription checks\n');
    console.log('⚠️  IMPORTANT: Change password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating ARKA admin account:');
    console.error(error);
    process.exit(1);
  }
}

createArkaServicesAdmin();
