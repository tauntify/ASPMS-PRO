import { db } from './db';
import { users, employees, projects, projectFinancials } from '@shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('Seeding database...');
  
  // Check if principle user already exists
  const existingPrinciple = await db.select().from(users).where(eq(users.username, 'ZARA'));
  
  if (existingPrinciple.length === 0) {
    // Create default principle user
    await db.insert(users).values({
      username: 'ZARA',
      password: hashPassword('saroshahsanto'),
      role: 'principle',
      fullName: 'ZARA (Principle)',
      isActive: 1,
    }).returning();
    
    console.log('✅ Created default principle user: ZARA / saroshahsanto');
  } else {
    console.log('✅ Principle user already exists');
  }

  // Check if procurement user already exists
  const existingProcurement = await db.select().from(users).where(eq(users.username, 'procurement'));
  
  if (existingProcurement.length === 0) {
    // Create default procurement user
    await db.insert(users).values({
      username: 'procurement',
      password: hashPassword('procurement123'),
      role: 'procurement',
      fullName: 'Procurement Manager',
      isActive: 1,
    }).returning();
    
    console.log('✅ Created default procurement user: procurement / procurement123');
  } else {
    console.log('✅ Procurement user already exists');
  }
}

// Run seed if called directly (only in development/manual execution)
// Note: Never call process.exit() when imported as a module to prevent server termination
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const isMainModule = import.meta.url === `file://${process.argv[1]}`;
  if (isMainModule) {
    seedDatabase()
      .then(() => {
        console.log('✅ Seeding complete');
        // Only exit if run directly as a script, not when imported
        if (typeof process !== 'undefined' && process.exit) {
          process.exit(0);
        }
      })
      .catch((error) => {
        console.error('❌ Seeding failed:', error);
        if (typeof process !== 'undefined' && process.exit) {
          process.exit(1);
        }
      });
  }
}
