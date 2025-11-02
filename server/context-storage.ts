/**
 * Context-aware storage wrapper
 * Routes storage operations to correct collections based on user context
 */

import { db } from "./firebase";
import { getCollectionPaths } from "./storage-helper";
import { User, Project, InsertProject, UpdateProject, Employee, InsertEmployee, Client, InsertClient, Task, InsertTask, Salary, Attendance, InsertAttendance } from "@shared/schema";
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
  // We'll add more as needed
};
