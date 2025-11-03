import { z } from "zod";

export const priorityLevels = ["High", "Mid", "Low"] as const;
export const priorityEnum = z.enum(priorityLevels);
export type Priority = z.infer<typeof priorityEnum>;

export const itemStatuses = ["Not Started", "Purchased", "In Installation Phase", "Installed", "Delivered"] as const;
export const itemStatusEnum = z.enum(itemStatuses);
export type ItemStatus = z.infer<typeof itemStatusEnum>;

export const userRoles = ["admin", "principle", "employee", "client", "procurement"] as const;
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

// Architecture Lifecycle Types
export const projectTypes = ["design-only", "renovation", "new-build", "construction", "consultancy"] as const;
export const projectTypeEnum = z.enum(projectTypes);
export type ProjectType = z.infer<typeof projectTypeEnum>;

export const projectSubTypes = ["residential", "office", "retail", "hospital", "airport", "high-rise", "mid-rise", "low-rise", "commercial", "industrial", "mixed-use"] as const;
export const projectSubTypeEnum = z.enum(projectSubTypes);
export type ProjectSubType = z.infer<typeof projectSubTypeEnum>;

export const areaUnits = ["sqm", "sqft", "kanal", "yard"] as const;
export const areaUnitEnum = z.enum(areaUnits);
export type AreaUnit = z.infer<typeof areaUnitEnum>;

export const projectScopes = ["concept", "schematic", "detailed", "structural", "MEP", "BOQ", "tender", "construction", "supervision", "3D", "animation", "interior"] as const;
export const projectScopeEnum = z.enum(projectScopes);
export type ProjectScope = z.infer<typeof projectScopeEnum>;

export const feeModelTypes = ["lumpSum", "perUnit", "percentage", "hybrid"] as const;
export const feeModelTypeEnum = z.enum(feeModelTypes);
export type FeeModelType = z.infer<typeof feeModelTypeEnum>;

export const projectStatuses = ["draft", "active", "client-review", "on-hold", "completed", "archived"] as const;
export const projectStatusEnum = z.enum(projectStatuses);
export type ProjectStatus = z.infer<typeof projectStatusEnum>;

export const siteTypes = ["on-site", "arka-office", "virtual"] as const;
export const siteTypeEnum = z.enum(siteTypes);
export type SiteType = z.infer<typeof siteTypeEnum>;

export interface FeeModel {
  type: FeeModelType;
  value: number;
  unit?: AreaUnit; // For perUnit type
}

export interface LockedApprovingBody {
  name: string;
  lockedAt: Date;
  lockedBy: string;
}

// Firebase Types
export interface Project {
  id: string;
  name: string;
  displayName?: string; // Permanent header display name (for rename feature)
  clientId?: string;
  clientName?: string;
  projectTitle?: string;
  startDate?: Date;
  deliveryDate?: Date;

  // Architecture Lifecycle Fields
  projectType?: ProjectType;
  subType?: ProjectSubType;
  area?: number;
  areaUnit?: AreaUnit;
  canonicalAreaSqm?: number; // Normalized to square meters
  stories?: number;
  projectScope?: ProjectScope[];
  feeModel?: FeeModel;
  constructionCostEstimate?: number;
  supervisionPercent?: number;
  primaryContactId?: string;
  lockedApprovingBody?: LockedApprovingBody;
  projectStatus?: ProjectStatus;
  primaryAddress?: string;
  siteGeo?: { lat: number; lng: number };
  siteType?: SiteType;

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

  // BOQ Extensions
  isBoqItem?: boolean;
  itemCode?: string;
  volume?: string; // For tender volumes: "Vol I", "Vol II", etc.
  procurementLinks?: string[]; // Array of procurement item IDs
  markedForApproval?: boolean;
  approvalRequired?: boolean;

  createdAt: Date;
}

export const accountTypes = ["individual", "organization"] as const;
export const accountTypeEnum = z.enum(accountTypes);
export type AccountType = z.infer<typeof accountTypeEnum>;

// Subscription Types
export const subscriptionStatuses = ["trial", "active", "expired", "blocked"] as const;
export const subscriptionStatusEnum = z.enum(subscriptionStatuses);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusEnum>;

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  trialStartDate: Date;
  trialEndDate: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  maxEmployees: number;
  maxProjects: number;
  currentEmployees: number;
  currentProjects: number;
  baseFee: number; // $50
  employeeFee: number; // $10 per employee
  projectFee: number; // $5 per project
  totalAmount: number;
  lastPaymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
  organizationId?: string; // For multi-tenant data isolation
  subscriptionTier?: AccountType; // Alias for accountType
  isFounder?: boolean; // Founder/admin flag
  isArkaAdmin?: boolean; // ARKA office admin flag
  isActive: boolean | number; // Firebase returns 0/1, TypeScript expects boolean
  subscriptionId?: string; // Link to subscription
  createdAt: Date;
}

