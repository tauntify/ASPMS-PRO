/**
 * Context-aware storage wrapper
 * Routes storage operations to correct collections based on user context
 */

import { db } from "./firebase";
import { getCollectionPaths } from "./storage-helper";
import {
  User,
  InsertUser,
  Project,
  InsertProject,
  UpdateProject,
  Employee,
  InsertEmployee,
  Client,
  InsertClient,
  Task,
  InsertTask,
  Salary,
  Attendance,
  InsertAttendance,
  Division,
  InsertDivision,
  UpdateDivision,
  Item,
  InsertItem,
  UpdateItem,
  ProcurementItem,
  InsertProcurementItem,
  ProjectAssignment,
  InsertProjectAssignment,
  SalaryAdvance
} from "@shared/schema";
import { Timestamp } from "firebase-admin/firestore";

function toTimestamp(date: Date | undefined): Timestamp | undefined {
  return date ? Timestamp.fromDate(date) : undefined;
}

function fromTimestamp(timestamp: any): Date | undefined {
  return timestamp?.toDate ? timestamp.toDate() : undefined;
}

function generateId(): string {
  return db.collection('_').doc().id;
}

/**
 * Get projects for a specific user's context
 */
export async function getProjectsForUser(user: User): Promise<Project[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.projects).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      startDate: fromTimestamp(data.startDate),
      endDate: fromTimestamp(data.endDate),
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    } as Project;
  });
}

/**
 * Create project in user's context
 */
export async function createProjectForUser(user: User, project: InsertProject): Promise<Project> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const projectData = {
    ...project,
    id,
    startDate: toTimestamp(project.startDate),
    endDate: toTimestamp(project.endDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await db.collection(paths.projects).doc(id).set(projectData);

  return {
    ...projectData,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Project;
}

/**
 * Update project in user's context
 */
export async function updateProjectForUser(user: User, project: UpdateProject): Promise<Project | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.projects).doc(project.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  const updateData = {
    ...project,
    startDate: toTimestamp(project.startDate),
    endDate: toTimestamp(project.endDate),
    updatedAt: Timestamp.now(),
  };

  await docRef.update(updateData);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    startDate: fromTimestamp(data.startDate),
    endDate: fromTimestamp(data.endDate),
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
  } as Project;
}

/**
 * Delete project in user's context
 */
export async function deleteProjectForUser(user: User, projectId: string): Promise<boolean> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.projects).doc(projectId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}

/**
 * Get employees for a specific user's context
 */
export async function getEmployeesForUser(user: User): Promise<Employee[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.employees).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      joiningDate: fromTimestamp(data.joiningDate),
      createdAt: fromTimestamp(data.createdAt),
    } as Employee;
  });
}

/**
 * Get employee by ID in user's context
 */
export async function getEmployeeForUser(user: User, employeeId: string): Promise<Employee | undefined> {
  const paths = getCollectionPaths(user);
  const doc = await db.collection(paths.employees).doc(employeeId).get();

  if (!doc.exists) {
    return undefined;
  }

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    joiningDate: fromTimestamp(data.joiningDate),
    createdAt: fromTimestamp(data.createdAt),
  } as Employee;
}

/**
 * Create employee in user's context
 */
export async function createEmployeeForUser(user: User, employee: InsertEmployee): Promise<Employee> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const employeeData = {
    ...employee,
    id,
    joiningDate: toTimestamp(employee.joiningDate),
    createdAt: Timestamp.now(),
  };

  await db.collection(paths.employees).doc(id).set(employeeData);

  return {
    ...employeeData,
    joiningDate: employee.joiningDate,
    createdAt: new Date(),
  } as Employee;
}

/**
 * Update employee in user's context
 */
export async function updateEmployeeForUser(user: User, employeeId: string, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.employees).doc(employeeId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  const updateData: any = { ...updates };
  if (updates.joiningDate) {
    updateData.joiningDate = toTimestamp(updates.joiningDate);
  }

  await docRef.update(updateData);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    joiningDate: fromTimestamp(data.joiningDate),
    createdAt: fromTimestamp(data.createdAt),
  } as Employee;
}

/**
 * Get clients for a specific user's context
 */
export async function getClientsForUser(user: User): Promise<Client[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.clients).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: fromTimestamp(data.createdAt),
    } as Client;
  });
}

/**
 * Create client in user's context
 */
export async function createClientForUser(user: User, client: InsertClient): Promise<Client> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const clientData = {
    ...client,
    id,
    createdAt: Timestamp.now(),
  };

  await db.collection(paths.clients).doc(id).set(clientData);

  return {
    ...clientData,
    createdAt: new Date(),
  } as Client;
}

