import 'dotenv/config';
import { storage } from './storage';
import { hashPassword } from './auth';

async function seedAdmin() {
  try {
    console.log('Testing Firebase connection...');
    
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      console.log('  Username: admin');
      console.log('  ID:', existingAdmin.id);
      return;
    }
    
    // Create default admin user
    console.log('Creating default admin user...');
    const admin = await storage.createUser({
      firebaseUid: '',
      username: 'admin',
      password: hashPassword('admin123'),
      fullName: 'System Administrator',
      role: 'principle',
    });
    
    console.log('✓ Admin user created successfully!');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  ID:', admin.id);
    console.log('\nYou can now login with these credentials.');
    
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

seedAdmin().then(() => process.exit(0));
