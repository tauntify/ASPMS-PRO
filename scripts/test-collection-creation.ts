import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

delete process.env.FIRESTORE_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

const serviceAccountPath = 'C:\\Users\\PC\\Desktop\\ASPMS-1\\aspms-pro-v1-firebase-adminsdk-fbsvc-3fdb4c7bf0.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'aspms-pro-v1',
});

const db = getFirestore();
db.settings({ host: 'firestore.googleapis.com', ssl: true });

async function testCollectionCreation() {
  console.log('\n🧪 Testing Automatic Collection Creation\n');

  // Test 1: Create Individual
  console.log('1️⃣  Creating test individual...');
  await db.collection('individuals').doc('ind_TEST123').set({
    profile: {
      userId: 'test-user-1',
      username: 'testindividual',
      subscriptionTier: 'individual',
      createdAt: new Date(),
    }
  });
  console.log('   ✅ Individual collection created!\n');

  // Test 2: Create Custom Business
  console.log('2️⃣  Creating test custom business...');
  await db.collection('custom_businesses').doc('cust_TEST456').set({
    profile: {
      organizationId: 'cust_TEST456',
      organizationName: 'Test Custom Business',
      subscriptionTier: 'custom',
      createdAt: new Date(),
    }
  });
  console.log('   ✅ Custom businesses collection created!\n');

  // Test 3: Create Organization
  console.log('3️⃣  Creating test organization...');
  await db.collection('organizations').doc('org_TEST789').set({
    profile: {
      organizationId: 'org_TEST789',
      organizationName: 'Test Organization Inc',
      subscriptionTier: 'organization',
      createdAt: new Date(),
    }
  });
  console.log('   ✅ Organizations collection created!\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SUCCESS - All Collections Created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Now you should see these collections in Firebase Console:');
  console.log('  ✓ admins/');
  console.log('  ✓ arka_office/');
  console.log('  ✓ individuals/ ← NEW!');
  console.log('  ✓ custom_businesses/ ← NEW!');
  console.log('  ✓ organizations/ ← NEW!\n');

  console.log('🌐 Check Firebase Console:');
  console.log('   https://console.firebase.google.com/project/aspms-pro-v1/firestore\n');

  console.log('🧹 Cleanup: Delete test documents...');
  await db.collection('individuals').doc('ind_TEST123').delete();
  await db.collection('custom_businesses').doc('cust_TEST456').delete();
  await db.collection('organizations').doc('org_TEST789').delete();
  console.log('   ✅ Test data cleaned up\n');

  console.log('Note: Empty collections disappear from console, but they');
  console.log('will reappear automatically when users sign up!\n');

  process.exit(0);
}

testCollectionCreation();