export interface Employee {
  id: string;
  userId: string;
  idCard?: string;
  email?: string;
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

export interface SubClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string; // e.g., "Family Member", "Representative"
  profilePicture?: string;
  canEditProfile: boolean;
}

export interface Client {
  id: string;
  userId: string;
  clientName: string;
  jobDesignation?: string;
  assignedProjectId?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  projectAddress?: string;
  projectStartDate?: Date;
  profilePicture?: string;
  company?: string;
  profession?: string;
  contactNumber?: string;
  address?: string;
  parentClientId?: string; // For sub-clients (family members/representatives)
  isSubClient?: boolean;

  // Architecture Lifecycle Extensions
  subClients?: SubClient[];
  paymentTerms?: string;
  billingContact?: string;
  preferredCurrency?: string;
  preferredUnit?: AreaUnit;
  canEditProfile?: boolean;

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

  // Architecture Lifecycle Financials
  designFee?: number;
  supervisionFee?: number;
  boqTotal?: number;
  laborTotal?: number;
  procurementTotal?: number;
  subcontractTotal?: number;
  contingencyPercent?: number;
  contingencyAmount?: number;
  overheadPercent?: number;
  overheadAmount?: number;
  constructionEstimate?: number;
  projectTotal?: number;
  amountOutstanding?: number;
  invoices?: Array<{
    id: string;
    amount: number;
    date: Date;
    status: "draft" | "sent" | "paid" | "overdue";
    milestoneId?: string;
  }>;
  milestonePayments?: Array<{
    milestoneId: string;
    amount: number;
    dueDate?: Date;
    paidDate?: Date;
    status: "pending" | "paid" | "partial";
  }>;

  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
  timestamp: Date;
}

// Meetings Types
export const locationTypes = ["arka-office", "on-site", "virtual"] as const;
export const locationTypeEnum = z.enum(locationTypes);
export type LocationType = z.infer<typeof locationTypeEnum>;

export interface MeetingAttendee {
  userId: string;
  name: string;
  role: string;
  email?: string;
}

export interface MeetingDecision {
  id: string;
  decision: string;
  owner: string;
  ownerName: string;
  dueDate?: Date;
  status: "pending" | "completed" | "overdue";
  createdAt: Date;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  dateTime: Date;
  locationType: LocationType;
  locationDetails?: string;
  siteGeo?: { lat: number; lng: number };
  attendees: MeetingAttendee[];
  approvingBody?: string;
  approvingBodyLocked?: boolean;
  minutes?: string; // Rich text
  decisions: MeetingDecision[];
  attachments?: string[]; // URLs to files
  isLocked: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Milestones Types
export const milestoneTypes = ["designFee", "construction", "payment", "submission"] as const;
export const milestoneTypeEnum = z.enum(milestoneTypes);
export type MilestoneType = z.infer<typeof milestoneTypeEnum>;

export const milestoneStatuses = ["pending", "in-progress", "completed", "overdue"] as const;
export const milestoneStatusEnum = z.enum(milestoneStatuses);
export type MilestoneStatus = z.infer<typeof milestoneStatusEnum>;

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  type: MilestoneType;
  dueDate?: Date;
  amount?: number;
  linkedDeliverables?: string[]; // Array of item/task/boq IDs
  status: MilestoneStatus;
  completedAt?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Client Portal Types
export const approvalStatuses = ["pending", "approved", "objection"] as const;
export const approvalStatusEnum = z.enum(approvalStatuses);
export type ApprovalStatus = z.infer<typeof approvalStatusEnum>;

export interface ApprovalHistory {
  timestamp: Date;
  action: string;
  userId: string;
  userName: string;
  previousStatus?: ApprovalStatus;
  newStatus: ApprovalStatus;
  comment?: string;
}

export interface ClientApproval {
  id: string;
  projectId: string;
  clientId: string;
  itemRef?: string; // Can point to division/item/boq/task/meeting-decision
  itemType: "division" | "item" | "stage" | "meeting" | "boq"; // Type of item for approval
  itemName: string;
  itemSnapshot?: any; // Full snapshot of item data at time of approval request
  status: ApprovalStatus;
  objectionComment?: string;
  requestedBy: string;
  requestedAt: Date;
  respondedAt?: Date;
  clientResponse?: {
    comment?: string;
    timestamp: Date;
    responseType: "approved" | "objected" | "comment";
  };
  history: ApprovalHistory[];
  createdAt: Date;
}

export interface ClientNotification {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  message: string;
  type: "approval_request" | "project_update" | "general" | "comment";
  isRead: boolean;
  relatedApprovalId?: string;
  createdBy: string;
  createdAt: Date;
}

export interface ClientActivityLog {
  id: string;
  clientId: string;
  activityType: "login" | "logout" | "approval" | "comment" | "view_project";
  description: string;
  projectId?: string;
  relatedId?: string; // ID of approval, comment, etc.
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ClientComment {
  id: string;
  projectId: string;
  clientId: string;
  itemId?: string; // Optional: specific item/division
  comment: string;
  attachments?: string[]; // URLs to uploaded files
  isInternal: boolean; // If true, only visible to principle/admin
  createdAt: Date;
}

// Insert Schemas
export const insertProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientId: z.string().optional(),
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

