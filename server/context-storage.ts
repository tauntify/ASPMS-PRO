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
  SalaryAdvance,
  Meeting,
  InsertMeeting,
  Milestone,
  InsertMilestone,
  ClientApproval,
  InsertClientApproval,
  ClientNotification,
  InsertClientNotification,
  ClientActivityLog,
  InsertClientActivityLog,
  AuditLog,
  InsertAuditLog
} from "@shared/schema";
import { Timestamp } from "firebase-admin/firestore";

function toTimestamp(date: Date | undefined): Timestamp | undefined {
  return date ? Timestamp.fromDate(date) : undefined;
}

function fromTimestamp(timestamp: any): Date | undefined {
  return timestamp?.toDate ? timestamp.toDate() : undefined;
}

/**
 * Serialize a Date to ISO string or null
 * This ensures dates are never undefined in JSON responses
 */
function serializeDate(date: Date | undefined): string | null {
  if (!date) return null;
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Invalid date serialization:', date, error);
    return null;
  }
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
      startDate: serializeDate(fromTimestamp(data.startDate)),
      endDate: serializeDate(fromTimestamp(data.endDate)),
      deliveryDate: serializeDate(fromTimestamp(data.deliveryDate)),
      createdAt: serializeDate(fromTimestamp(data.createdAt)),
      updatedAt: serializeDate(fromTimestamp(data.updatedAt)),
    } as any;
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
    deliveryDate: toTimestamp(project.deliveryDate),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await db.collection(paths.projects).doc(id).set(projectData);

  return {
    ...projectData,
    startDate: project.startDate,
    deliveryDate: project.deliveryDate,
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
    deliveryDate: toTimestamp(project.deliveryDate),
    updatedAt: Timestamp.now(),
  };

  await docRef.update(updateData);

  const updated = await docRef.get();
  const data = updated.data()!;

  // @ts-ignore - Type assertion for Firebase document data
  return {
    ...data,
    id: updated.id,
    startDate: fromTimestamp(data.startDate),
    deliveryDate: fromTimestamp(data.deliveryDate),
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
      joiningDate: serializeDate(fromTimestamp(data.joiningDate)),
      createdAt: serializeDate(fromTimestamp(data.createdAt)),
    } as any;
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
 * Update client in user's context
 */
export async function updateClientForUser(user: User, clientId: string, updates: Partial<InsertClient>): Promise<Client> {
  const paths = getCollectionPaths(user);
  const clientRef = db.collection(paths.clients).doc(clientId);

  await clientRef.update(updates);

  const updated = await clientRef.get();
  const data = updated.data();

  return {
    ...data,
    id: updated.id,
    createdAt: fromTimestamp(data?.createdAt),
  } as Client;
}

/**
 * Delete client from user's context
 */
export async function deleteClientForUser(user: User, clientId: string): Promise<void> {
  const paths = getCollectionPaths(user);
  await db.collection(paths.clients).doc(clientId).delete();
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
      dueDate: serializeDate(fromTimestamp(data.dueDate)),
      createdAt: serializeDate(fromTimestamp(data.createdAt)),
      updatedAt: serializeDate(fromTimestamp(data.updatedAt)),
    } as any;
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
      createdAt: serializeDate(fromTimestamp(data.createdAt)),
    } as any;
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
    // @ts-ignore - Type assertion for Firebase document data
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

  // @ts-ignore - Type assertion for Firebase document data
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
  // @ts-ignore - salaryAdvances collection path
  const snapshot = await db.collection(paths.salaryAdvances).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    // @ts-ignore - Type assertion for Firebase document data
    return {
      ...data,
      id: doc.id,
      advanceDate: fromTimestamp(data.advanceDate),
      createdAt: fromTimestamp(data.createdAt),
    } as SalaryAdvance;
  });
}

/**
 * MEETINGS - Context-aware storage functions
 */
