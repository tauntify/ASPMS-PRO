import { db } from "./firebase";
import { User } from "@shared/schema";

/**
 * Helper to determine the correct collection path based on user context
 * This enables our multi-tenant database structure
 */

export interface CollectionPaths {
  users: string;
  projects: string;
  employees: string;
  clients: string;
  expenses: string;
  timesheets: string;
  tasks: string;
  salaries: string;
  attendance: string;
  procurementItems: string;
  projectAssignments: string;
  divisions: string;
  items: string;
}

export function getCollectionPaths(user: User): CollectionPaths {
  console.log(`🔍 Getting collection paths for user: ${user.username} (${user.role}), accountType: ${user.accountType}`);

  // Founder/Super Admin - access ARKA Office data by default
  if (user.isFounder || (user.role === 'admin' && user.isArkaAdmin)) {
    console.log('   → Using ARKA Office paths (Founder/Admin)');
    return {
      users: 'arka_office/data/users',
      projects: 'arka_office/data/projects',
      employees: 'arka_office/data/employees',
      clients: 'arka_office/data/clients',
      expenses: 'arka_office/data/expenses',
      timesheets: 'arka_office/data/timesheets',
      tasks: 'arka_office/data/tasks',
      salaries: 'arka_office/data/salaries',
      attendance: 'arka_office/data/attendance',
      procurementItems: 'arka_office/data/procurementItems',
      projectAssignments: 'arka_office/data/projectAssignments',
      divisions: 'arka_office/data/divisions',
      items: 'arka_office/data/items',
    };
  }

  // ARKA Office account (principle, employees, clients)
  if (user.organizationId === 'arka-office' || user.accountType === 'office') {
    console.log('   → Using ARKA Office paths');
    return {
      users: 'arka_office/data/users',
      projects: 'arka_office/data/projects',
      employees: 'arka_office/data/employees',
      clients: 'arka_office/data/clients',
      expenses: 'arka_office/data/expenses',
      timesheets: 'arka_office/data/timesheets',
      tasks: 'arka_office/data/tasks',
      salaries: 'arka_office/data/salaries',
      attendance: 'arka_office/data/attendance',
      procurementItems: 'arka_office/data/procurementItems',
      projectAssignments: 'arka_office/data/projectAssignments',
      divisions: 'arka_office/data/divisions',
      items: 'arka_office/data/items',
    };
  }

  // Individual subscriber
  if (user.accountType === 'individual') {
    const userId = user.id;
    console.log(`   → Using Individual paths for user ${userId}`);
    return {
      users: `individuals/${userId}/data/users`,
      projects: `individuals/${userId}/data/projects`,
      employees: `individuals/${userId}/data/employees`,
      clients: `individuals/${userId}/data/clients`,
      expenses: `individuals/${userId}/data/expenses`,
      timesheets: `individuals/${userId}/data/timesheets`,
      tasks: `individuals/${userId}/data/tasks`,
      salaries: `individuals/${userId}/data/salaries`,
      attendance: `individuals/${userId}/data/attendance`,
      procurementItems: `individuals/${userId}/data/procurementItems`,
      projectAssignments: `individuals/${userId}/data/projectAssignments`,
      divisions: `individuals/${userId}/data/divisions`,
      items: `individuals/${userId}/data/items`,
    };
  }

  // Organization subscriber
  if (user.accountType === 'organization') {
    const orgId = user.organizationId || `org_${user.id}`;
    console.log(`   → Using Organization paths for ${orgId}`);
    return {
      users: `organizations/${orgId}/data/users`,
      projects: `organizations/${orgId}/data/projects`,
      employees: `organizations/${orgId}/data/employees`,
      clients: `organizations/${orgId}/data/clients`,
      expenses: `organizations/${orgId}/data/expenses`,
      timesheets: `organizations/${orgId}/data/timesheets`,
      tasks: `organizations/${orgId}/data/tasks`,
      salaries: `organizations/${orgId}/data/salaries`,
      attendance: `organizations/${orgId}/data/attendance`,
      procurementItems: `organizations/${orgId}/data/procurementItems`,
      projectAssignments: `organizations/${orgId}/data/projectAssignments`,
      divisions: `organizations/${orgId}/data/divisions`,
      items: `organizations/${orgId}/data/items`,
    };
  }

  // Default fallback - use ARKA Office
  console.warn('⚠️  No collection path match for user:', user.username, user.accountType, '- defaulting to ARKA Office');
  return {
    users: 'arka_office/data/users',
    projects: 'arka_office/data/projects',
    employees: 'arka_office/data/employees',
    clients: 'arka_office/data/clients',
    expenses: 'arka_office/data/expenses',
    timesheets: 'arka_office/data/timesheets',
    tasks: 'arka_office/data/tasks',
    salaries: 'arka_office/data/salaries',
    attendance: 'arka_office/data/attendance',
    procurementItems: 'arka_office/data/procurementItems',
    projectAssignments: 'arka_office/data/projectAssignments',
    divisions: 'arka_office/data/divisions',
    items: 'arka_office/data/items',
  };
}