  // Architecture Lifecycle Fields
  projectType: projectTypeEnum.optional(),
  subType: projectSubTypeEnum.optional(),
  area: z.number().min(0).optional(),
  areaUnit: areaUnitEnum.optional(),
  stories: z.number().int().min(0).optional(),
  projectScope: z.array(projectScopeEnum).optional(),
  feeModel: z.object({
    type: feeModelTypeEnum,
    value: z.number().min(0),
    unit: areaUnitEnum.optional(),
  }).optional(),
  constructionCostEstimate: z.number().min(0).optional(),
  supervisionPercent: z.number().min(0).max(100).optional(),
  primaryContactId: z.string().optional(),
  projectStatus: projectStatusEnum.optional(),
  primaryAddress: z.string().optional(),
  siteGeo: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  siteType: siteTypeEnum.optional(),
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

  // BOQ Extensions
  isBoqItem: z.boolean().optional(),
  itemCode: z.string().optional(),
  volume: z.string().optional(),
  procurementLinks: z.array(z.string()).optional(),
  markedForApproval: z.boolean().optional(),
  approvalRequired: z.boolean().optional(),
});

export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  clientId: z.string().optional(),
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

  // Architecture Lifecycle Fields
  projectType: projectTypeEnum.optional(),
  subType: projectSubTypeEnum.optional(),
  area: z.number().min(0).optional(),
  areaUnit: areaUnitEnum.optional(),
  stories: z.number().int().min(0).optional(),
  projectScope: z.array(projectScopeEnum).optional(),
  feeModel: z.object({
    type: feeModelTypeEnum,
    value: z.number().min(0),
    unit: areaUnitEnum.optional(),
  }).optional(),
  constructionCostEstimate: z.number().min(0).optional(),
  supervisionPercent: z.number().min(0).max(100).optional(),
  primaryContactId: z.string().optional(),
  projectStatus: projectStatusEnum.optional(),
  primaryAddress: z.string().optional(),
  siteGeo: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  siteType: siteTypeEnum.optional(),
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
  email: z.string().email().optional(),
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
  clientName: z.string().min(1, "Client name is required"),
  jobDesignation: z.string().optional(),
  assignedProjectId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  projectAddress: z.string().optional(),
  projectStartDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  profilePicture: z.string().optional(),
  company: z.string().optional(),
  profession: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  parentClientId: z.string().optional(),
  isSubClient: z.boolean().optional(),
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

export const insertClientApprovalSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
  itemId: z.string().optional(),
  itemType: z.enum(["division", "item", "stage"]),
  itemName: z.string().min(1, "Item name is required"),
  status: approvalStatusEnum.optional(),
  objectionComment: z.string().optional(),
  requestedBy: z.string(),
  requestedAt: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  respondedAt: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export const insertClientNotificationSchema = z.object({
  clientId: z.string(),
  projectId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["approval_request", "project_update", "general", "comment"]),
  isRead: z.boolean().optional(),
  relatedApprovalId: z.string().optional(),
  createdBy: z.string(),
});

export const insertClientActivityLogSchema = z.object({
  clientId: z.string(),
  activityType: z.enum(["login", "logout", "approval", "comment", "view_project"]),
  description: z.string().min(1, "Description is required"),
  projectId: z.string().optional(),
  relatedId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const insertClientCommentSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
  itemId: z.string().optional(),
  comment: z.string().min(1, "Comment cannot be empty"),
  attachments: z.array(z.string()).optional(),
  isInternal: z.boolean().optional(),
});

