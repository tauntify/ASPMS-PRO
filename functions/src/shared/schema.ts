import { z } from "zod";

export const priorityLevels = ["High", "Mid", "Low"] as const;
export const priorityEnum = z.enum(priorityLevels);
export type Priority = z.infer<typeof priorityEnum>;

export const itemStatuses = ["Not Started", "Purchased", "In Installation Phase", "Installed", "Delivered"] as const;
export const itemStatusEnum = z.enum(itemStatuses);
export type ItemStatus = z.infer<typeof itemStatusEnum>;

export const userRoles = ["principle", "employee", "client", "procurement"] as const;
export const userRoleEnum = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleEnum>;

export const designations = [
  "Associate Architect",
  "Principal Architect",
  "Draftsman",
  "Guard",
  "Salesman",
  "Interior Designer",
  "Interior Draftsman",
  "MEP Draftsman",
  "Engineer",
  "Site Engineer",
  "Procurement Incharge",
  "Accountant",
  "Receptionist",
  "Office Boy",
  "3D Visualizer",
  "Senior Draftsman",
  "CEO",
  "Junior Architect",
  "Intern"
] as const;
export const designationEnum = z.enum(designations);
export type Designation = z.infer<typeof designationEnum>;

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

// Firebase Types
export interface Project {
  id: string;
  name: string;
  clientName?: string;
  projectTitle?: string;
  startDate?: Date;
  deliveryDate?: Date;
  createdAt: Date;
}

export interface Division {
  id: string;
  projectId: string;
  name: string;
  order: number;
  createdAt: Date;
}

export interface Item {
  id: string;
  divisionId: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  priority: Priority;
  status: ItemStatus;
  createdAt: Date;
}

export const accountTypes = ["individual", "organization"] as const;
export const accountTypeEnum = z.enum(accountTypes);
export type AccountType = z.infer<typeof accountTypeEnum>;

export interface User {
  id: string;
  firebaseUid: string;
  username: string;
  password?: string; // Keep for backward compatibility
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  accountType?: AccountType;
  organizationName?: string; // For organization accounts
  isActive: boolean | number; // Firebase returns 0/1, TypeScript expects boolean
  createdAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  idCard?: string;
  whatsapp?: string;
  homeAddress?: string;
  joiningDate?: Date;
  profilePicture?: string;
  designation?: Designation;
  basicSalary?: number;
  travelingAllowance?: number;
  medicalAllowance?: number;
  foodAllowance?: number;
  salaryDate?: number; // Day of month (1-31)
  isSalaryHeld?: boolean;
  createdAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  company?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  assignedBy: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  employeeId: string;
  taskType: TaskType;
  description?: string;
  status: TaskStatus;
  remarks?: string;
  dueDate?: Date;
  assignedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcurementItem {
  id: string;
  projectId: string;
  itemName: string;
  projectCost: number;
  executionCost?: number;
  isPurchased: boolean | number; // Firebase returns 0/1, TypeScript expects boolean
  billNumber?: string;
  rentalDetails?: string;
  quantity: number;
  unit: string;
  notes?: string;
  purchasedBy?: string;
  purchasedDate?: Date;
  createdAt: Date;
}

export interface LaborCost {
  id: string;
  projectId: string;
  laborType: LaborType;
  wageRate?: number;
  numberOfWorkers?: number;
  contractAmount?: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  attendanceDate: Date;
  isPresent: boolean;
  notes?: string;
  createdAt: Date;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  template: string;
  generatedDocument?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Salary {
  id: string;
  employeeId: string;
  month: string; // Format: YYYY-MM
  basicSalary: number;
  travelingAllowance: number;
  medicalAllowance: number;
  foodAllowance: number;
  totalEarnings: number;
  advancePaid: number;
  absentDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  paidAmount: number;
  remainingAmount: number;
  isPaid: boolean;
  isHeld: boolean;
  paidDate?: Date;
  salaryDate?: number; // Day of month for scheduled payment
  attendanceDays: number;
  totalWorkingDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  salaryId?: string; // Link to specific salary month
  amount: number;
  date: Date;
  reason?: string;
  paidBy: string;
  createdAt: Date;
}

export interface SalaryPayment {
  id: string;
  salaryId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  notes?: string;
  paidBy: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  comment: string;
  createdAt: Date;
}

export interface ProjectFinancials {
  id: string;
  projectId: string;
  contractValue: number;
  amountReceived: number;
  workCompleted: number;
  isArchived: boolean;
  archivedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Insert Schemas
export const insertProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientName: z.string().optional(),
  projectTitle: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  deliveryDate: z.union([z.string(), z.date()]).transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
});

export const insertDivisionSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, "Division name is required"),
  order: z.number(),
});