/**
 * Get user by ID from any collection
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    console.log(`🔍 Getting user by ID: ${userId}`);

    // 1. Check admins
    console.log('   → Checking admins collection...');
    const adminDoc = await db.collection('admins').doc(userId).get();
    if (adminDoc.exists) {
      console.log('   ✅ Found in admins collection');
      return { id: adminDoc.id, ...adminDoc.data() } as User;
    }

    // 2. Check arka_office/data/users (FIXED PATH)
    console.log('   → Checking arka_office/data/users...');
    const arkaUserDoc = await db.collection('arka_office/data/users').doc(userId).get();
    if (arkaUserDoc.exists) {
      console.log('   ✅ Found in arka_office/data/users');
      return { id: arkaUserDoc.id, ...arkaUserDoc.data() } as User;
    }

    // 3. Check individuals
    console.log('   → Checking individuals...');
    const individualsSnapshot = await db.collection('individuals').get();
    for (const individualDoc of individualsSnapshot.docs) {
      if (individualDoc.id === '_placeholder') continue;

      // Check profile collection
      const profileDoc = await db.collection(`individuals/${individualDoc.id}/profile`).doc(userId).get();
      if (profileDoc.exists) {
        console.log(`   ✅ Found in individuals/${individualDoc.id}/profile`);
        return { id: profileDoc.id, ...profileDoc.data() } as User;
      }

      // Check data/users subcollection
      const userDoc = await db.collection(`individuals/${individualDoc.id}/data/users`).doc(userId).get();
      if (userDoc.exists) {
        console.log(`   ✅ Found in individuals/${individualDoc.id}/data/users`);
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
    }

    // 4. Check organizations
    console.log('   → Checking organizations...');
    const orgsSnapshot = await db.collection('organizations').get();
    for (const orgDoc of orgsSnapshot.docs) {
      if (orgDoc.id === '_placeholder') continue;

      const userDoc = await db.collection(`organizations/${orgDoc.id}/data/users`).doc(userId).get();
      if (userDoc.exists) {
        console.log(`   ✅ Found in organizations/${orgDoc.id}/data/users`);
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
    }

    console.log('   ❌ User not found in any collection');
    return null;
  } catch (error) {
    console.error('❌ Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user document from correct collection based on email/username
 */
export async function getUserFromAnyCollection(usernameOrEmail: string): Promise<User | null> {
  console.log(`🔍 Searching for user: ${usernameOrEmail}`);

  try {
    // 1. Check admins collection (founders and super admins)
    console.log('   → Checking admins collection...');
    const adminsSnapshot = await db.collection('admins').get();
    for (const doc of adminsSnapshot.docs) {
      const user = doc.data() as User;
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        console.log('   ✅ Found in admins collection');
        return user;
      }
    }

    // 2. Check arka_office/data/users
    console.log('   → Checking arka_office/data/users...');
    const arkaUsersSnapshot = await db.collection('arka_office/data/users').get();
    for (const doc of arkaUsersSnapshot.docs) {
      const user = doc.data() as User;
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        console.log('   ✅ Found in arka_office/data/users');
        return user;
      }
    }

    // 3. Check individuals
    console.log('   → Checking individuals...');
    const individualsSnapshot = await db.collection('individuals').get();
    for (const individualDoc of individualsSnapshot.docs) {
      if (individualDoc.id === '_placeholder') continue;

      const profileSnapshot = await db.collection(`individuals/${individualDoc.id}/profile`).get();
      for (const doc of profileSnapshot.docs) {
        const user = doc.data() as User;
        if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
          console.log(`   ✅ Found in individuals/${individualDoc.id}/profile`);
          return user;
        }
      }

      // Also check data/users subcollection
      const usersSnapshot = await db.collection(`individuals/${individualDoc.id}/data/users`).get();
      for (const doc of usersSnapshot.docs) {
        const user = doc.data() as User;
        if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
          console.log(`   ✅ Found in individuals/${individualDoc.id}/data/users`);
          return user;
        }
      }
    }

    // 4. Check organizations
    console.log('   → Checking organizations...');
    const orgsSnapshot = await db.collection('organizations').get();
    for (const orgDoc of orgsSnapshot.docs) {
      if (orgDoc.id === '_placeholder') continue;

      const usersSnapshot = await db.collection(`organizations/${orgDoc.id}/data/users`).get();
      for (const doc of usersSnapshot.docs) {
        const user = doc.data() as User;
        if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
          console.log(`   ✅ Found in organizations/${orgDoc.id}/data/users`);
          return user;
        }
      }
    }

    console.log('   ❌ User not found in any collection');
    return null;
  } catch (error) {
    console.error('❌ Error searching for user:', error);
    return null;
  }
}