export const insertMeetingSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Title is required"),
  dateTime: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  locationType: locationTypeEnum,
  locationDetails: z.string().optional(),
  siteGeo: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  attendees: z.array(z.object({
    userId: z.string(),
    name: z.string(),
    role: z.string(),
    email: z.string().optional(),
  })),
  approvingBody: z.string().optional(),
  approvingBodyLocked: z.boolean().optional(),
  minutes: z.string().optional(),
  decisions: z.array(z.object({
    id: z.string(),
    decision: z.string(),
    owner: z.string(),
    ownerName: z.string(),
    dueDate: z.union([z.string(), z.date()]).transform(val =>
      typeof val === 'string' ? new Date(val) : val
    ).optional(),
    status: z.enum(["pending", "completed", "overdue"]),
    createdAt: z.union([z.string(), z.date()]).transform(val =>
      typeof val === 'string' ? new Date(val) : val
    ),
  })).optional(),
  attachments: z.array(z.string()).optional(),
  isLocked: z.boolean().optional(),
  createdBy: z.string(),
});

export const insertMilestoneSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "Title is required"),
  type: milestoneTypeEnum,
  dueDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  amount: z.number().min(0).optional(),
  linkedDeliverables: z.array(z.string()).optional(),
  status: milestoneStatusEnum.optional(),
  completedAt: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
});

export const insertAuditLogSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  action: z.string().min(1, "Action is required"),
  entityType: z.string().min(1, "Entity type is required"),
  entityId: z.string(),
  changes: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  organizationId: z.string().optional(),
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
export type InsertClientApproval = z.infer<typeof insertClientApprovalSchema>;
export type InsertClientNotification = z.infer<typeof insertClientNotificationSchema>;
export type InsertClientActivityLog = z.infer<typeof insertClientActivityLogSchema>;
export type InsertClientComment = z.infer<typeof insertClientCommentSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

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

// ============================================================================
// OFIVIO SETTINGS & INTEGRATIONS SYSTEM
// ============================================================================

// Theme System
export const themeKeys = ["default", "modern-slate", "warm-architect"] as const;
export const themeKeyEnum = z.enum(themeKeys);
export type ThemeKey = z.infer<typeof themeKeyEnum>;