export const insertItemSchema = z.object({
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
  startDate: z.union([z.string(), z.date()]).transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  deliveryDate: z.union([z.string(), z.date()]).transform(val => {
    if (!val) return undefined;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
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

export const insertUserSchema = z.object({
  firebaseUid: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: userRoleEnum,
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  accountType: accountTypeEnum.optional(),
  organizationName: z.string().optional(),
});

export const insertEmployeeSchema = z.object({
  userId: z.string(),
  idCard: z.string().optional(),
  whatsapp: z.string().optional(),
  homeAddress: z.string().optional(),
  joiningDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  profilePicture: z.string().optional(),
  designation: designationEnum.optional(),
  basicSalary: z.number().min(0).optional(),
  travelingAllowance: z.number().min(0).optional(),
  medicalAllowance: z.number().min(0).optional(),
  foodAllowance: z.number().min(0).optional(),
  salaryDate: z.number().min(1).max(31).optional(),
  isSalaryHeld: z.boolean().optional(),
});

export const insertClientSchema = z.object({
  userId: z.string(),
  company: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const insertProjectAssignmentSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  assignedBy: z.string(),
});

export const insertTaskSchema = z.object({
  projectId: z.string(),
  employeeId: z.string(),
  taskType: taskTypeEnum,
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  remarks: z.string().optional(),
  dueDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  assignedBy: z.string(),
});

export const insertProcurementItemSchema = z.object({
  projectId: z.string(),
  itemName: z.string().min(1, "Item name is required"),
  projectCost: z.number().min(0, "Project cost must be positive"),
  executionCost: z.number().min(0, "Execution cost must be positive").optional(),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  isPurchased: z.boolean().optional(),
  billNumber: z.string().optional(),
  rentalDetails: z.string().optional(),
  notes: z.string().optional(),
  purchasedBy: z.string().optional(),
  purchasedDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const insertLaborCostSchema = z.object({
  projectId: z.string(),
  laborType: laborTypeEnum,
  wageRate: z.number().min(0).optional(),
  numberOfWorkers: z.number().int().min(0).optional(),
  contractAmount: z.number().min(0).optional(),
  description: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  endDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const insertAttendanceSchema = z.object({
  employeeId: z.string(),
  attendanceDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  isPresent: z.boolean().optional(),
  notes: z.string().optional(),
});

export const insertEmployeeDocumentSchema = z.object({
  employeeId: z.string(),
  documentType: documentTypeEnum,
  template: z.string().min(1, "Template is required"),
  generatedDocument: z.string().optional(),
});

export const insertSalarySchema = z.object({
  employeeId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  basicSalary: z.number().min(0, "Basic salary must be positive"),
  travelingAllowance: z.number().min(0).optional(),
  medicalAllowance: z.number().min(0).optional(),
  foodAllowance: z.number().min(0).optional(),
  totalEarnings: z.number().min(0).optional(),
  advancePaid: z.number().min(0).optional(),
  absentDeductions: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  totalDeductions: z.number().min(0).optional(),
  netSalary: z.number().min(0, "Net salary must be positive"),
  paidAmount: z.number().min(0).optional(),
  remainingAmount: z.number().min(0).optional(),
  isPaid: z.boolean().optional(),
  isHeld: z.boolean().optional(),
  paidDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  salaryDate: z.number().min(1).max(31).optional(),
  attendanceDays: z.number().min(0).optional(),
  totalWorkingDays: z.number().min(0).optional(),
});

export const insertSalaryAdvanceSchema = z.object({
  employeeId: z.string(),
  salaryId: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  reason: z.string().optional(),
  paidBy: z.string(),
});

export const insertSalaryPaymentSchema = z.object({
  salaryId: z.string(),
  amount: z.number().min(0, "Amount must be positive"),
  paymentDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  paidBy: z.string(),
});

export const insertCommentSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  comment: z.string().min(1, "Comment cannot be empty"),
});

export const insertProjectFinancialsSchema = z.object({
  projectId: z.string(),
  contractValue: z.number().min(0, "Contract value must be positive"),
  amountReceived: z.number().min(0).optional(),
  workCompleted: z.number().min(0).max(100).optional(),
  isArchived: z.boolean().optional(),
  archivedDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

// Insert Types
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type UpdateDivision = z.infer<typeof updateDivisionSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertProcurementItem = z.infer<typeof insertProcurementItemSchema>;
export type InsertLaborCost = z.infer<typeof insertLaborCostSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;
export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type InsertSalaryAdvance = z.infer<typeof insertSalaryAdvanceSchema>;
export type InsertSalaryPayment = z.infer<typeof insertSalaryPaymentSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
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
