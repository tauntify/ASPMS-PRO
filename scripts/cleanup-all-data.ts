import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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

async function deleteCollection(collectionName: string) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    console.log(`   ✓ Collection '${collectionName}' is already empty`);
    return 0;
  }

  let deleteCount = 0;
  const batchSize = 100;

  while (true) {
    const snapshot = await collectionRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    await batch.commit();
  }

  console.log(`   ✓ Deleted ${deleteCount} documents from '${collectionName}'`);
  return deleteCount;
}

async function deleteAllAuthUsers() {
  let deleteCount = 0;
  let pageToken: string | undefined;

  do {
    const listUsersResult = await auth.listUsers(1000, pageToken);

    for (const user of listUsersResult.users) {
      try {
        await auth.deleteUser(user.uid);
        deleteCount++;
        console.log(`   ✓ Deleted auth user: ${user.email || user.uid}`);
      } catch (error) {
        console.error(`   ✗ Failed to delete ${user.email}:`, error);
      }
    }

    pageToken = listUsersResult.pageToken;
  } while (pageToken);

  return deleteCount;
}

async function cleanupAllData() {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  CLEANING UP ALL DATA - FRESH START                  ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('🗑️  Step 1: Deleting all Firestore collections...\n');

    const collections = [
      'users',
      'subscriptions',
      'projects',
      'divisions',
      'items',
      'employees',
      'tasks',
      'procurementItems',
      'salaries',
      'salaryAdvances',
      'salaryPayments',
      'attendance',
      'projectAssignments',
      'comments',
      'projectFinancials',
    ];

    let totalDeleted = 0;
    for (const collection of collections) {
      const count = await deleteCollection(collection);
      totalDeleted += count;
    }

    console.log(`\n   📊 Total Firestore documents deleted: ${totalDeleted}`);

    console.log('\n🗑️  Step 2: Deleting all Firebase Auth users...\n');

    const authDeleted = await deleteAllAuthUsers();
    console.log(`\n   📊 Total Auth users deleted: ${authDeleted}`);

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  CLEANUP COMPLETE - DATABASE IS NOW EMPTY            ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log('✅ All users deleted');
    console.log('✅ All projects deleted');
    console.log('✅ All subscriptions deleted');
    console.log('✅ All data cleared');
    console.log('\n🎯 Ready for fresh account creation!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during cleanup:');
    console.error(error);
    process.exit(1);
  }
}

cleanupAllData();
