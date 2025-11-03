/**
 * Check Current Database Structure
 * Lists all collections and their document counts
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

async function checkCollection(path: string): Promise<void> {
  try {
    const snapshot = await db.collection(path).get();

    if (snapshot.empty) {
      console.log(`  ${path}: (empty)`);
      return;
    }

    console.log(`  ${path}: ${snapshot.size} documents`);

    // List first 5 documents
    const docs = snapshot.docs.slice(0, 5);
    for (const doc of docs) {
      const data = doc.data();
      console.log(`    - ${doc.id} (${data.username || data.name || 'no name'})`);
    }

    if (snapshot.size > 5) {
      console.log(`    ... and ${snapshot.size - 5} more`);
    }
  } catch (error) {
    console.log(`  ${path}: ERROR - ${error.message}`);
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║          ASPMS Database Structure Check              ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  console.log(`Project: ${process.env.FIREBASE_PROJECT_ID}\n`);

  console.log('📊 Checking collections...\n');

  const collectionsToCheck = [
    'admins',
    'users',  // WRONG location
    'arka_office/metadata',
    'arka_office/data/users',  // CORRECT location
    'arka_office/data/employees',
    'arka_office/data/projects',
    'arka_office/data/clients',
    'arka_office/users/users',  // OLD WRONG location
    'individuals',
    'organizations',
  ];

  for (const collectionPath of collectionsToCheck) {
    await checkCollection(collectionPath);
  }

  console.log('\n✅ Check complete\n');
}

main().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
