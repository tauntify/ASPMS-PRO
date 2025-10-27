// Helper script to encode Firebase private key to base64
// This makes it safe to paste into Render environment variables

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔑 Firebase Private Key Encoder\n');

// Read the private key from .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Extract the FIREBASE_PRIVATE_KEY value
const match = envContent.match(/FIREBASE_PRIVATE_KEY="(.+?)"/s);

if (!match || !match[1]) {
  console.error('❌ Could not find FIREBASE_PRIVATE_KEY in .env file');
  process.exit(1);
}

let privateKey = match[1];

// Replace literal \n with actual newlines
privateKey = privateKey.replace(/\\n/g, '\n');

console.log('✅ Private key extracted from .env file');
console.log('📏 Original length:', privateKey.length, 'characters\n');

// Encode to base64
const base64Key = Buffer.from(privateKey, 'utf-8').toString('base64');

console.log('✅ Encoded to base64');
console.log('📏 Base64 length:', base64Key.length, 'characters\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 COPY THIS VALUE TO RENDER:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(base64Key);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n📝 INSTRUCTIONS:');
console.log('1. Copy the base64 string above');
console.log('2. Go to Render Dashboard → Your Service → Environment');
console.log('3. Find FIREBASE_PRIVATE_KEY');
console.log('4. Delete the current value');
console.log('5. Paste the base64 string (one long line, no quotes)');
console.log('6. Save Changes');
console.log('7. Render will auto-redeploy\n');

// Verify by decoding
const decoded = Buffer.from(base64Key, 'base64').toString('utf-8');
const isValid = decoded === privateKey;

console.log('🔍 Verification:', isValid ? '✅ PASSED' : '❌ FAILED');
if (isValid) {
  console.log('   The encoding is correct and will work!\n');
}