export async function getMeetingsForUser(user: User, projectId?: string): Promise<Meeting[]> {
  const paths = getCollectionPaths(user);

  if (projectId) {
    // Get meetings for specific project (subcollection)
    const snapshot = await db
      .collection(paths.projects)
      .doc(projectId)
      .collection('meetings')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dateTime: fromTimestamp(data.dateTime),
        createdAt: fromTimestamp(data.createdAt),
        updatedAt: fromTimestamp(data.updatedAt),
        decisions: data.decisions?.map((d: any) => ({
          ...d,
          dueDate: fromTimestamp(d.dueDate),
          createdAt: fromTimestamp(d.createdAt),
        })) || [],
        lockedApprovingBody: data.lockedApprovingBody ? {
          ...data.lockedApprovingBody,
          lockedAt: fromTimestamp(data.lockedApprovingBody.lockedAt),
        } : undefined,
      } as any;
    });
  }

  // Get all meetings across projects
  const projectsSnapshot = await db.collection(paths.projects).get();
  const allMeetings: Meeting[] = [];

  for (const projectDoc of projectsSnapshot.docs) {
    const meetingsSnapshot = await projectDoc.ref.collection('meetings').get();
    const meetings = meetingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        projectId: projectDoc.id,
        dateTime: fromTimestamp(data.dateTime),
        createdAt: fromTimestamp(data.createdAt),
        updatedAt: fromTimestamp(data.updatedAt),
        decisions: data.decisions?.map((d: any) => ({
          ...d,
          dueDate: fromTimestamp(d.dueDate),
          createdAt: fromTimestamp(d.createdAt),
        })) || [],
      } as any;
    });
    allMeetings.push(...meetings);
  }

  return allMeetings;
}

export async function createMeetingForUser(user: User, meeting: InsertMeeting): Promise<Meeting> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const meetingData = {
    ...meeting,
    id,
    dateTime: toTimestamp(meeting.dateTime),
    decisions: meeting.decisions?.map(d => ({
      ...d,
      dueDate: toTimestamp(d.dueDate),
      createdAt: toTimestamp(d.createdAt),
    })) || [],
    isLocked: meeting.isLocked || false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await db
    .collection(paths.projects)
    .doc(meeting.projectId)
    .collection('meetings')
    .doc(id)
    .set(meetingData);

  // If approvingBody is locked, update project's lockedApprovingBody
  if (meeting.approvingBodyLocked && meeting.approvingBody) {
    await db.collection(paths.projects).doc(meeting.projectId).update({
      lockedApprovingBody: {
        name: meeting.approvingBody,
        lockedAt: Timestamp.now(),
        lockedBy: user.id,
      },
    });

    // Create audit log
    await createAuditLogForUser(user, {
      userId: user.id,
      userName: user.fullName,
      action: 'LOCK_APPROVING_BODY',
      entityType: 'meeting',
      entityId: id,
      changes: { approvingBody: meeting.approvingBody },
    });
  }

  return {
    ...meetingData,
    id,
    dateTime: meeting.dateTime,
    createdAt: new Date(),
    updatedAt: new Date(),
    decisions: meeting.decisions || [],
  } as any;
}

export async function updateMeetingForUser(
  user: User,
  projectId: string,
  meetingId: string,
  updates: Partial<InsertMeeting>
): Promise<Meeting | null> {
  const paths = getCollectionPaths(user);
  const meetingRef = db
    .collection(paths.projects)
    .doc(projectId)
    .collection('meetings')
    .doc(meetingId);

  const meetingDoc = await meetingRef.get();
  if (!meetingDoc.exists) return null;

  const existingData = meetingDoc.data();

  // Prevent updates if meeting is locked
  if (existingData?.isLocked && updates.isLocked !== false) {
    throw new Error('Cannot update locked meeting');
  }

  const updateData = {
    ...updates,
    dateTime: updates.dateTime ? toTimestamp(updates.dateTime) : undefined,
    decisions: updates.decisions?.map(d => ({
      ...d,
      dueDate: toTimestamp(d.dueDate),
      createdAt: toTimestamp(d.createdAt),
    })),
    updatedAt: Timestamp.now(),
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key =>
    updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
  );

  await meetingRef.update(updateData);

  const updated = await meetingRef.get();
  const data = updated.data();

  return {
    ...data,
    id: updated.id,
    projectId,
    dateTime: fromTimestamp(data?.dateTime),
    createdAt: fromTimestamp(data?.createdAt),
    updatedAt: fromTimestamp(data?.updatedAt),
    decisions: data?.decisions?.map((d: any) => ({
      ...d,
      dueDate: fromTimestamp(d.dueDate),
      createdAt: fromTimestamp(d.createdAt),
    })) || [],
  } as any;
}

