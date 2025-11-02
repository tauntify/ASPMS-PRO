import { z } from "zod";

// ============================================================================
// TIMESHEET MANAGEMENT
// ============================================================================

export const timesheetStatuses = ["Draft", "Submitted", "Approved", "Rejected"] as const;
export const timesheetStatusEnum = z.enum(timesheetStatuses);
export type TimesheetStatus = z.infer<typeof timesheetStatusEnum>;

export const hourTypes = ["Billable", "Non-Billable"] as const;
export const hourTypeEnum = z.enum(hourTypes);
export type HourType = z.infer<typeof hourTypeEnum>;

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  projectId?: string;
  taskId?: string;
  date: Date;
  hoursWorked: number;
  hourType: HourType;
  description?: string;
  status: TimesheetStatus;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const insertTimesheetEntrySchema = z.object({
  employeeId: z.string(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  date: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  hoursWorked: z.number().min(0).max(24),
  hourType: hourTypeEnum,
  description: z.string().optional(),
  status: timesheetStatusEnum.optional(),
});

export type InsertTimesheetEntry = z.infer<typeof insertTimesheetEntrySchema>;

// ============================================================================
// BILLING AND INVOICING
// ============================================================================

export const invoiceStatuses = ["Draft", "Sent", "Paid", "Overdue", "Cancelled"] as const;
export const invoiceStatusEnum = z.enum(invoiceStatuses);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

export const paymentTerms = ["Net 15", "Net 30", "Net 45", "Net 60", "Due on Receipt"] as const;
export const paymentTermsEnum = z.enum(paymentTerms);
export type PaymentTerms = z.infer<typeof paymentTermsEnum>;

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  overheadRate: number;
  overheadAmount: number;
  gaRate: number; // General & Administrative
  gaAmount: number;
  total: number;
  amountPaid: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category: "Labor" | "Materials" | "Milestone" | "Other";
  createdAt: Date;
}

export const insertInvoiceSchema = z.object({
  projectId: z.string(),
  clientId: z.string(),
  issueDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  dueDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  paymentTerms: paymentTermsEnum,
  taxRate: z.number().min(0).max(100).optional(),
  overheadRate: z.number().min(0).max(100).optional(),
  gaRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
});

export const insertInvoiceLineItemSchema = z.object({
  invoiceId: z.string(),
  description: z.string().min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  category: z.enum(["Labor", "Materials", "Milestone", "Other"]),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

// ============================================================================
// TIME AND EXPENSE TRACKING
// ============================================================================

export const expenseCategories = [
  "Fuel",
  "Materials",
  "Site Visit",
  "Transportation",
  "Equipment",
  "Meals",
  "Accommodation",
  "Other"
] as const;
export const expenseCategoryEnum = z.enum(expenseCategories);
export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

export const expenseStatuses = ["Pending", "Approved", "Rejected", "Reimbursed"] as const;
export const expenseStatusEnum = z.enum(expenseStatuses);
export type ExpenseStatus = z.infer<typeof expenseStatusEnum>;

export interface Expense {
  id: string;
  employeeId: string;
  projectId: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  description: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  reimbursedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const insertExpenseSchema = z.object({
  employeeId: z.string(),
  projectId: z.string(),
  category: expenseCategoryEnum,
  amount: z.number().min(0),
  date: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  description: z.string().min(1),
  receiptUrl: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// ============================================================================
// RESOURCE MANAGEMENT AND ALLOCATION
// ============================================================================

export const resourceTypes = ["Employee", "Equipment", "Material", "Budget"] as const;
export const resourceTypeEnum = z.enum(resourceTypes);
export type ResourceType = z.infer<typeof resourceTypeEnum>;

export interface ResourceAllocation {
  id: string;
  projectId: string;
  resourceType: ResourceType;
  resourceId: string; // employeeId or procurementItemId or custom ID
  resourceName: string;
  allocationPercentage: number; // 0-100
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export const insertResourceAllocationSchema = z.object({
  projectId: z.string(),
  resourceType: resourceTypeEnum,
  resourceId: z.string(),
  resourceName: z.string(),
  allocationPercentage: z.number().min(0).max(100),
  startDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  endDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  notes: z.string().optional(),
  createdBy: z.string(),
});

export const insertProjectMilestoneSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.union([z.string(), z.date()]).transform(val =>
    typeof val === 'string' ? new Date(val) : val
  ),
  order: z.number().min(0),
});

export type InsertResourceAllocation = z.infer<typeof insertResourceAllocationSchema>;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;

// ============================================================================
// FINANCIAL OVERVIEW DASHBOARD
// ============================================================================

export interface ProjectFinancialSummary {
  projectId: string;
  projectName: string;
  
  // Budget tracking
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  
  // Cost breakdown
  laborCost: number;
  materialCost: number;
  procurementCost: number;
  expenseCost: number;
  
  // Revenue
  contractValue: number;
  invoiced: number;
  received: number;
  
  // Profitability
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  
  // Overhead and GA
  overheadCost: number;
  gaCost: number;
  fringeCost: number;
  
  // Completion
  workCompleted: number; // percentage
  budgetUtilized: number; // percentage
}

export interface DepartmentFinancialSummary {
  department: string;
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
}

export interface FinancialMetrics {
  // Company-wide metrics
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  
  // Operating metrics
  totalOverhead: number;
  totalGA: number;
  totalFringe: number;
  
  // Project metrics
  activeProjects: number;
  completedProjects: number;
  averageProjectValue: number;
  averageMargin: number;
  
  // Cash flow
  accountsReceivable: number;
  accountsPayable: number;
  
  // Time period
  periodStart: Date;
  periodEnd: Date;
}

// ============================================================================
// BUDGET TRACKING
// ============================================================================

export interface BudgetCategory {
  id: string;
  projectId: string;
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  createdAt: Date;
  updatedAt: Date;
}

export const insertBudgetCategorySchema = z.object({
  projectId: z.string(),
  category: z.string().min(1),
  budgetedAmount: z.number().min(0),
});

export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

// ============================================================================
// REPORTS
// ============================================================================

export interface TimesheetSummary {
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM or YYYY-Www
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    hours: number;
  }[];
}

export interface ExpenseSummary {
  projectId: string;
  projectName: string;
  totalExpenses: number;
  categoryBreakdown: {
    category: ExpenseCategory;
    amount: number;
    count: number;
  }[];
  pendingReimbursements: number;
  approvedExpenses: number;
  rejectedExpenses: number;
}