export interface Theme {
  key: ThemeKey;
  name: string;
  primary: string;
  accent: string;
  background: string;
  text: string;
  cardBg?: string;
  borderColor?: string;
  exampleCSS?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const insertThemeSchema = z.object({
  key: themeKeyEnum,
  name: z.string().min(1),
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  cardBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  exampleCSS: z.string().optional(),
});

export type InsertTheme = z.infer<typeof insertThemeSchema>;

// I18n Configuration
export const supportedLanguages = ["en", "ur", "ar", "fr", "es", "it", "nl", "zh"] as const;
export const languageEnum = z.enum(supportedLanguages);
export type SupportedLanguage = z.infer<typeof languageEnum>;

export interface I18nConfig {
  enabledLanguages: SupportedLanguage[];
  defaultLanguage: SupportedLanguage;
  translationsPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// News Ticker Configuration
export const newsSourceTypes = ["rss", "manual"] as const;
export const newsSourceTypeEnum = z.enum(newsSourceTypes);
export type NewsSourceType = z.infer<typeof newsSourceTypeEnum>;

export interface NewsTickerSource {
  type: NewsSourceType;
  url?: string;
  enabled: boolean;
  manualItems?: NewsItem[];
  refreshInterval?: number; // minutes
}

export interface NewsItem {
  id: string;
  title: string;
  url?: string;
  publishedAt: Date;
}

// Social Connections
export const socialProviders = ["github", "google", "facebook", "twitter", "pinterest", "instagram", "snapchat"] as const;
export const socialProviderEnum = z.enum(socialProviders);
export type SocialProvider = z.infer<typeof socialProviderEnum>;

export interface SocialConnection {
  id: string;
  provider: SocialProvider;
  connected: boolean;
  meta?: {
    username?: string;
    profileUrl?: string;
    accessToken?: string; // Reference to Secret Manager, not actual token
    scope?: string[];
    connectedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const insertSocialConnectionSchema = z.object({
  provider: socialProviderEnum,
  connected: z.boolean().default(false),
  meta: z.object({
    username: z.string().optional(),
    profileUrl: z.string().url().optional(),
    accessToken: z.string().optional(),
    scope: z.array(z.string()).optional(),
  }).optional(),
});

export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;

// Organization Settings
export interface OrganizationSettings {
  id: string;
  orgId: string;
  studioName: string;
  logoURL?: string;
  tagline?: string;
  contactEmail: string;
  contactPhone?: string;
  defaultCurrency: string;
  defaultAreaUnit: AreaUnit;
  timezone: string;
  workingHours?: {
    start: string;
    end: string;
  };
  theme: ThemeKey;
  customColors?: {
    primary?: string;
    accent?: string;
    background?: string;
  };
  languages: SupportedLanguage[];
  newsTickerSource?: NewsTickerSource;
  socialConnections?: Record<string, { connected: boolean; meta?: any }>;
  blogEnabled: boolean;
  blogConfig?: {
    homepageEnabled: boolean;
    featuredPostId?: string;
    postsPerPage?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const insertOrganizationSettingsSchema = z.object({
  orgId: z.string(),
  studioName: z.string().min(1, "Studio name is required"),
  logoURL: z.string().url().optional(),
  tagline: z.string().optional(),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().optional(),
  defaultCurrency: z.string().default("PKR"),
  defaultAreaUnit: areaUnitEnum.default("sqm"),
  timezone: z.string().default("Asia/Karachi"),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  theme: themeKeyEnum.default("default"),
  customColors: z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
  }).optional(),
  languages: z.array(languageEnum).default(["en"]),
  newsTickerSource: z.object({
    type: newsSourceTypeEnum,
    url: z.string().url().optional(),
    enabled: z.boolean().default(false),
    refreshInterval: z.number().optional(),
  }).optional(),
  blogEnabled: z.boolean().default(false),
  blogConfig: z.object({
    homepageEnabled: z.boolean().default(false),
    featuredPostId: z.string().optional(),
    postsPerPage: z.number().default(10),
  }).optional(),
});

export const updateOrganizationSettingsSchema = insertOrganizationSettingsSchema.partial().omit({ orgId: true });

export type InsertOrganizationSettings = z.infer<typeof insertOrganizationSettingsSchema>;
export type UpdateOrganizationSettings = z.infer<typeof updateOrganizationSettingsSchema>;

// Blog System
export const blogPostStatuses = ["draft", "published", "archived"] as const;
export const blogPostStatusEnum = z.enum(blogPostStatuses);
export type BlogPostStatus = z.infer<typeof blogPostStatusEnum>;

export interface BlogPost {
  id: string;
  postId: string;
  orgId: string;
  title: string;
  slug: string;
  summary: string;
  contentHtml: string;
  contentMarkdown?: string;
  authorId: string;
  authorName?: string;
  coverUrl?: string;
  tags: string[];
  status: BlogPostStatus;
  published: boolean;
  publishedAt?: Date;
  views?: number;
  likes?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const insertBlogPostSchema = z.object({
  orgId: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  summary: z.string().min(1, "Summary is required"),
  contentHtml: z.string().min(1, "Content is required"),
  contentMarkdown: z.string().optional(),
  authorId: z.string(),
  coverUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  status: blogPostStatusEnum.default("draft"),
  published: z.boolean().default(false),
});

export const updateBlogPostSchema = insertBlogPostSchema.partial().omit({ orgId: true, authorId: true });

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;

// User Preferences
export interface UserPreferences {
  id: string;
  userId: string;
  theme: ThemeKey;
  language: SupportedLanguage;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const insertUserPreferencesSchema = z.object({
  userId: z.string(),
  theme: themeKeyEnum.default("default"),
  language: languageEnum.default("en"),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).default({ email: true, push: true, sms: false }),
  timezone: z.string().optional(),
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Project Display Name History (for rename tracking)
export interface ProjectNameHistory {
  id: string;
  projectId: string;
  oldName: string;
  newName: string;
  changedBy: string;
  changedByName: string;
  timestamp: Date;
  reason?: string;
}

// News Cache (for RSS feeds)
export interface NewsCache {
  id: string;
  orgId: string;
  items: NewsItem[];
  lastFetchedAt: Date;
  expiresAt: Date;
}

// Webhook Configuration
export interface WebhookConfig {
  id: string;
  orgId: string;
  name: string;
  url: string;
  events: string[]; // e.g., ['project.created', 'task.completed']
  enabled: boolean;
  secret?: string;
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export const insertWebhookConfigSchema = z.object({
  orgId: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()),
  enabled: z.boolean().default(true),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;