/**
 * MILESTONES - Context-aware storage functions
 */
export async function getMilestonesForUser(user: User, projectId?: string): Promise<Milestone[]> {
  const paths = getCollectionPaths(user);

  if (projectId) {
    const snapshot = await db
      .collection(paths.projects)
      .doc(projectId)
      .collection('milestones')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        dueDate: fromTimestamp(data.dueDate),
        completedAt: fromTimestamp(data.completedAt),
        createdAt: fromTimestamp(data.createdAt),
        updatedAt: fromTimestamp(data.updatedAt),
      } as any;
    });
  }

  // Get all milestones across projects
  const projectsSnapshot = await db.collection(paths.projects).get();
  const allMilestones: Milestone[] = [];

  for (const projectDoc of projectsSnapshot.docs) {
    const milestonesSnapshot = await projectDoc.ref.collection('milestones').get();
    const milestones = milestonesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        projectId: projectDoc.id,
        dueDate: fromTimestamp(data.dueDate),
        completedAt: fromTimestamp(data.completedAt),
        createdAt: fromTimestamp(data.createdAt),
        updatedAt: fromTimestamp(data.updatedAt),
      } as any;
    });
    allMilestones.push(...milestones);
  }

  return allMilestones;
}

export async function createMilestoneForUser(user: User, milestone: InsertMilestone): Promise<Milestone> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const milestoneData = {
    ...milestone,
    id,
    dueDate: toTimestamp(milestone.dueDate),
    completedAt: toTimestamp(milestone.completedAt),
    status: milestone.status || 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await db
    .collection(paths.projects)
    .doc(milestone.projectId)
    .collection('milestones')
    .doc(id)
    .set(milestoneData);

  return {
    ...milestoneData,
    id,
    dueDate: milestone.dueDate,
    completedAt: milestone.completedAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
}

export async function updateMilestoneForUser(
  user: User,
  projectId: string,
  milestoneId: string,
  updates: Partial<InsertMilestone & { status: string }>
): Promise<Milestone | null> {
  const paths = getCollectionPaths(user);
  const milestoneRef = db
    .collection(paths.projects)
    .doc(projectId)
    .collection('milestones')
    .doc(milestoneId);

  const milestoneDoc = await milestoneRef.get();
  if (!milestoneDoc.exists) return null;

  const updateData = {
    ...updates,
    dueDate: updates.dueDate ? toTimestamp(updates.dueDate) : undefined,
    completedAt: updates.completedAt ? toTimestamp(updates.completedAt) : undefined,
    updatedAt: Timestamp.now(),
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(key =>
    updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
  );

  await milestoneRef.update(updateData);

  const updated = await milestoneRef.get();
  const data = updated.data();

  return {
    ...data,
    id: updated.id,
    projectId,
    dueDate: fromTimestamp(data?.dueDate),
    completedAt: fromTimestamp(data?.completedAt),
    createdAt: fromTimestamp(data?.createdAt),
    updatedAt: fromTimestamp(data?.updatedAt),
  } as any;
}

/**
 * APPROVALS - Context-aware storage functions
 */
export async function getApprovalsForUser(user: User, projectId?: string): Promise<ClientApproval[]> {
  const paths = getCollectionPaths(user);

  if (projectId) {
    const snapshot = await db
      .collection(paths.projects)
      .doc(projectId)
      .collection('approvals')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        requestedAt: fromTimestamp(data.requestedAt),
        respondedAt: fromTimestamp(data.respondedAt),
        clientResponse: data.clientResponse ? {
          ...data.clientResponse,
          timestamp: fromTimestamp(data.clientResponse.timestamp),
        } : undefined,
        history: data.history?.map((h: any) => ({
          ...h,
          timestamp: fromTimestamp(h.timestamp),
        })) || [],
        createdAt: fromTimestamp(data.createdAt),
      } as any;
    });
  }

  // Get all approvals across projects
  const projectsSnapshot = await db.collection(paths.projects).get();
  const allApprovals: ClientApproval[] = [];

  for (const projectDoc of projectsSnapshot.docs) {
    const approvalsSnapshot = await projectDoc.ref.collection('approvals').get();
    const approvals = approvalsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        projectId: projectDoc.id,
        requestedAt: fromTimestamp(data.requestedAt),
        respondedAt: fromTimestamp(data.respondedAt),
        clientResponse: data.clientResponse ? {
          ...data.clientResponse,
          timestamp: fromTimestamp(data.clientResponse.timestamp),
        } : undefined,
        history: data.history?.map((h: any) => ({
          ...h,
          timestamp: fromTimestamp(h.timestamp),
        })) || [],
        createdAt: fromTimestamp(data.createdAt),
      } as any;
    });
    allApprovals.push(...approvals);
  }

  return allApprovals;
}

