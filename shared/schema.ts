import { pgTable, text, varchar, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const priorityLevels = ["High", "Mid", "Low"] as const;
export const priorityEnum = z.enum(priorityLevels);
export type Priority = z.infer<typeof priorityEnum>;

export const itemStatuses = ["Not Started", "Purchased", "In Installation Phase", "Installed", "Delivered"] as const;
export const itemStatusEnum = z.enum(itemStatuses);
export type ItemStatus = z.infer<typeof itemStatusEnum>;

export const userRoles = ["principle", "employee", "client", "procurement"] as const;
export const userRoleEnum = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleEnum>;

export const taskTypes = ["Design CAD", "IFCs", "3D Rendering", "Procurement", "Site Visits"] as const;
export const taskTypeEnum = z.enum(taskTypes);
export type TaskType = z.infer<typeof taskTypeEnum>;

export const taskStatuses = ["Done", "Undone", "In Progress"] as const;
export const taskStatusEnum = z.enum(taskStatuses);
export type TaskStatus = z.infer<typeof taskStatusEnum>;

export const laborTypes = ["Daily Wage", "Contract"] as const;
export const laborTypeEnum = z.enum(laborTypes);
export type LaborType = z.infer<typeof laborTypeEnum>;

export const documentTypes = ["Appointment Letter", "Joining Letter", "Resignation Letter"] as const;
export const documentTypeEnum = z.enum(documentTypes);
export type DocumentType = z.infer<typeof documentTypeEnum>;

export const unitTypes = [
  "number",
  "rft",
  "sft",
  "meter",
  "meter square",
  "gallons",
  "drums",
  "coils",
  "length",
] as const;
export const unitEnum = z.enum(unitTypes);
export type Unit = z.infer<typeof unitEnum>;

// Database Tables
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clientName: text("client_name"),
  projectTitle: text("project_title"),
  startDate: timestamp("start_date"),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const divisions = pgTable("divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").notNull().references(() => divisions.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 2 }).notNull(),
  rate: numeric("rate", { precision: 18, scale: 2 }).notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("Not Started"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Multi-Role Management System Tables

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // principle, employee, client, procurement
  fullName: text("full_name").notNull(),
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  idCard: text("id_card"),
  whatsapp: text("whatsapp"),
  homeAddress: text("home_address"),
  joiningDate: timestamp("joining_date"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  company: text("company"),
  contactNumber: text("contact_number"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectAssignments = pgTable("project_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taskType: text("task_type").notNull(), // Design CAD, IFCs, 3D Rendering, Procurement, Site Visits
  description: text("description"),
  status: text("status").notNull().default("Undone"), // Done, Undone, In Progress
  remarks: text("remarks"), // Comments/remarks on task progress
  dueDate: timestamp("due_date"),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const procurementItems = pgTable("procurement_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  projectCost: numeric("project_cost", { precision: 18, scale: 2 }).notNull(), // Cost visible to client
  executionCost: numeric("execution_cost", { precision: 18, scale: 2 }), // Actual cost, visible only to principle
  isPurchased: integer("is_purchased").notNull().default(0), // 0 = not purchased, 1 = purchased
  billNumber: text("bill_number"),
  rentalDetails: text("rental_details"), // RFT, SFT, etc.
  quantity: numeric("quantity", { precision: 18, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
  purchasedBy: varchar("purchased_by").references(() => users.id),
  purchasedDate: timestamp("purchased_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const laborCosts = pgTable("labor_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  laborType: text("labor_type").notNull(), // Daily Wage or Contract
  wageRate: numeric("wage_rate", { precision: 18, scale: 2 }), // For daily wage
  numberOfWorkers: integer("number_of_workers"), // For daily wage
  contractAmount: numeric("contract_amount", { precision: 18, scale: 2 }), // For contract
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  attendanceDate: timestamp("attendance_date").notNull(),
  isPresent: integer("is_present").notNull().default(1), // 1 = present, 0 = absent
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeeDocuments = pgTable("employee_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(), // Appointment Letter, Joining Letter, Resignation Letter
  template: text("template").notNull(),
  generatedDocument: text("generated_document"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salaries = pgTable("salaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: text("month").notNull(), // Format: YYYY-MM
  basicSalary: numeric("basic_salary", { precision: 18, scale: 2 }).notNull(),
  incentives: numeric("incentives", { precision: 18, scale: 2 }).notNull().default('0'),
  medical: numeric("medical", { precision: 18, scale: 2 }).notNull().default('0'),
  tax: numeric("tax", { precision: 18, scale: 2 }).notNull().default('0'),
  deductions: numeric("deductions", { precision: 18, scale: 2 }).notNull().default('0'),
  netSalary: numeric("net_salary", { precision: 18, scale: 2 }).notNull(),
  isPaid: integer("is_paid").notNull().default(0), // 0 = not paid, 1 = paid
  paidDate: timestamp("paid_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectFinancials = pgTable("project_financials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  contractValue: numeric("contract_value", { precision: 18, scale: 2 }).notNull(),
  amountReceived: numeric("amount_received", { precision: 18, scale: 2 }).notNull().default('0'),
  workCompleted: numeric("work_completed", { precision: 18, scale: 2 }).notNull().default('0'), // Percentage 0-100
  isArchived: integer("is_archived").notNull().default(0), // 0 = active, 1 = archived/completed
  archivedDate: timestamp("archived_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod Schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Project name is required"),
  clientName: z.string().optional(),
  projectTitle: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  deliveryDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const insertDivisionSchema = createInsertSchema(divisions).omit({
  id: true,
  createdAt: true,
}).extend({
  projectId: z.string(),
  name: z.string().min(1, "Division name is required"),
  order: z.number(),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
}).extend({
  divisionId: z.string(),
  description: z.string().min(1, "Description is required"),
  unit: unitEnum,
  quantity: z.number().min(0, "Quantity must be positive"),
  rate: z.number().min(0, "Rate must be positive"),
  priority: priorityEnum,
  status: itemStatusEnum.optional(),
});

export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  clientName: z.string().optional(),
  projectTitle: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  deliveryDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const updateDivisionSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  name: z.string().min(1).optional(),
  order: z.number().optional(),
});

export const updateItemSchema = z.object({
  id: z.string(),
  divisionId: z.string().optional(),
  description: z.string().min(1).optional(),
  unit: unitEnum.optional(),
  quantity: z.number().min(0).optional(),
  rate: z.number().min(0).optional(),
  priority: priorityEnum.optional(),
  status: itemStatusEnum.optional(),
});

// Multi-Role Management Schemas

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: userRoleEnum,
  fullName: z.string().min(1, "Full name is required"),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string(),
});

export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({
  id: true,
  createdAt: true,
}).extend({
  projectId: z.string(),
  userId: z.string(),
  assignedBy: z.string(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  projectId: z.string(),
  employeeId: z.string(),
  taskType: taskTypeEnum,
  status: taskStatusEnum.optional(),
  assignedBy: z.string(),
});

export const insertProcurementItemSchema = createInsertSchema(procurementItems).omit({
  id: true,
  createdAt: true,
}).extend({
  projectId: z.string(),
  itemName: z.string().min(1, "Item name is required"),
  projectCost: z.number().min(0, "Project cost must be positive"),
  executionCost: z.number().min(0, "Execution cost must be positive").optional(),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
});

export const insertLaborCostSchema = createInsertSchema(laborCosts).omit({
  id: true,
  createdAt: true,
}).extend({
  projectId: z.string(),
  laborType: laborTypeEnum,
  wageRate: z.number().min(0).optional(),
  numberOfWorkers: z.number().int().min(0).optional(),
  contractAmount: z.number().min(0).optional(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
}).extend({
  employeeId: z.string(),
  attendanceDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  employeeId: z.string(),
  documentType: documentTypeEnum,
  template: z.string().min(1, "Template is required"),
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
}).extend({
  employeeId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  basicSalary: z.number().min(0, "Basic salary must be positive"),
  incentives: z.number().min(0).optional(),
  medical: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  netSalary: z.number().min(0, "Net salary must be positive"),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
}).extend({
  projectId: z.string(),
  userId: z.string(),
  comment: z.string().min(1, "Comment cannot be empty"),
});

export const insertProjectFinancialsSchema = createInsertSchema(projectFinancials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  projectId: z.string(),
  contractValue: z.number().min(0, "Contract value must be positive"),
  amountReceived: z.number().min(0).optional(),
  workCompleted: z.number().min(0).max(100).optional(),
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;

export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type UpdateDivision = z.infer<typeof updateDivisionSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type ProcurementItem = typeof procurementItems.$inferSelect;
export type InsertProcurementItem = z.infer<typeof insertProcurementItemSchema>;

export type LaborCost = typeof laborCosts.$inferSelect;
export type InsertLaborCost = z.infer<typeof insertLaborCostSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;

export type Salary = typeof salaries.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ProjectFinancials = typeof projectFinancials.$inferSelect;
export type InsertProjectFinancials = z.infer<typeof insertProjectFinancialsSchema>;

export interface DivisionWithItems extends Division {
  items: Item[];
}

export interface ProjectSummary {
  totalCost: number;
  highPriorityCost: number;
  midPriorityCost: number;
  lowPriorityCost: number;
  totalItems: number;
  totalDivisions: number;
  overallProgress: number;
  divisionBreakdown: {
    divisionId: string;
    divisionName: string;
    totalCost: number;
    itemCount: number;
  }[];
  priorityBreakdown: {
    priority: Priority;
    cost: number;
    itemCount: number;
  }[];
  statusBreakdown: {
    status: ItemStatus;
    itemCount: number;
    cost: number;
  }[];
}
