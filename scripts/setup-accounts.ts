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

interface AccountConfig {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: 'admin' | 'principle' | 'employee' | 'client' | 'procurement';
  firstName: string;
  lastName: string;
  accountType: 'founder' | 'admin' | 'office' | 'regular';
  description: string;
  privileges: string[];
}

async function createAccount(config: AccountConfig) {
  const { email, password, username, displayName, role, firstName, lastName, accountType, description } = config;

  console.log(`\n📝 Creating ${accountType.toUpperCase()} account: ${username}`);

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
    console.log(`   ✓ Firebase Auth user created`);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      const existingUser = await auth.getUserByEmail(email);
      uid = existingUser.uid;
      console.log(`   ⚠️  Auth user already exists, using existing`);
    } else {
      throw error;
    }
  }

  // Create Firestore user document with enhanced data isolation
  const userData: any = {
    id: uid,
    username: username,
    email: email,
    password: hashedPassword,
    role: role,
    firstName: firstName,
    lastName: lastName,
    phone: '+92-300-0000000',
    dateOfBirth: new Date('1990-01-01'),
    address: 'ARKA Services',
    city: 'Lahore',
    country: 'Pakistan',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),

    // Account type classification
    accountType: accountType, // 'founder', 'admin', 'office', 'regular'
  };

  // Special flags based on account type
  if (accountType === 'founder') {
    userData.isFounder = true;
    userData.isArkaAdmin = true;
    userData.canAccessAllData = true;
    // NO subscriptionId - founders never need subscriptions
    // NO organizationId - founders are above organizations
  } else if (accountType === 'admin') {
    userData.isArkaAdmin = true;
    userData.canAccessAllData = true;
    // NO subscriptionId - admins never need subscriptions
    // NO organizationId - admins are above organizations
  } else if (accountType === 'office') {
    userData.isArkaAdmin = true; // Bypass subscription checks
    userData.organizationId = 'arka-office'; // ARKA's internal organization
    userData.organizationName = 'ARKA Services Office';
    // NO subscriptionId - ARKA office doesn't need subscription
  } else {
    // Regular users will need organizationId and subscriptionId when created
    // These will be set when they sign up or are added by a principle
  }

  await db.collection('users').doc(uid).set(userData);
  console.log(`   ✓ Firestore user document created`);
  console.log(`   ℹ️  ${description}`);

  return { uid, email, username, password, role, accountType };
}

async function setupAccounts() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  SETTING UP ARKA SERVICES ACCOUNT STRUCTURE          ║');
    console.log('╚═══════════════════════════════════════════════════════╝');

    console.log('\n📋 Account Structure:');
    console.log('   1. FOUNDER - System owner, full control');
    console.log('   2. OFFICE - ARKA internal operations (like principle)');
    console.log('   3. Regular users - Created via signup or by principles\n');

    const accounts: AccountConfig[] = [
      {
        email: 'founder@arka.pk',
        password: 'Founder2025!',
        username: 'founder',
        displayName: 'Founder',
        role: 'admin',
        firstName: 'Founder',
        lastName: 'Admin',
        accountType: 'founder',
        description: 'Main system administrator and founder',
        privileges: [
          'Full system access',
          'Manage all users',
          'View all data across organizations',
          'System settings',
          'No subscription required',
          'Can impersonate any user',
          'Access admin dashboard'
        ]
      },
      {
        email: 'office@arka.pk',
        password: 'Office2025!',
        username: 'arkaoffice',
        displayName: 'ARKA Office',
        role: 'principle',
        firstName: 'ARKA',
        lastName: 'Office',
        accountType: 'office',
        description: 'ARKA internal operations account',
        privileges: [
          'Manage ARKA office projects',
          'Add/manage employees',
          'Manage clients',
          'Track budgets and expenses',
          'Generate reports',
          'No subscription required',
          'Access principle dashboard',
          'Unlimited projects/employees'
        ]
      }
    ];

    const createdAccounts = [];

    for (const account of accounts) {
      const created = await createAccount(account);
      createdAccounts.push({ ...created, privileges: account.privileges });
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  ACCOUNT SETUP COMPLETE                               ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    // Display account details
    for (const account of createdAccounts) {
      const config = accounts.find(a => a.username === account.username)!;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`${config.accountType === 'founder' ? '👑' : '🏢'} ${config.accountType.toUpperCase()} ACCOUNT`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Email:     ${account.email}`);
      console.log(`   Username:  ${account.username}`);
      console.log(`   Password:  ${account.password}`);
      console.log(`   Role:      ${account.role}`);
      console.log(`   Dashboard: ${account.role === 'admin' ? 'Admin Dashboard' : 'Principle Dashboard'}`);
      console.log(`\n   Privileges:`);
      config.privileges.forEach(priv => console.log(`   ✓ ${priv}`));
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 NOTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   • Both accounts bypass all subscription checks');
    console.log('   • FOUNDER: Use for system administration');
    console.log('   • OFFICE: Use for ARKA business operations');
    console.log('   • Regular users will be created via signup');
    console.log('   • Change passwords after first login!');
    console.log('');
    console.log('🌐 Login URL: https://aspms-pro-v1.web.app/login');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up accounts:');
    console.error(error);
    process.exit(1);
  }
}

setupAccounts();