export async function createApprovalForUser(user: User, approval: InsertClientApproval): Promise<ClientApproval> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const approvalData = {
    ...approval,
    id,
    status: approval.status || 'pending',
    requestedAt: toTimestamp(approval.requestedAt),
    respondedAt: toTimestamp(approval.respondedAt),
    history: [],
    createdAt: Timestamp.now(),
  };

  await db
    .collection(paths.projects)
    .doc(approval.projectId)
    .collection('approvals')
    .doc(id)
    .set(approvalData);

  // Create notification for client
  await createClientNotificationForUser(user, {
    clientId: approval.clientId,
    projectId: approval.projectId,
    title: 'New Approval Request',
    message: `You have a new approval request for: ${approval.itemName}`,
    type: 'approval_request',
    relatedApprovalId: id,
    createdBy: user.id,
  });

  return {
    ...approvalData,
    id,
    requestedAt: approval.requestedAt,
    respondedAt: approval.respondedAt,
    history: [],
    createdAt: new Date(),
  } as any;
}

export async function updateApprovalForUser(
  user: User,
  projectId: string,
  approvalId: string,
  updates: {
    status?: string;
    objectionComment?: string;
    clientResponse?: {
      comment?: string;
      timestamp: Date;
      responseType: "approved" | "objected" | "comment";
    };
  }
): Promise<ClientApproval | null> {
  const paths = getCollectionPaths(user);
  const approvalRef = db
    .collection(paths.projects)
    .doc(projectId)
    .collection('approvals')
    .doc(approvalId);

  const approvalDoc = await approvalRef.get();
  if (!approvalDoc.exists) return null;

  const existingData = approvalDoc.data();

  // Add to history
  const historyEntry = {
    timestamp: Timestamp.now(),
    action: updates.status ? `Status changed to ${updates.status}` : 'Updated',
    userId: user.id,
    userName: user.fullName,
    previousStatus: existingData?.status,
    newStatus: updates.status || existingData?.status,
    comment: updates.objectionComment || updates.clientResponse?.comment,
  };

  const updateData = {
    ...updates,
    clientResponse: updates.clientResponse ? {
      ...updates.clientResponse,
      timestamp: toTimestamp(updates.clientResponse.timestamp),
    } : undefined,
    respondedAt: updates.status ? Timestamp.now() : existingData?.respondedAt,
    history: [...(existingData?.history || []), historyEntry],
  };

  await approvalRef.update(updateData);

  // Create activity log
  await createClientActivityLogForUser(user, {
    clientId: existingData?.clientId,
    activityType: 'approval',
    description: `${updates.status === 'approved' ? 'Approved' : 'Objected to'} ${existingData?.itemName}`,
    projectId,
    relatedId: approvalId,
  });

  const updated = await approvalRef.get();
  const data = updated.data();

  return {
    ...data,
    id: updated.id,
    projectId,
    requestedAt: fromTimestamp(data?.requestedAt),
    respondedAt: fromTimestamp(data?.respondedAt),
    clientResponse: data?.clientResponse ? {
      ...data.clientResponse,
      timestamp: fromTimestamp(data.clientResponse.timestamp),
    } : undefined,
    history: data?.history?.map((h: any) => ({
      ...h,
      timestamp: fromTimestamp(h.timestamp),
    })) || [],
    createdAt: fromTimestamp(data?.createdAt),
  } as any;
}

