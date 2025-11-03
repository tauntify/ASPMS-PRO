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
  // Founder/Admin - access all data across all collections
  if (user.isFounder || (user.role === 'admin' && user.isArkaAdmin)) {
    // For founders, we need to specify which organization they're viewing
    // For now, default to arka_office for admin operations
    return {
      users: 'arka_office/users/users',
      projects: 'arka_office/projects',
      employees: 'arka_office/employees',
      clients: 'arka_office/clients',
      expenses: 'arka_office/expenses',
      timesheets: 'arka_office/timesheets',
      tasks: 'arka_office/tasks',
      salaries: 'arka_office/salaries',
      attendance: 'arka_office/attendance',
      procurementItems: 'arka_office/procurementItems',
      projectAssignments: 'arka_office/projectAssignments',
      divisions: 'arka_office/divisions',
      items: 'arka_office/items',
    };
  }

  // ARKA Office account
  if (user.organizationId === 'arka-office') {
    return {
      users: 'arka_office/users/users',
      projects: 'arka_office/projects',
      employees: 'arka_office/employees',
      clients: 'arka_office/clients',
      expenses: 'arka_office/expenses',
      timesheets: 'arka_office/timesheets',
      tasks: 'arka_office/tasks',
      salaries: 'arka_office/salaries',
      attendance: 'arka_office/attendance',
      procurementItems: 'arka_office/procurementItems',
      projectAssignments: 'arka_office/projectAssignments',
      divisions: 'arka_office/divisions',
      items: 'arka_office/items',
    };
  }

  // Individual user
  if (user.accountType === 'individual' || user.subscriptionTier === 'individual') {
    const userId = user.id;
    return {
      users: `individuals/ind_${userId}/users`,
      projects: `individuals/ind_${userId}/projects`,
      employees: `individuals/ind_${userId}/employees`,
      clients: `individuals/ind_${userId}/clients`,
      expenses: `individuals/ind_${userId}/expenses`,
      timesheets: `individuals/ind_${userId}/timesheets`,
      tasks: `individuals/ind_${userId}/tasks`,
      salaries: `individuals/ind_${userId}/salaries`,
      attendance: `individuals/ind_${userId}/attendance`,
      procurementItems: `individuals/ind_${userId}/procurementItems`,
      projectAssignments: `individuals/ind_${userId}/projectAssignments`,
      divisions: `individuals/ind_${userId}/divisions`,
      items: `individuals/ind_${userId}/items`,
    };
  }

  // Custom business
  if (user.accountType === 'custom' || user.subscriptionTier === 'custom') {
    const orgId = user.organizationId || `cust_${user.id}`;
    return {
      users: `custom_businesses/${orgId}/users`,
      projects: `custom_businesses/${orgId}/projects`,
      employees: `custom_businesses/${orgId}/employees`,
      clients: `custom_businesses/${orgId}/clients`,
      expenses: `custom_businesses/${orgId}/expenses`,
      timesheets: `custom_businesses/${orgId}/timesheets`,
      tasks: `custom_businesses/${orgId}/tasks`,
      salaries: `custom_businesses/${orgId}/salaries`,
      attendance: `custom_businesses/${orgId}/attendance`,
      procurementItems: `custom_businesses/${orgId}/procurementItems`,
      projectAssignments: `custom_businesses/${orgId}/projectAssignments`,
      divisions: `custom_businesses/${orgId}/divisions`,
      items: `custom_businesses/${orgId}/items`,
    };
  }

  // Organization
  if (user.accountType === 'organization' || user.subscriptionTier === 'organization') {
    const orgId = user.organizationId || `org_${user.id}`;
    return {
      users: `organizations/${orgId}/users`,
      projects: `organizations/${orgId}/projects`,
      employees: `organizations/${orgId}/employees`,
      clients: `organizations/${orgId}/clients`,
      expenses: `organizations/${orgId}/expenses`,
      timesheets: `organizations/${orgId}/timesheets`,
      tasks: `organizations/${orgId}/tasks`,
      salaries: `organizations/${orgId}/salaries`,
      attendance: `organizations/${orgId}/attendance`,
      procurementItems: `organizations/${orgId}/procurementItems`,
      projectAssignments: `organizations/${orgId}/projectAssignments`,
      divisions: `organizations/${orgId}/divisions`,
      items: `organizations/${orgId}/items`,
    };
  }

  // Default fallback (shouldn't happen, but use arka_office as safe default)
  console.warn('⚠️  No collection path match for user:', user.username, user.accountType);
  return {
    users: 'arka_office/users/users',
    projects: 'arka_office/projects',
    employees: 'arka_office/employees',
    clients: 'arka_office/clients',
    expenses: 'arka_office/expenses',
    timesheets: 'arka_office/timesheets',
    tasks: 'arka_office/tasks',
    salaries: 'arka_office/salaries',
    attendance: 'arka_office/attendance',
    procurementItems: 'arka_office/procurementItems',
    projectAssignments: 'arka_office/projectAssignments',
    divisions: 'arka_office/divisions',
    items: 'arka_office/items',
  };
}

/**
 * Get user by ID from any collection
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // 1. Check admins
    const adminDoc = await db.collection('admins').doc(userId).get();
    if (adminDoc.exists) {
      return adminDoc.data() as User;
    }

    // 2. Check arka_office/users
    const arkaUserDoc = await db.collection('arka_office/users/users').doc(userId).get();
    if (arkaUserDoc.exists) {
      return arkaUserDoc.data() as User;
    }

    // 3. Check individuals, custom_businesses, organizations
    // These would require searching through subcollections
    // For now, we'll optimize by checking based on ID prefix if we add it

    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user document from correct collection based on email/username
 */
export async function getUserFromAnyCollection(usernameOrEmail: string): Promise<User | null> {
  try {
    // 1. Check admins collection
    const adminsSnapshot = await db.collection('admins').get();
    for (const doc of adminsSnapshot.docs) {
      const user = doc.data() as User;
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        return user;
      }
    }

    // 2. Check arka_office/users
    const arkaUsersSnapshot = await db.collection('arka_office/users/users').get();
    for (const doc of arkaUsersSnapshot.docs) {
      const user = doc.data() as User;
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        return user;
      }
    }

    // 3. Check individuals
    const individualsSnapshot = await db.collection('individuals').get();
    for (const individualDoc of individualsSnapshot.docs) {
      const profileSnapshot = await db.collection(`individuals/${individualDoc.id}/profile`).get();
      for (const doc of profileSnapshot.docs) {
        const user = doc.data() as User;
        if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
          return user;
        }
      }
    }

    // 4. Check custom_businesses
    const customSnapshot = await db.collection('custom_businesses').get();
    for (const customDoc of customSnapshot.docs) {
      const usersSnapshot = await db.collection(`custom_businesses/${customDoc.id}/users`).get();
      for (const doc of usersSnapshot.docs) {
        const user = doc.data() as User;
        if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
          return user;
        }
      }
    }

    // 5. Check organizations
    const orgsSnapshot = await db.collection('organizations').get();
    for (const orgDoc of orgsSnapshot.docs) {
      const usersSnapshot = await db.collection(`organizations/${orgDoc.id}/users`).get();
      for (const doc of usersSnapshot.docs) {
        const user = doc.data() as User;
        if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
          return user;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error searching for user:', error);
    return null;
  }
}
