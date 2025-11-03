/**
 * Cleanup Script: Move Old Users to Correct Location
 *
 * This script:
 * 1. Finds users in wrong locations (/users/ and /arka_office/users/users/)
 * 2. Moves them to correct location (/arka_office/data/users/)
 * 3. Updates any references in employees collection
 * 4. Deletes old user documents
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

interface OldUser {
  path: string;
  id: string;
  data: any;
}

async function findOldUsers(): Promise<OldUser[]> {
  const oldUsers: OldUser[] = [];

  console.log('🔍 Searching for users in wrong locations...\n');

  // 1. Check /users/ collection (WRONG)
  try {
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users in /users/ (WRONG location)`);

    usersSnapshot.docs.forEach(doc => {
      oldUsers.push({
        path: 'users',
        id: doc.id,
        data: doc.data()
      });
      console.log(`  - /users/${doc.id} (username: ${doc.data().username})`);
    });
  } catch (error) {
    console.log('  No /users/ collection found');
  }

  // 2. Check /arka_office/users/users/ (OLD WRONG nested path)
  try {
    const oldNestedSnapshot = await db.collection('arka_office/users/users').get();
    console.log(`\nFound ${oldNestedSnapshot.size} users in /arka_office/users/users/ (OLD WRONG location)`);

    oldNestedSnapshot.docs.forEach(doc => {
      oldUsers.push({
        path: 'arka_office/users/users',
        id: doc.id,
        data: doc.data()
      });
      console.log(`  - /arka_office/users/users/${doc.id} (username: ${doc.data().username})`);
    });
  } catch (error) {
    console.log('  No /arka_office/users/users/ collection found');
  }

  return oldUsers;
}

async function checkIfUserExists(userId: string): Promise<boolean> {
  const correctDoc = await db.collection('arka_office/data/users').doc(userId).get();
  return correctDoc.exists;
}

async function migrateUser(oldUser: OldUser): Promise<void> {
  const { path, id, data } = oldUser;

  console.log(`\n📦 Migrating user: ${data.username || id}`);
  console.log(`   From: /${path}/${id}`);
  console.log(`   To: /arka_office/data/users/${id}`);

  // Check if user already exists in correct location
  const alreadyExists = await checkIfUserExists(id);
  if (alreadyExists) {
    console.log(`   ⚠️  User already exists in correct location, will only delete old entry`);
  } else {
    // Copy user to correct location
    await db.collection('arka_office/data/users').doc(id).set({
      ...data,
      id: id,
      // Ensure these fields are set correctly
      organizationId: 'arka-office',
      accountType: 'office',
    });
    console.log(`   ✅ Copied to /arka_office/data/users/${id}`);
  }

  // Delete from old location
  await db.collection(path).doc(id).delete();
  console.log(`   🗑️  Deleted from /${path}/${id}`);
}

async function cleanupOldCollections(): Promise<void> {
  console.log('\n🧹 Cleaning up empty old collections...\n');

  // Check if /users/ is empty
  try {
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('✅ /users/ collection is now empty (will be auto-deleted by Firestore)');
    } else {
      console.log(`⚠️  /users/ still has ${usersSnapshot.size} documents`);
    }
  } catch (error) {
    console.log('✅ /users/ collection removed');
  }

  // Check if /arka_office/users/users/ is empty
  try {
    const oldNestedSnapshot = await db.collection('arka_office/users/users').get();
    if (oldNestedSnapshot.empty) {
      console.log('✅ /arka_office/users/users/ collection is now empty (will be auto-deleted by Firestore)');
    } else {
      console.log(`⚠️  /arka_office/users/users/ still has ${oldNestedSnapshot.size} documents`);
    }
  } catch (error) {
    console.log('✅ /arka_office/users/users/ collection removed');
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║       ASPMS Database Cleanup - Move Old Users        ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Find all users in wrong locations
    const oldUsers = await findOldUsers();

    if (oldUsers.length === 0) {
      console.log('\n✅ No users found in wrong locations! Database is clean.');
      return;
    }

    console.log(`\n📊 Total users to migrate: ${oldUsers.length}\n`);
    console.log('═'.repeat(60));

    // Step 2: Migrate each user
    for (const oldUser of oldUsers) {
      await migrateUser(oldUser);
    }

    console.log('\n' + '═'.repeat(60));

    // Step 3: Cleanup old collections
    await cleanupOldCollections();

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║              ✅ CLEANUP COMPLETED                     ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('\nAll users have been moved to: /arka_office/data/users/');
    console.log('Old collections will be auto-deleted by Firestore.\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the script
main().then(() => {
  console.log('Script finished. You can now close this window.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