/**
 * CLIENT NOTIFICATIONS - Context-aware storage functions
 */
export async function getClientNotificationsForUser(user: User, clientId?: string): Promise<ClientNotification[]> {
  const paths = getCollectionPaths(user);
  const snapshot = await db.collection(`${paths.clients}`).get();

  const allNotifications: ClientNotification[] = [];

  for (const clientDoc of snapshot.docs) {
    if (clientId && clientDoc.id !== clientId) continue;

    const notificationsSnapshot = await clientDoc.ref.collection('notifications').get();
    const notifications = notificationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        clientId: clientDoc.id,
        createdAt: fromTimestamp(data.createdAt),
      } as any;
    });
    allNotifications.push(...notifications);
  }

  return allNotifications;
}

export async function createClientNotificationForUser(
  user: User,
  notification: InsertClientNotification
): Promise<ClientNotification> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const notificationData = {
    ...notification,
    id,
    isRead: notification.isRead || false,
    createdAt: Timestamp.now(),
  };

  await db
    .collection(paths.clients)
    .doc(notification.clientId)
    .collection('notifications')
    .doc(id)
    .set(notificationData);

  return {
    ...notificationData,
    id,
    createdAt: new Date(),
  } as any;
}

/**
 * CLIENT ACTIVITY LOGS - Context-aware storage functions
 */
export async function createClientActivityLogForUser(
  user: User,
  log: InsertClientActivityLog
): Promise<ClientActivityLog> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const logData = {
    ...log,
    id,
    createdAt: Timestamp.now(),
  };

  await db
    .collection(paths.clients)
    .doc(log.clientId)
    .collection('activityLogs')
    .doc(id)
    .set(logData);

  return {
    ...logData,
    id,
    createdAt: new Date(),
  } as any;
}

/**
 * AUDIT LOGS - Context-aware storage functions
 */
export async function createAuditLogForUser(user: User, log: InsertAuditLog): Promise<AuditLog> {
  const paths = getCollectionPaths(user);
  const id = generateId();

  const logData = {
    ...log,
    id,
    organizationId: user.organizationId,
    timestamp: Timestamp.now(),
  };

  await db.collection(`${paths.clients.replace('/clients', '')}/auditLogs`).doc(id).set(logData);

  return {
    ...logData,
    id,
    timestamp: new Date(),
  } as any;
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
  // Architecture Lifecycle functions
  getMeetingsForUser,
  createMeetingForUser,
  updateMeetingForUser,
  getMilestonesForUser,
  createMilestoneForUser,
  updateMilestoneForUser,
  getApprovalsForUser,
  createApprovalForUser,
  updateApprovalForUser,
  getClientNotificationsForUser,
  createClientNotificationForUser,
  createClientActivityLogForUser,
  createAuditLogForUser,
};