/**
 * Get tasks for a specific user's context
 */
export async function getTasksForUser(user: User): Promise<Task[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.tasks).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      dueDate: fromTimestamp(data.dueDate),
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    } as Task;
  });
}

/**
 * Create task in user's context
 */
export async function createTaskForUser(user: User, task: InsertTask): Promise<Task> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const taskData = {
    ...task,
    id,
    dueDate: toTimestamp(task.dueDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await db.collection(paths.tasks).doc(id).set(taskData);

  return {
    ...taskData,
    dueDate: task.dueDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Task;
}

/**
 * Update task in user's context
 */
export async function updateTaskForUser(user: User, taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.tasks).doc(taskId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  const updateData: any = { ...updates, updatedAt: Timestamp.now() };
  if (updates.dueDate) {
    updateData.dueDate = toTimestamp(updates.dueDate);
  }

  await docRef.update(updateData);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    dueDate: fromTimestamp(data.dueDate),
    createdAt: fromTimestamp(data.createdAt),
    updatedAt: fromTimestamp(data.updatedAt),
  } as Task;
}

/**
 * Get salaries for a specific user's context
 */
export async function getSalariesForUser(user: User): Promise<Salary[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.salaries).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: fromTimestamp(data.createdAt),
      updatedAt: fromTimestamp(data.updatedAt),
    } as Salary;
  });
}

/**
 * Get attendance for a specific user's context
 */
export async function getAttendanceForUser(user: User): Promise<Attendance[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.attendance).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      attendanceDate: fromTimestamp(data.attendanceDate),
      createdAt: fromTimestamp(data.createdAt),
    } as Attendance;
  });
}

/**
 * Create attendance in user's context
 */
export async function createAttendanceForUser(user: User, attendance: InsertAttendance): Promise<Attendance> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const attendanceData = {
    ...attendance,
    id,
    attendanceDate: toTimestamp(attendance.attendanceDate),
    createdAt: Timestamp.now(),
  };

  await db.collection(paths.attendance).doc(id).set(attendanceData);

  return {
    ...attendanceData,
    attendanceDate: attendance.attendanceDate,
    createdAt: new Date(),
  } as Attendance;
}

/**
 * Get users for a specific user's context
 */
export async function getUsersForUser(user: User): Promise<User[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.users).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: fromTimestamp(data.createdAt),
    } as User;
  });
}

/**
 * Create user in user's context
 */
export async function createUserForUser(user: User, userData: InsertUser): Promise<User> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const userDataToStore = {
    ...userData,
    id,
    createdAt: Timestamp.now(),
    isActive: 1,
  };

  await db.collection(paths.users).doc(id).set(userDataToStore);

  return {
    ...userDataToStore,
    createdAt: new Date(),
  } as User;
}

/**
 * Update user in user's context
 */
export async function updateUserForUser(user: User, userId: string, updates: Partial<InsertUser>): Promise<User | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.users).doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  await docRef.update(updates);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    createdAt: fromTimestamp(data.createdAt),
  } as User;
}

/**
 * Delete user in user's context
 */
export async function deleteUserForUser(user: User, userId: string): Promise<boolean> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.users).doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}

/**
 * Get divisions for a specific user's context
 */
export async function getDivisionsForUser(user: User): Promise<Division[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.divisions).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: fromTimestamp(data.createdAt),
    } as Division;
  });
}

/**
 * Create division in user's context
 */
export async function createDivisionForUser(user: User, division: InsertDivision): Promise<Division> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const divisionData = {
    ...division,
    id,
    createdAt: Timestamp.now(),
  };

  await db.collection(paths.divisions).doc(id).set(divisionData);

  return {
    ...divisionData,
    createdAt: new Date(),
  } as Division;
}

/**
 * Update division in user's context
 */
export async function updateDivisionForUser(user: User, division: UpdateDivision): Promise<Division | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.divisions).doc(division.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  await docRef.update(division);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    createdAt: fromTimestamp(data.createdAt),
  } as Division;
}

/**
 * Delete division in user's context
 */
export async function deleteDivisionForUser(user: User, divisionId: string): Promise<boolean> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.divisions).doc(divisionId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}

/**
 * Get items for a specific user's context
 */
export async function getItemsForUser(user: User): Promise<Item[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.items).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: fromTimestamp(data.createdAt),
    } as Item;
  });
}

/**
 * Create item in user's context
 */
