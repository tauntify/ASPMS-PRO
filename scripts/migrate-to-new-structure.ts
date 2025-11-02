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

async function migrateToNewStructure() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  MIGRATING TO NEW DATABASE STRUCTURE                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Step 1: Create Founder in admins collection
    console.log('📝 Step 1: Creating Founder in admins collection...\n');

    const founderPassword = 'Founder2025!';
    const founderHashedPassword = await bcrypt.hash(founderPassword, 10);

    let founderUid: string;
    try {
      const founderRecord = await auth.createUser({
        email: 'founder@arka.pk',
        password: founderPassword,
        displayName: 'Founder',
        emailVerified: true,
      });
      founderUid = founderRecord.uid;
      console.log('   ✓ Created Firebase Auth for founder');
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        const existing = await auth.getUserByEmail('founder@arka.pk');
        founderUid = existing.uid;
        console.log('   ✓ Using existing Firebase Auth for founder');
      } else {
        throw error;
      }
    }

    await db.collection('admins').doc(founderUid).set({
      id: founderUid,
      username: 'founder',
      email: 'founder@arka.pk',
      password: founderHashedPassword,
      role: 'admin',
      firstName: 'Founder',
      lastName: 'Admin',
      phone: '+92-300-0000000',
      dateOfBirth: new Date('1990-01-01'),
      address: 'ARKA Services',
      city: 'Lahore',
      country: 'Pakistan',
      isActive: true,
      isFounder: true,
      isArkaAdmin: true,
      canAccessAllData: true,
      accountType: 'founder',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('   ✓ Created founder in admins collection\n');

    // Step 2: Create ARKA Office structure
    console.log('📝 Step 2: Creating ARKA Office structure...\n');

    // Create office profile
    await db.collection('arka_office').doc('profile').set({
      organizationId: 'arka-office',
      organizationName: 'ARKA Services Office',
      accountType: 'office',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('   ✓ Created ARKA office profile');

    // Create office user
    const officePassword = 'Office2025!';
    const officeHashedPassword = await bcrypt.hash(officePassword, 10);

    let officeUid: string;
    try {
      const officeRecord = await auth.createUser({
        email: 'office@arka.pk',
        password: officePassword,
        displayName: 'ARKA Office',
        emailVerified: true,
      });
      officeUid = officeRecord.uid;
      console.log('   ✓ Created Firebase Auth for office');
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        const existing = await auth.getUserByEmail('office@arka.pk');
        officeUid = existing.uid;
        console.log('   ✓ Using existing Firebase Auth for office');
      } else {
        throw error;
      }
    }

    await db.collection('arka_office').doc('users').collection('users').doc(officeUid).set({
      id: officeUid,
      username: 'arkaoffice',
      email: 'office@arka.pk',
      password: officeHashedPassword,
      role: 'principle',
      firstName: 'ARKA',
      lastName: 'Office',
      phone: '+92-300-0000000',
      dateOfBirth: new Date('1990-01-01'),
      address: 'ARKA Services Office',
      city: 'Lahore',
      country: 'Pakistan',
      isActive: true,
      isArkaAdmin: true,
      organizationId: 'arka-office',
      organizationName: 'ARKA Services Office',
      accountType: 'office',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('   ✓ Created office user in arka_office/users\n');

    // Step 3: Create empty subcollections for ARKA office
    console.log('📝 Step 3: Initializing ARKA office subcollections...\n');

    const arkaCollections = ['projects', 'employees', 'clients', 'expenses', 'timesheets'];
    for (const collectionName of arkaCollections) {
      // Create a placeholder document (will be deleted when first real document is added)
      await db.collection('arka_office').doc(collectionName).set({
        _placeholder: true,
        _note: `This is a placeholder. Real ${collectionName} will be added here.`,
        createdAt: new Date(),
      });
      console.log(`   ✓ Initialized ${collectionName} collection`);
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  MIGRATION COMPLETE - NEW STRUCTURE READY                ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📊 Database Structure:\n');
    console.log('admins/');
    console.log(`  └── ${founderUid} (founder)`);
    console.log('');
    console.log('arka_office/');
    console.log('  ├── profile');
    console.log('  ├── users/');
    console.log(`  │   └── ${officeUid} (arkaoffice)`);
    console.log('  ├── projects/ (ready for data)');
    console.log('  ├── employees/ (ready for data)');
    console.log('  ├── clients/ (ready for data)');
    console.log('  ├── expenses/ (ready for data)');
    console.log('  └── timesheets/ (ready for data)');
    console.log('');
    console.log('individuals/ (empty, ready for signups)');
    console.log('custom_businesses/ (empty, ready for signups)');
    console.log('organizations/ (empty, ready for signups)');
    console.log('subscriptions/ (empty, ready for subscriptions)');
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 FOUNDER ACCOUNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Collection: admins/');
    console.log('   Username:   founder');
    console.log('   Password:   Founder2025!');
    console.log('   Email:      founder@arka.pk');
    console.log('   Access:     ALL collections, ALL data');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 ARKA OFFICE ACCOUNT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Collection: arka_office/users/');
    console.log('   Username:   arkaoffice');
    console.log('   Password:   Office2025!');
    console.log('   Email:      office@arka.pk');
    console.log('   Access:     arka_office/* only');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Next Steps:');
    console.log('   1. Update storage layer to use new collections');
    console.log('   2. Update API routes');
    console.log('   3. Update signup flow');
    console.log('   4. Test login with both accounts\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:');
    console.error(error);
    process.exit(1);
  }
}

migrateToNewStructure();
