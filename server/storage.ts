import {
  Project, InsertProject, UpdateProject,
  Division, InsertDivision, UpdateDivision,
  Item, InsertItem, UpdateItem,
  ProjectSummary, Priority, ItemStatus,
  User, InsertUser,
  Employee, InsertEmployee,
  Client, InsertClient,
  Task, InsertTask,
  ProcurementItem, InsertProcurementItem,
  Salary, InsertSalary,
  SalaryAdvance, InsertSalaryAdvance,
  SalaryPayment, InsertSalaryPayment,
  Attendance, InsertAttendance,
  EmployeeDocument,
  ProjectAssignment, InsertProjectAssignment,
  Comment, InsertComment,
  ProjectFinancials, InsertProjectFinancials,
} from "@shared/schema";
import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";

const STATUS_WEIGHTS: Record<ItemStatus, number> = {
  "Not Started": 0, "Purchased": 25, "In Installation Phase": 50, "Installed": 75, "Delivered": 100,
};

function toTimestamp(date: Date | undefined): Timestamp | undefined {
  return date ? Timestamp.fromDate(date) : undefined;
}

function fromTimestamp(timestamp: any): Date | undefined {
  return timestamp?.toDate ? timestamp.toDate() : undefined;
}

function generateId(): string {
  return db.collection('_').doc().id;
}

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(project: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  getDivisions(projectId?: string): Promise<Division[]>;
  getDivision(id: string): Promise<Division | undefined>;
  createDivision(division: InsertDivision): Promise<Division>;
  updateDivision(division: UpdateDivision): Promise<Division | undefined>;
  deleteDivision(id: string): Promise<boolean>;
  getItems(projectId?: string): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByDivision(divisionId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  getProjectSummary(projectId?: string): Promise<ProjectSummary>;
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;
  getTasks(projectId?: string, employeeId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getProcurementItems(projectId: string): Promise<ProcurementItem[]>;
  createProcurementItem(item: InsertProcurementItem): Promise<ProcurementItem>;
  updateProcurementItem(id: string, updates: Partial<ProcurementItem>): Promise<ProcurementItem | undefined>;
  deleteProcurementItem(id: string): Promise<boolean>;
  getSalaries(employeeId?: string): Promise<Salary[]>;
  getSalary(id: string): Promise<Salary | undefined>;
  getSalaryByMonth(employeeId: string, month: string): Promise<Salary | undefined>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: string, updates: Partial<Salary>): Promise<Salary | undefined>;
  deleteSalary(id: string): Promise<boolean>;
  getSalaryAdvances(employeeId?: string, month?: string): Promise<SalaryAdvance[]>;
  createSalaryAdvance(advance: InsertSalaryAdvance): Promise<SalaryAdvance>;
  deleteSalaryAdvance(id: string): Promise<boolean>;
  getSalaryPayments(salaryId: string): Promise<SalaryPayment[]>;
  createSalaryPayment(payment: InsertSalaryPayment): Promise<SalaryPayment>;
  getAttendance(employeeId: string, month?: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;
  getEmployeeDocuments(employeeId?: string): Promise<EmployeeDocument[]>;
  getProjectAssignments(userId?: string, projectId?: string): Promise<ProjectAssignment[]>;
  createProjectAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  deleteProjectAssignment(id: string): Promise<boolean>;
  getComments(projectId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  getProjectFinancials(projectId: string): Promise<ProjectFinancials | undefined>;
  createProjectFinancials(financials: InsertProjectFinancials): Promise<ProjectFinancials>;
  updateProjectFinancials(projectId: string, updates: Partial<ProjectFinancials>): Promise<ProjectFinancials | undefined>;
  deleteProjectFinancials(projectId: string): Promise<boolean>;
}

export class FirestoreStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    const snapshot = await db.collection('projects').orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, startDate: fromTimestamp(doc.data().startDate), deliveryDate: fromTimestamp(doc.data().deliveryDate) } as Project));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)!, startDate: fromTimestamp(doc.data()!.startDate), deliveryDate: fromTimestamp(doc.data()!.deliveryDate) } as Project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = generateId();
    const projectData: any = {
      name: insertProject.name,
      clientName: insertProject.clientName,
      projectTitle: insertProject.projectTitle,
      createdAt: Timestamp.now()
    };
    if (insertProject.startDate) projectData.startDate = toTimestamp(insertProject.startDate);
    if (insertProject.deliveryDate) projectData.deliveryDate = toTimestamp(insertProject.deliveryDate);
    await db.collection('projects').doc(id).set(projectData);
    return { id, ...projectData, createdAt: new Date(), startDate: insertProject.startDate, deliveryDate: insertProject.deliveryDate } as Project;
  }

  async updateProject(updateProject: UpdateProject): Promise<Project | undefined> {
    const { id, ...updates } = updateProject;
    const updateData: any = { ...updates };
    if (updates.startDate) updateData.startDate = toTimestamp(updates.startDate);
    if (updates.deliveryDate) updateData.deliveryDate = toTimestamp(updates.deliveryDate);
    await db.collection('projects').doc(id).update(updateData);
    return this.getProject(id);
  }

  async deleteProject(id: string): Promise<boolean> {
    const divisions = await this.getDivisions(id);
    for (const division of divisions) await this.deleteDivision(division.id);
    await db.collection('projects').doc(id).delete();
    return true;
  }

  async getDivisions(projectId?: string): Promise<Division[]> {
    let query = db.collection('divisions').orderBy('order', 'asc');
    if (projectId) query = db.collection('divisions').where('projectId', '==', projectId).orderBy('order', 'asc');
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as Division));
  }

  async getDivision(id: string): Promise<Division | undefined> {
    const doc = await db.collection('divisions').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)! } as Division;
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const id = generateId();
    const divisionData = { ...insertDivision, createdAt: Timestamp.now() };
    await db.collection('divisions').doc(id).set(divisionData);
    return { id, ...divisionData, createdAt: new Date() } as Division;
  }

  async updateDivision(updateDivision: UpdateDivision): Promise<Division | undefined> {
    const { id, ...updates } = updateDivision;
    await db.collection('divisions').doc(id).update(updates);
    return this.getDivision(id);
  }

  async deleteDivision(id: string): Promise<boolean> {
    const items = await this.getItemsByDivision(id);
    for (const item of items) await this.deleteItem(item.id);
    await db.collection('divisions').doc(id).delete();
    return true;
  }

  async getItems(projectId?: string): Promise<Item[]> {
    if (projectId) {
      const divisions = await this.getDivisions(projectId);
      const items: Item[] = [];
      for (const div of divisions) items.push(...await this.getItemsByDivision(div.id));
      return items;
    }
    const snapshot = await db.collection('items').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as Item));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const doc = await db.collection('items').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)! } as Item;
  }

  async getItemsByDivision(divisionId: string): Promise<Item[]> {
    const snapshot = await db.collection('items').where('divisionId', '==', divisionId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as Item));
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = generateId();
    const itemData = { ...insertItem, status: insertItem.status || "Not Started", createdAt: Timestamp.now() };
    await db.collection('items').doc(id).set(itemData);
    return { id, ...itemData, createdAt: new Date() } as Item;
  }

  async updateItem(updateItem: UpdateItem): Promise<Item | undefined> {
    const { id, ...updates } = updateItem;
    await db.collection('items').doc(id).update(updates);
    return this.getItem(id);
  }

  async deleteItem(id: string): Promise<boolean> {
    await db.collection('items').doc(id).delete();
    return true;
  }

  async getProjectSummary(projectId?: string): Promise<ProjectSummary> {
    const allDivisions = await this.getDivisions(projectId);
    const allItems = await this.getItems(projectId);
    const totalCost = allItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const priorityCosts = { High: 0, Mid: 0, Low: 0 };
    const priorityCounts = { High: 0, Mid: 0, Low: 0 };
    const statusCosts: Record<ItemStatus, number> = { "Not Started": 0, "Purchased": 0, "In Installation Phase": 0, "Installed": 0, "Delivered": 0 };
    const statusCounts: Record<ItemStatus, number> = { "Not Started": 0, "Purchased": 0, "In Installation Phase": 0, "Installed": 0, "Delivered": 0 };
    let totalProgress = 0;
    allItems.forEach(item => {
      const itemTotal = item.quantity * item.rate;
      priorityCosts[item.priority as Priority] += itemTotal;
      priorityCounts[item.priority as Priority]++;
      const itemStatus = item.status as ItemStatus;
      statusCosts[itemStatus] += itemTotal;
      statusCounts[itemStatus]++;
      totalProgress += STATUS_WEIGHTS[itemStatus];
    });
    const overallProgress = allItems.length > 0 ? totalProgress / allItems.length : 0;
    return {
      totalCost, highPriorityCost: priorityCosts.High, midPriorityCost: priorityCosts.Mid, lowPriorityCost: priorityCosts.Low,
      totalItems: allItems.length, totalDivisions: allDivisions.length, overallProgress,
      divisionBreakdown: allDivisions.map(division => ({ divisionId: division.id, divisionName: division.name, totalCost: allItems.filter(item => item.divisionId === division.id).reduce((sum, item) => sum + item.quantity * item.rate, 0), itemCount: allItems.filter(item => item.divisionId === division.id).length })),
      priorityBreakdown: [{ priority: "High", cost: priorityCosts.High, itemCount: priorityCounts.High }, { priority: "Mid", cost: priorityCosts.Mid, itemCount: priorityCounts.Mid }, { priority: "Low", cost: priorityCosts.Low, itemCount: priorityCounts.Low }],
      statusBreakdown: [{ status: "Not Started", itemCount: statusCounts["Not Started"], cost: statusCosts["Not Started"] }, { status: "Purchased", itemCount: statusCounts["Purchased"], cost: statusCosts["Purchased"] }, { status: "In Installation Phase", itemCount: statusCounts["In Installation Phase"], cost: statusCosts["In Installation Phase"] }, { status: "Installed", itemCount: statusCounts["Installed"], cost: statusCosts["Installed"] }, { status: "Delivered", itemCount: statusCounts["Delivered"], cost: statusCosts["Delivered"] }]
    };
  }

  async getUsers(): Promise<User[]> {
    const snapshot = await db.collection('users').orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as User));
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)! } as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('username', '==', username.toLowerCase()).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as User;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('firebaseUid', '==', firebaseUid).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = generateId();
    const userData = { ...insertUser, username: insertUser.username.toLowerCase(), isActive: true, createdAt: Timestamp.now() };
    await db.collection('users').doc(id).set(userData);
    return { id, ...userData, isActive: true, createdAt: new Date() } as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const updateData: any = { ...updates };
    if (updates.username) updateData.username = updates.username.toLowerCase();
    await db.collection('users').doc(id).update(updateData);
    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.collection('users').doc(id).delete();
    return true;
  }

  async getEmployees(): Promise<Employee[]> {
    const snapshot = await db.collection('employees').orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, joiningDate: fromTimestamp(doc.data().joiningDate) } as Employee));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const doc = await db.collection('employees').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)!, joiningDate: fromTimestamp(doc.data()!.joiningDate) } as Employee;
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const snapshot = await db.collection('employees').where('userId', '==', userId).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, joiningDate: fromTimestamp(doc.data().joiningDate) } as Employee;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = generateId();
    const employeeData = { ...insertEmployee, joiningDate: toTimestamp(insertEmployee.joiningDate), createdAt: Timestamp.now() };
    await db.collection('employees').doc(id).set(employeeData);
    return { id, ...employeeData, createdAt: new Date(), joiningDate: insertEmployee.joiningDate } as Employee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const updateData: any = { ...updates };
    if (updates.joiningDate) updateData.joiningDate = toTimestamp(updates.joiningDate);
    await db.collection('employees').doc(id).update(updateData);
    return this.getEmployee(id);
  }

  async getClients(): Promise<Client[]> {
    const snapshot = await db.collection('clients').orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as Client));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const doc = await db.collection('clients').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)! } as Client;
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const snapshot = await db.collection('clients').where('userId', '==', userId).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as Client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = generateId();
    const clientData = { ...insertClient, createdAt: Timestamp.now() };
    await db.collection('clients').doc(id).set(clientData);
    return { id, ...clientData, createdAt: new Date() } as Client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    await db.collection('clients').doc(id).update(updates);
    return this.getClient(id);
  }

  async getTasks(projectId?: string, employeeId?: string): Promise<Task[]> {
    let query = db.collection('tasks').orderBy('createdAt', 'asc');
    if (projectId && employeeId) query = db.collection('tasks').where('projectId', '==', projectId).where('employeeId', '==', employeeId).orderBy('createdAt', 'asc');
    else if (projectId) query = db.collection('tasks').where('projectId', '==', projectId).orderBy('createdAt', 'asc');
    else if (employeeId) query = db.collection('tasks').where('employeeId', '==', employeeId).orderBy('createdAt', 'asc');
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, updatedAt: fromTimestamp(doc.data().updatedAt)!, dueDate: fromTimestamp(doc.data().dueDate) } as Task));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const doc = await db.collection('tasks').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)!, updatedAt: fromTimestamp(doc.data()!.updatedAt)!, dueDate: fromTimestamp(doc.data()!.dueDate) } as Task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = generateId();
    const taskData = { ...insertTask, status: insertTask.status || "Undone", dueDate: toTimestamp(insertTask.dueDate), createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
    await db.collection('tasks').doc(id).set(taskData);
    return { id, ...taskData, createdAt: new Date(), updatedAt: new Date(), dueDate: insertTask.dueDate } as Task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const updateData: any = { ...updates, updatedAt: Timestamp.now() };
    if (updates.dueDate) updateData.dueDate = toTimestamp(updates.dueDate);
    await db.collection('tasks').doc(id).update(updateData);
    return this.getTask(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    await db.collection('tasks').doc(id).delete();
    return true;
  }

  async getProcurementItems(projectId: string): Promise<ProcurementItem[]> {
    const snapshot = await db.collection('procurementItems').where('projectId', '==', projectId).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, purchasedDate: fromTimestamp(doc.data().purchasedDate) } as ProcurementItem));
  }

  async createProcurementItem(insertItem: InsertProcurementItem): Promise<ProcurementItem> {
    const id = generateId();
    const itemData = { ...insertItem, isPurchased: insertItem.isPurchased || false, purchasedDate: toTimestamp(insertItem.purchasedDate), createdAt: Timestamp.now() };
    await db.collection('procurementItems').doc(id).set(itemData);
    return { id, ...itemData, isPurchased: itemData.isPurchased, createdAt: new Date(), purchasedDate: insertItem.purchasedDate } as ProcurementItem;
  }

  async updateProcurementItem(id: string, updates: Partial<ProcurementItem>): Promise<ProcurementItem | undefined> {
    const updateData: any = { ...updates };
    if (updates.purchasedDate) updateData.purchasedDate = toTimestamp(updates.purchasedDate);
    await db.collection('procurementItems').doc(id).update(updateData);
    const doc = await db.collection('procurementItems').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)!, purchasedDate: fromTimestamp(doc.data()!.purchasedDate) } as ProcurementItem;
  }

  async deleteProcurementItem(id: string): Promise<boolean> {
    await db.collection('procurementItems').doc(id).delete();
    return true;
  }

  async getSalaries(employeeId?: string): Promise<Salary[]> {
    let query: any = db.collection('salaries');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    const snapshot = await query.orderBy('month', 'desc').get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: fromTimestamp(doc.data().createdAt)!,
      updatedAt: fromTimestamp(doc.data().updatedAt)!,
      paidDate: fromTimestamp(doc.data().paidDate)
    } as Salary));
  }

  async getSalary(id: string): Promise<Salary | undefined> {
    const doc = await db.collection('salaries').doc(id).get();
    if (!doc.exists) return undefined;
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: fromTimestamp(doc.data()!.createdAt)!,
      updatedAt: fromTimestamp(doc.data()!.updatedAt)!,
      paidDate: fromTimestamp(doc.data()!.paidDate)
    } as Salary;
  }

  async getSalaryByMonth(employeeId: string, month: string): Promise<Salary | undefined> {
    const snapshot = await db.collection('salaries')
      .where('employeeId', '==', employeeId)
      .where('month', '==', month)
      .limit(1)
      .get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: fromTimestamp(doc.data().createdAt)!,
      updatedAt: fromTimestamp(doc.data().updatedAt)!,
      paidDate: fromTimestamp(doc.data().paidDate)
    } as Salary;
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    const id = generateId();
    const now = Timestamp.now();
    const salaryData = {
      ...insertSalary,
      isPaid: insertSalary.isPaid || false,
      isHeld: insertSalary.isHeld || false,
      paidDate: toTimestamp(insertSalary.paidDate),
      createdAt: now,
      updatedAt: now
    };
    await db.collection('salaries').doc(id).set(salaryData);
    return {
      id,
      ...salaryData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      paidDate: insertSalary.paidDate
    } as Salary;
  }

  async updateSalary(id: string, updates: Partial<Salary>): Promise<Salary | undefined> {
    const updateData: any = { ...updates, updatedAt: Timestamp.now() };
    if (updates.paidDate) updateData.paidDate = toTimestamp(updates.paidDate);
    await db.collection('salaries').doc(id).update(updateData);
    return this.getSalary(id);
  }

  async deleteSalary(id: string): Promise<boolean> {
    await db.collection('salaries').doc(id).delete();
    return true;
  }

  async getSalaryAdvances(employeeId?: string, month?: string): Promise<SalaryAdvance[]> {
    let query: any = db.collection('salaryAdvances');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    const snapshot = await query.orderBy('date', 'desc').get();
    let advances = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      date: fromTimestamp(doc.data().date)!,
      createdAt: fromTimestamp(doc.data().createdAt)!
    } as SalaryAdvance));

    // Filter by month if provided
    if (month) {
      advances = advances.filter((adv: SalaryAdvance) => {
        const advDate = new Date(adv.date);
        const monthKey = `${advDate.getFullYear()}-${String(advDate.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === month;
      });
    }

    return advances;
  }

  async createSalaryAdvance(insertAdvance: InsertSalaryAdvance): Promise<SalaryAdvance> {
    const id = generateId();
    const advanceData = {
      ...insertAdvance,
      date: toTimestamp(insertAdvance.date)!,
      createdAt: Timestamp.now()
    };
    await db.collection('salaryAdvances').doc(id).set(advanceData);
    return {
      id,
      ...advanceData,
      date: insertAdvance.date,
      createdAt: new Date()
    } as SalaryAdvance;
  }

  async deleteSalaryAdvance(id: string): Promise<boolean> {
    await db.collection('salaryAdvances').doc(id).delete();
    return true;
  }

  async getSalaryPayments(salaryId: string): Promise<SalaryPayment[]> {
    const snapshot = await db.collection('salaryPayments')
      .where('salaryId', '==', salaryId)
      .orderBy('paymentDate', 'asc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: fromTimestamp(doc.data().paymentDate)!,
      createdAt: fromTimestamp(doc.data().createdAt)!
    } as SalaryPayment));
  }

  async createSalaryPayment(insertPayment: InsertSalaryPayment): Promise<SalaryPayment> {
    const id = generateId();
    const paymentData = {
      ...insertPayment,
      paymentDate: toTimestamp(insertPayment.paymentDate)!,
      createdAt: Timestamp.now()
    };
    await db.collection('salaryPayments').doc(id).set(paymentData);
    return {
      id,
      ...paymentData,
      paymentDate: insertPayment.paymentDate,
      createdAt: new Date()
    } as SalaryPayment;
  }

  async getAttendance(employeeId: string, month?: string): Promise<Attendance[]> {
    let query = db.collection('attendance').where('employeeId', '==', employeeId).orderBy('attendanceDate', 'asc');
    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query = db.collection('attendance').where('employeeId', '==', employeeId).where('attendanceDate', '>=', Timestamp.fromDate(startDate)).orderBy('attendanceDate', 'asc');
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, attendanceDate: fromTimestamp(doc.data().attendanceDate)! } as Attendance));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = generateId();
    const attendanceData = { ...insertAttendance, isPresent: insertAttendance.isPresent !== undefined ? insertAttendance.isPresent : true, attendanceDate: toTimestamp(insertAttendance.attendanceDate)!, createdAt: Timestamp.now() };
    await db.collection('attendance').doc(id).set(attendanceData);
    return { id, ...attendanceData, isPresent: attendanceData.isPresent, createdAt: new Date(), attendanceDate: insertAttendance.attendanceDate } as Attendance;
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const updateData: any = { ...updates };
    if (updates.attendanceDate) updateData.attendanceDate = toTimestamp(updates.attendanceDate);
    await db.collection('attendance').doc(id).update(updateData);
    const doc = await db.collection('attendance').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)!, attendanceDate: fromTimestamp(doc.data()!.attendanceDate)! } as Attendance;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    await db.collection('attendance').doc(id).delete();
    return true;
  }

  async getEmployeeDocuments(employeeId?: string): Promise<EmployeeDocument[]> {
    let query: any = db.collection('employeeDocuments');
    if (employeeId) {
      query = query.where('employeeId', '==', employeeId);
    }
    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: fromTimestamp(doc.data().createdAt)!,
      updatedAt: fromTimestamp(doc.data().updatedAt)!
    } as EmployeeDocument));

    // Sort by createdAt in memory to avoid composite index requirement
    return documents.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getProjectAssignments(userId?: string, projectId?: string): Promise<ProjectAssignment[]> {
    let query = db.collection('projectAssignments').orderBy('createdAt', 'asc');
    if (userId && projectId) query = db.collection('projectAssignments').where('userId', '==', userId).where('projectId', '==', projectId).orderBy('createdAt', 'asc');
    else if (userId) query = db.collection('projectAssignments').where('userId', '==', userId).orderBy('createdAt', 'asc');
    else if (projectId) query = db.collection('projectAssignments').where('projectId', '==', projectId).orderBy('createdAt', 'asc');
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as ProjectAssignment));
  }

  async createProjectAssignment(insertAssignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const id = generateId();
    const assignmentData = { ...insertAssignment, createdAt: Timestamp.now() };
    await db.collection('projectAssignments').doc(id).set(assignmentData);
    return { id, ...assignmentData, createdAt: new Date() } as ProjectAssignment;
  }

  async deleteProjectAssignment(id: string): Promise<boolean> {
    await db.collection('projectAssignments').doc(id).delete();
    return true;
  }

  async getComments(projectId: string): Promise<Comment[]> {
    const snapshot = await db.collection('comments').where('projectId', '==', projectId).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)! } as Comment));
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const doc = await db.collection('comments').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data()!.createdAt)! } as Comment;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = generateId();
    const commentData = { ...insertComment, createdAt: Timestamp.now() };
    await db.collection('comments').doc(id).set(commentData);
    return { id, ...commentData, createdAt: new Date() } as Comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    await db.collection('comments').doc(id).delete();
    return true;
  }

  async getProjectFinancials(projectId: string): Promise<ProjectFinancials | undefined> {
    const snapshot = await db.collection('projectFinancials').where('projectId', '==', projectId).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), createdAt: fromTimestamp(doc.data().createdAt)!, updatedAt: fromTimestamp(doc.data().updatedAt)!, archivedDate: fromTimestamp(doc.data().archivedDate) } as ProjectFinancials;
  }

  async createProjectFinancials(insertFinancials: InsertProjectFinancials): Promise<ProjectFinancials> {
    const id = generateId();
    const financialsData = { ...insertFinancials, isArchived: insertFinancials.isArchived || false, archivedDate: toTimestamp(insertFinancials.archivedDate), createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
    await db.collection('projectFinancials').doc(id).set(financialsData);
    return { id, ...financialsData, isArchived: financialsData.isArchived, createdAt: new Date(), updatedAt: new Date(), archivedDate: insertFinancials.archivedDate } as ProjectFinancials;
  }

  async updateProjectFinancials(projectId: string, updates: Partial<ProjectFinancials>): Promise<ProjectFinancials | undefined> {
    const existing = await this.getProjectFinancials(projectId);
    if (!existing) return undefined;
    const updateData: any = { ...updates, updatedAt: Timestamp.now() };
    if (updates.archivedDate) updateData.archivedDate = toTimestamp(updates.archivedDate);
    await db.collection('projectFinancials').doc(existing.id).update(updateData);
    return this.getProjectFinancials(projectId);
  }

  async deleteProjectFinancials(projectId: string): Promise<boolean> {
    const existing = await this.getProjectFinancials(projectId);
    if (!existing) return false;
    await db.collection('projectFinancials').doc(existing.id).delete();
    return true;
  }
}

export const storage: IStorage = new FirestoreStorage();