export async function createItemForUser(user: User, item: InsertItem): Promise<Item> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const itemData = {
    ...item,
    id,
    createdAt: Timestamp.now(),
  };

  await db.collection(paths.items).doc(id).set(itemData);

  return {
    ...itemData,
    createdAt: new Date(),
  } as Item;
}

/**
 * Update item in user's context
 */
export async function updateItemForUser(user: User, item: UpdateItem): Promise<Item | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.items).doc(item.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  await docRef.update(item);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    createdAt: fromTimestamp(data.createdAt),
  } as Item;
}

/**
 * Delete item in user's context
 */
export async function deleteItemForUser(user: User, itemId: string): Promise<boolean> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.items).doc(itemId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}

/**
 * Get procurement items for a specific user's context
 */
export async function getProcurementItemsForUser(user: User): Promise<ProcurementItem[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.procurementItems).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      purchasedDate: fromTimestamp(data.purchasedDate),
      createdAt: fromTimestamp(data.createdAt),
    } as ProcurementItem;
  });
}

/**
 * Create procurement item in user's context
 */
export async function createProcurementItemForUser(user: User, item: InsertProcurementItem): Promise<ProcurementItem> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const itemData = {
    ...item,
    id,
    purchasedDate: toTimestamp(item.purchasedDate),
    createdAt: Timestamp.now(),
  };

  await db.collection(paths.procurementItems).doc(id).set(itemData);

  return {
    ...itemData,
    purchasedDate: item.purchasedDate,
    createdAt: new Date(),
  } as ProcurementItem;
}

/**
 * Update procurement item in user's context
 */
export async function updateProcurementItemForUser(user: User, itemId: string, updates: Partial<InsertProcurementItem>): Promise<ProcurementItem | undefined> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.procurementItems).doc(itemId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return undefined;
  }

  const updateData: any = { ...updates };
  if (updates.purchasedDate) {
    updateData.purchasedDate = toTimestamp(updates.purchasedDate);
  }

  await docRef.update(updateData);

  const updated = await docRef.get();
  const data = updated.data()!;

  return {
    ...data,
    purchasedDate: fromTimestamp(data.purchasedDate),
    createdAt: fromTimestamp(data.createdAt),
  } as ProcurementItem;
}

/**
 * Delete procurement item in user's context
 */
export async function deleteProcurementItemForUser(user: User, itemId: string): Promise<boolean> {
  const paths = getCollectionPaths(user);
  const docRef = db.collection(paths.procurementItems).doc(itemId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false;
  }

  await docRef.delete();
  return true;
}

/**
 * Get project assignments for a specific user's context
 */
export async function getProjectAssignmentsForUser(user: User): Promise<ProjectAssignment[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.projectAssignments).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      assignedAt: fromTimestamp(data.assignedAt),
    } as ProjectAssignment;
  });
}

/**
 * Create project assignment in user's context
 */
export async function createProjectAssignmentForUser(user: User, assignment: InsertProjectAssignment): Promise<ProjectAssignment> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const assignmentData = {
    ...assignment,
    id,
    assignedAt: Timestamp.now(),
  };

  await db.collection(paths.projectAssignments).doc(id).set(assignmentData);

  return {
    ...assignmentData,
    assignedAt: new Date(),
  } as ProjectAssignment;
}

/**
 * Get salary advances for a specific user's context
 */
export async function getSalaryAdvancesForUser(user: User): Promise<SalaryAdvance[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(paths.salaryAdvances).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      advanceDate: fromTimestamp(data.advanceDate),
      createdAt: fromTimestamp(data.createdAt),
    } as SalaryAdvance;
  });
}

// Export all context-aware functions
export const contextStorage = {
  getProjectsForUser,
  createProjectForUser,
  updateProjectForUser,
  deleteProjectForUser,
  getEmployeesForUser,
  getEmployeeForUser,
  createEmployeeForUser,
  updateEmployeeForUser,
  getClientsForUser,
  createClientForUser,
  getTasksForUser,
  createTaskForUser,
  updateTaskForUser,
  getSalariesForUser,
  getAttendanceForUser,
  createAttendanceForUser,
  getUsersForUser,
  createUserForUser,
  updateUserForUser,
  deleteUserForUser,
  getDivisionsForUser,
  createDivisionForUser,
  updateDivisionForUser,
  deleteDivisionForUser,
  getItemsForUser,
  createItemForUser,
  updateItemForUser,
  deleteItemForUser,
  getProcurementItemsForUser,
  createProcurementItemForUser,
  updateProcurementItemForUser,
  deleteProcurementItemForUser,
  getProjectAssignmentsForUser,
  createProjectAssignmentForUser,
  getSalaryAdvancesForUser,
};
