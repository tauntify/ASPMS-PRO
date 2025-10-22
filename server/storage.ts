import {
  Project,
  InsertProject,
  UpdateProject,
  Division,
  InsertDivision,
  UpdateDivision,
  Item,
  InsertItem,
  UpdateItem,
  ProjectSummary,
  Priority,
  ItemStatus,
  User,
  InsertUser,
  Employee,
  InsertEmployee,
  Client,
  InsertClient,
  Task,
  InsertTask,
  ProcurementItem,
  InsertProcurementItem,
  Salary,
  InsertSalary,
  Attendance,
  InsertAttendance,
  ProjectAssignment,
  InsertProjectAssignment,
  Comment,
  InsertComment,
  ProjectFinancials,
  InsertProjectFinancials,
  projects,
  divisions,
  items,
  users,
  employees,
  clients,
  tasks,
  procurementItems,
  salaries,
  attendance,
  projectAssignments,
  comments,
  projectFinancials,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, inArray, and, gte } from "drizzle-orm";

const STATUS_WEIGHTS: Record<ItemStatus, number> = {
  "Not Started": 0,
  "Purchased": 25,
  "In Installation Phase": 50,
  "Installed": 75,
  "Delivered": 100,
};

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(project: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Divisions
  getDivisions(projectId?: string): Promise<Division[]>;
  getDivision(id: string): Promise<Division | undefined>;
  createDivision(division: InsertDivision): Promise<Division>;
  updateDivision(division: UpdateDivision): Promise<Division | undefined>;
  deleteDivision(id: string): Promise<boolean>;

  // Items
  getItems(projectId?: string): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByDivision(divisionId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;

  // Summary
  getProjectSummary(projectId?: string): Promise<ProjectSummary>;

  // User Management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Employee Management
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;

  // Client Management
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;

  // Task Management
  getTasks(projectId?: string, employeeId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Procurement
  getProcurementItems(projectId: string): Promise<ProcurementItem[]>;
  createProcurementItem(item: InsertProcurementItem): Promise<ProcurementItem>;
  updateProcurementItem(id: string, updates: Partial<ProcurementItem>): Promise<ProcurementItem | undefined>;
  deleteProcurementItem(id: string): Promise<boolean>;

  // Salaries & Attendance
  getSalaries(employeeId: string): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: string, updates: Partial<Salary>): Promise<Salary | undefined>;
  deleteSalary(id: string): Promise<boolean>;
  getAttendance(employeeId: string, month?: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;

  // Project Assignments
  getProjectAssignments(userId?: string, projectId?: string): Promise<ProjectAssignment[]>;
  createProjectAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  deleteProjectAssignment(id: string): Promise<boolean>;

  // Comments & Financials
  getComments(projectId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  getProjectFinancials(projectId: string): Promise<ProjectFinancials | undefined>;
  createProjectFinancials(financials: InsertProjectFinancials): Promise<ProjectFinancials>;
  updateProjectFinancials(projectId: string, updates: Partial<ProjectFinancials>): Promise<ProjectFinancials | undefined>;
  deleteProjectFinancials(projectId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Helper function to convert numeric values to strings for Drizzle numeric columns
  private toNumericString(value: number | undefined): string | undefined {
    if (value === undefined) return undefined;
    return value.toString();
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(asc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async updateProject(updateProject: UpdateProject): Promise<Project | undefined> {
    const { id, ...updates } = updateProject;
    const result = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Divisions
  async getDivisions(projectId?: string): Promise<Division[]> {
    if (projectId) {
      return await db
        .select()
        .from(divisions)
        .where(eq(divisions.projectId, projectId))
        .orderBy(asc(divisions.order));
    }
    return await db.select().from(divisions).orderBy(asc(divisions.order));
  }

  async getDivision(id: string): Promise<Division | undefined> {
    const result = await db.select().from(divisions).where(eq(divisions.id, id));
    return result[0];
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const result = await db.insert(divisions).values(insertDivision).returning();
    return result[0];
  }

  async updateDivision(updateDivision: UpdateDivision): Promise<Division | undefined> {
    const { id, ...updates } = updateDivision;
    const result = await db
      .update(divisions)
      .set(updates)
      .where(eq(divisions.id, id))
      .returning();
    return result[0];
  }

  async deleteDivision(id: string): Promise<boolean> {
    const result = await db.delete(divisions).where(eq(divisions.id, id)).returning();
    return result.length > 0;
  }

  // Items
  async getItems(projectId?: string): Promise<Item[]> {
    if (projectId) {
      const projectDivisions = await this.getDivisions(projectId);
      const divisionIds = projectDivisions.map(d => d.id);
      if (divisionIds.length === 0) return [];
      return await db.select().from(items).where(inArray(items.divisionId, divisionIds));
    }
    return await db.select().from(items);
  }

  async getItem(id: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0];
  }

  async getItemsByDivision(divisionId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.divisionId, divisionId));
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const itemData: any = {
      divisionId: insertItem.divisionId,
      description: insertItem.description,
      unit: insertItem.unit,
      quantity: insertItem.quantity.toString(),
      rate: insertItem.rate.toString(),
      priority: insertItem.priority,
      status: insertItem.status || "Not Started",
    };
    const result = await db.insert(items).values(itemData).returning();
    return result[0];
  }

  async updateItem(updateItem: UpdateItem): Promise<Item | undefined> {
    const { id, ...updates } = updateItem;
    const convertedUpdates: any = { ...updates };
    if (updates.quantity !== undefined) {
      convertedUpdates.quantity = this.toNumericString(updates.quantity);
    }
    if (updates.rate !== undefined) {
      convertedUpdates.rate = this.toNumericString(updates.rate);
    }
    const result = await db
      .update(items)
      .set(convertedUpdates)
      .where(eq(items.id, id))
      .returning();
    return result[0];
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result.length > 0;
  }

  // Summary
  async getProjectSummary(projectId?: string): Promise<ProjectSummary> {
    const allDivisions = await this.getDivisions(projectId);
    const allItems = await this.getItems(projectId);

    const totalCost = allItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
    
    const priorityCosts = {
      High: 0,
      Mid: 0,
      Low: 0,
    };

    const priorityCounts = {
      High: 0,
      Mid: 0,
      Low: 0,
    };

    const statusCosts: Record<ItemStatus, number> = {
      "Not Started": 0,
      "Purchased": 0,
      "In Installation Phase": 0,
      "Installed": 0,
      "Delivered": 0,
    };

    const statusCounts: Record<ItemStatus, number> = {
      "Not Started": 0,
      "Purchased": 0,
      "In Installation Phase": 0,
      "Installed": 0,
      "Delivered": 0,
    };

    let totalProgress = 0;

    allItems.forEach((item) => {
      const itemTotal = Number(item.quantity) * Number(item.rate);
      priorityCosts[item.priority as Priority] += itemTotal;
      priorityCounts[item.priority as Priority]++;

      const itemStatus = item.status as ItemStatus;
      statusCosts[itemStatus] += itemTotal;
      statusCounts[itemStatus]++;
      totalProgress += STATUS_WEIGHTS[itemStatus];
    });

    const overallProgress = allItems.length > 0 ? totalProgress / allItems.length : 0;

    const divisionBreakdown = allDivisions.map((division) => {
      const divisionItems = allItems.filter((item) => item.divisionId === division.id);
      const totalCost = divisionItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.rate),
        0
      );

      return {
        divisionId: division.id,
        divisionName: division.name,
        totalCost,
        itemCount: divisionItems.length,
      };
    });

    const priorityBreakdown: { priority: Priority; cost: number; itemCount: number }[] = [
      { priority: "High", cost: priorityCosts.High, itemCount: priorityCounts.High },
      { priority: "Mid", cost: priorityCosts.Mid, itemCount: priorityCounts.Mid },
      { priority: "Low", cost: priorityCosts.Low, itemCount: priorityCounts.Low },
    ];

    const statusBreakdown: { status: ItemStatus; itemCount: number; cost: number }[] = [
      { status: "Not Started", itemCount: statusCounts["Not Started"], cost: statusCosts["Not Started"] },
      { status: "Purchased", itemCount: statusCounts["Purchased"], cost: statusCosts["Purchased"] },
      { status: "In Installation Phase", itemCount: statusCounts["In Installation Phase"], cost: statusCosts["In Installation Phase"] },
      { status: "Installed", itemCount: statusCounts["Installed"], cost: statusCosts["Installed"] },
      { status: "Delivered", itemCount: statusCounts["Delivered"], cost: statusCosts["Delivered"] },
    ];

    return {
      totalCost,
      highPriorityCost: priorityCosts.High,
      midPriorityCost: priorityCosts.Mid,
      lowPriorityCost: priorityCosts.Low,
      totalItems: allItems.length,
      totalDivisions: allDivisions.length,
      overallProgress,
      divisionBreakdown,
      priorityBreakdown,
      statusBreakdown,
    };
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  // Employee Management
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(asc(employees.createdAt));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id));
    return result[0];
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.userId, userId));
    return result[0];
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(insertEmployee).returning();
    return result[0];
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const result = await db
      .update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return result[0];
  }

  // Client Management
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(asc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.userId, userId));
    return result[0];
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(insertClient).returning();
    return result[0];
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const result = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return result[0];
  }

  // Task Management
  async getTasks(projectId?: string, employeeId?: string): Promise<Task[]> {
    if (projectId && employeeId) {
      return await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.projectId, projectId), eq(tasks.employeeId, employeeId)))
        .orderBy(asc(tasks.createdAt));
    } else if (projectId) {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(asc(tasks.createdAt));
    } else if (employeeId) {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.employeeId, employeeId))
        .orderBy(asc(tasks.createdAt));
    }
    return await db.select().from(tasks).orderBy(asc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Procurement
  async getProcurementItems(projectId: string): Promise<ProcurementItem[]> {
    return await db
      .select()
      .from(procurementItems)
      .where(eq(procurementItems.projectId, projectId))
      .orderBy(asc(procurementItems.createdAt));
  }

  async createProcurementItem(insertItem: InsertProcurementItem): Promise<ProcurementItem> {
    const procurementData: any = {
      projectId: insertItem.projectId,
      itemName: insertItem.itemName,
      projectCost: insertItem.projectCost.toString(),
      executionCost: insertItem.executionCost !== undefined ? insertItem.executionCost.toString() : undefined,
      isPurchased: insertItem.isPurchased,
      billNumber: insertItem.billNumber,
      rentalDetails: insertItem.rentalDetails,
      quantity: insertItem.quantity.toString(),
      unit: insertItem.unit,
      notes: insertItem.notes,
      purchasedBy: insertItem.purchasedBy,
      purchasedDate: insertItem.purchasedDate,
    };
    const result = await db.insert(procurementItems).values(procurementData).returning();
    return result[0];
  }

  async updateProcurementItem(id: string, updates: Partial<ProcurementItem>): Promise<ProcurementItem | undefined> {
    const convertedUpdates: any = { ...updates };
    if (updates.quantity !== undefined) {
      convertedUpdates.quantity = this.toNumericString(Number(updates.quantity));
    }
    if (updates.projectCost !== undefined) {
      convertedUpdates.projectCost = this.toNumericString(Number(updates.projectCost));
    }
    if (updates.executionCost !== undefined) {
      convertedUpdates.executionCost = this.toNumericString(Number(updates.executionCost));
    }
    const result = await db
      .update(procurementItems)
      .set(convertedUpdates)
      .where(eq(procurementItems.id, id))
      .returning();
    return result[0];
  }

  async deleteProcurementItem(id: string): Promise<boolean> {
    const result = await db.delete(procurementItems).where(eq(procurementItems.id, id)).returning();
    return result.length > 0;
  }

  // Salaries & Attendance
  async getSalaries(employeeId: string): Promise<Salary[]> {
    return await db
      .select()
      .from(salaries)
      .where(eq(salaries.employeeId, employeeId))
      .orderBy(asc(salaries.month));
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    const salaryData: any = {
      employeeId: insertSalary.employeeId,
      month: insertSalary.month,
      basicSalary: insertSalary.basicSalary.toString(),
      incentives: insertSalary.incentives !== undefined ? insertSalary.incentives.toString() : "0",
      medical: insertSalary.medical !== undefined ? insertSalary.medical.toString() : "0",
      tax: insertSalary.tax !== undefined ? insertSalary.tax.toString() : "0",
      deductions: insertSalary.deductions !== undefined ? insertSalary.deductions.toString() : "0",
      netSalary: insertSalary.netSalary.toString(),
      isPaid: insertSalary.isPaid,
      paidDate: insertSalary.paidDate,
    };
    const result = await db.insert(salaries).values(salaryData).returning();
    return result[0];
  }

  async updateSalary(id: string, updates: Partial<Salary>): Promise<Salary | undefined> {
    const convertedUpdates: any = { ...updates };
    if (updates.basicSalary !== undefined) {
      convertedUpdates.basicSalary = this.toNumericString(Number(updates.basicSalary));
    }
    if (updates.incentives !== undefined) {
      convertedUpdates.incentives = this.toNumericString(Number(updates.incentives));
    }
    if (updates.medical !== undefined) {
      convertedUpdates.medical = this.toNumericString(Number(updates.medical));
    }
    if (updates.tax !== undefined) {
      convertedUpdates.tax = this.toNumericString(Number(updates.tax));
    }
    if (updates.deductions !== undefined) {
      convertedUpdates.deductions = this.toNumericString(Number(updates.deductions));
    }
    if (updates.netSalary !== undefined) {
      convertedUpdates.netSalary = this.toNumericString(Number(updates.netSalary));
    }
    const result = await db
      .update(salaries)
      .set(convertedUpdates)
      .where(eq(salaries.id, id))
      .returning();
    return result[0];
  }

  async deleteSalary(id: string): Promise<boolean> {
    const result = await db.delete(salaries).where(eq(salaries.id, id)).returning();
    return result.length > 0;
  }

  async getAttendance(employeeId: string, month?: string): Promise<Attendance[]> {
    if (month) {
      // Filter attendance records for a specific month (YYYY-MM format)
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      return await db
        .select()
        .from(attendance)
        .where(
          and(
            eq(attendance.employeeId, employeeId),
            gte(attendance.attendanceDate, startDate)
          )
        )
        .orderBy(asc(attendance.attendanceDate));
    }
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.employeeId, employeeId))
      .orderBy(asc(attendance.attendanceDate));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values(insertAttendance).returning();
    return result[0];
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const result = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return result[0];
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await db.delete(attendance).where(eq(attendance.id, id)).returning();
    return result.length > 0;
  }

  // Project Assignments
  async getProjectAssignments(userId?: string, projectId?: string): Promise<ProjectAssignment[]> {
    if (userId && projectId) {
      return await db
        .select()
        .from(projectAssignments)
        .where(and(eq(projectAssignments.userId, userId), eq(projectAssignments.projectId, projectId)))
        .orderBy(asc(projectAssignments.createdAt));
    } else if (userId) {
      return await db
        .select()
        .from(projectAssignments)
        .where(eq(projectAssignments.userId, userId))
        .orderBy(asc(projectAssignments.createdAt));
    } else if (projectId) {
      return await db
        .select()
        .from(projectAssignments)
        .where(eq(projectAssignments.projectId, projectId))
        .orderBy(asc(projectAssignments.createdAt));
    }
    return await db.select().from(projectAssignments).orderBy(asc(projectAssignments.createdAt));
  }

  async createProjectAssignment(insertAssignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const result = await db.insert(projectAssignments).values(insertAssignment).returning();
    return result[0];
  }

  async deleteProjectAssignment(id: string): Promise<boolean> {
    const result = await db.delete(projectAssignments).where(eq(projectAssignments.id, id)).returning();
    return result.length > 0;
  }

  // Comments & Financials
  async getComments(projectId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.projectId, projectId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(insertComment).returning();
    return result[0];
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const result = await db.select().from(comments).where(eq(comments.id, id));
    return result[0];
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    return result.length > 0;
  }

  async getProjectFinancials(projectId: string): Promise<ProjectFinancials | undefined> {
    const result = await db
      .select()
      .from(projectFinancials)
      .where(eq(projectFinancials.projectId, projectId));
    return result[0];
  }

  async createProjectFinancials(insertFinancials: InsertProjectFinancials): Promise<ProjectFinancials> {
    const financialsData: any = {
      projectId: insertFinancials.projectId,
      contractValue: insertFinancials.contractValue.toString(),
      amountReceived: insertFinancials.amountReceived !== undefined ? insertFinancials.amountReceived.toString() : "0",
      workCompleted: insertFinancials.workCompleted !== undefined ? insertFinancials.workCompleted.toString() : "0",
      isArchived: insertFinancials.isArchived,
      archivedDate: insertFinancials.archivedDate,
    };
    const result = await db.insert(projectFinancials).values(financialsData).returning();
    return result[0];
  }

  async updateProjectFinancials(projectId: string, updates: Partial<ProjectFinancials>): Promise<ProjectFinancials | undefined> {
    const convertedUpdates: any = { ...updates, updatedAt: new Date() };
    if (updates.contractValue !== undefined) {
      convertedUpdates.contractValue = this.toNumericString(Number(updates.contractValue));
    }
    if (updates.amountReceived !== undefined) {
      convertedUpdates.amountReceived = this.toNumericString(Number(updates.amountReceived));
    }
    if (updates.workCompleted !== undefined) {
      convertedUpdates.workCompleted = this.toNumericString(Number(updates.workCompleted));
    }
    const result = await db
      .update(projectFinancials)
      .set(convertedUpdates)
      .where(eq(projectFinancials.projectId, projectId))
      .returning();
    return result[0];
  }

  async deleteProjectFinancials(projectId: string): Promise<boolean> {
    const result = await db.delete(projectFinancials).where(eq(projectFinancials.projectId, projectId)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
