import {
  TimesheetEntry, InsertTimesheetEntry,
  Invoice, InvoiceLineItem, InsertInvoice, InsertInvoiceLineItem,
  Expense, InsertExpense,
  ResourceAllocation, InsertResourceAllocation,
  ProjectMilestone, InsertProjectMilestone,
  BudgetCategory, InsertBudgetCategory,
  ProjectFinancialSummary, DepartmentFinancialSummary, FinancialMetrics,
  TimesheetSummary, ExpenseSummary,
} from "@shared/schema-extensions";
import { db } from "./firebase";
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

// ============================================================================
// TIMESHEET MANAGEMENT
// ============================================================================

export async function getTimesheetEntries(
  employeeId?: string,
  projectId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<TimesheetEntry[]> {
  let query: any = db.collection('timesheetEntries');
  
  if (employeeId) {
    query = query.where('employeeId', '==', employeeId);
  }
  
  if (projectId) {
    query = query.where('projectId', '==', projectId);
  }
  
  const snapshot = await query.orderBy('date', 'desc').get();
  let entries = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    date: fromTimestamp(doc.data().date)!,
    submittedAt: fromTimestamp(doc.data().submittedAt),
    approvedAt: fromTimestamp(doc.data().approvedAt),
    createdAt: fromTimestamp(doc.data().createdAt)!,
    updatedAt: fromTimestamp(doc.data().updatedAt)!,
  } as TimesheetEntry));
  
  // Filter by date range if provided
  if (startDate || endDate) {
    entries = entries.filter((entry: TimesheetEntry) => {
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;
      return true;
    });
  }
  
  return entries;
}

export async function getTimesheetEntry(id: string): Promise<TimesheetEntry | undefined> {
  const doc = await db.collection('timesheetEntries').doc(id).get();
  if (!doc.exists) return undefined;
  return {
    id: doc.id,
    ...doc.data(),
    date: fromTimestamp(doc.data()!.date)!,
    submittedAt: fromTimestamp(doc.data()!.submittedAt),
    approvedAt: fromTimestamp(doc.data()!.approvedAt),
    createdAt: fromTimestamp(doc.data()!.createdAt)!,
    updatedAt: fromTimestamp(doc.data()!.updatedAt)!,
  } as TimesheetEntry;
}

export async function createTimesheetEntry(entry: InsertTimesheetEntry): Promise<TimesheetEntry> {
  const id = generateId();
  const now = Timestamp.now();
  const entryData = {
    ...entry,
    status: entry.status || "Draft",
    date: toTimestamp(entry.date)!,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection('timesheetEntries').doc(id).set(entryData);
  return {
    id,
    ...entryData,
    date: entry.date,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  } as TimesheetEntry;
}

export async function updateTimesheetEntry(
  id: string,
  updates: Partial<TimesheetEntry>
): Promise<TimesheetEntry | undefined> {
  const updateData: any = { ...updates, updatedAt: Timestamp.now() };
  if (updates.date) updateData.date = toTimestamp(updates.date);
  if (updates.submittedAt) updateData.submittedAt = toTimestamp(updates.submittedAt);
  if (updates.approvedAt) updateData.approvedAt = toTimestamp(updates.approvedAt);
  await db.collection('timesheetEntries').doc(id).update(updateData);
  return getTimesheetEntry(id);
}

export async function deleteTimesheetEntry(id: string): Promise<boolean> {
  await db.collection('timesheetEntries').doc(id).delete();
  return true;
}

export async function getTimesheetSummary(
  employeeId: string,
  period: string
): Promise<TimesheetSummary> {
  // Parse period (YYYY-MM or YYYY-Www)
  const isWeekly = period.includes('W');
  let startDate: Date;
  let endDate: Date;
  
  if (isWeekly) {
    // Weekly format: YYYY-Www
    const [yearStr, weekStr] = period.split('-W');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    // Calculate start and end dates for the week
    const jan1 = new Date(year, 0, 1);
    const daysOffset = (week - 1) * 7;
    startDate = new Date(jan1.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  } else {
    // Monthly format: YYYY-MM
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0);
  }
  
  const entries = await getTimesheetEntries(employeeId, undefined, startDate, endDate);
  
  const totalHours = entries.reduce((sum, e) => sum + e.hoursWorked, 0);
  const billableHours = entries.filter(e => e.hourType === "Billable").reduce((sum, e) => sum + e.hoursWorked, 0);
  const nonBillableHours = totalHours - billableHours;
  
  // Group by project
  const projectMap = new Map<string, { projectName: string; hours: number }>();
  for (const entry of entries) {
    if (entry.projectId) {
      const existing = projectMap.get(entry.projectId);
      if (existing) {
        existing.hours += entry.hoursWorked;
      } else {
        projectMap.set(entry.projectId, {
          projectName: entry.projectId, // Will be enriched with actual name
          hours: entry.hoursWorked,
        });
      }
    }
  }
  
  // Get employee name (will be enriched)
  const employeeName = employeeId;
  
  return {
    employeeId,
    employeeName,
    period,
    totalHours,
    billableHours,
    nonBillableHours,
    projectBreakdown: Array.from(projectMap.entries()).map(([projectId, data]) => ({
      projectId,
      projectName: data.projectName,
      hours: data.hours,
    })),
  };
}

// ============================================================================
// BILLING AND INVOICING
// ============================================================================

export async function getInvoices(projectId?: string, clientId?: string): Promise<Invoice[]> {
  let query: any = db.collection('invoices');
  
  if (projectId) {
    query = query.where('projectId', '==', projectId);
  } else if (clientId) {
    query = query.where('clientId', '==', clientId);
  }
  
  const snapshot = await query.orderBy('issueDate', 'desc').get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    issueDate: fromTimestamp(doc.data().issueDate)!,
    dueDate: fromTimestamp(doc.data().dueDate)!,
    createdAt: fromTimestamp(doc.data().createdAt)!,
    updatedAt: fromTimestamp(doc.data().updatedAt)!,
    paidAt: fromTimestamp(doc.data().paidAt),
  } as Invoice));
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  const doc = await db.collection('invoices').doc(id).get();
  if (!doc.exists) return undefined;
  return {
    id: doc.id,
    ...doc.data(),
    issueDate: fromTimestamp(doc.data()!.issueDate)!,
    dueDate: fromTimestamp(doc.data()!.dueDate)!,
    createdAt: fromTimestamp(doc.data()!.createdAt)!,
    updatedAt: fromTimestamp(doc.data()!.updatedAt)!,
    paidAt: fromTimestamp(doc.data()!.paidAt),
  } as Invoice;
}

export async function createInvoice(invoice: InsertInvoice): Promise<Invoice> {
  const id = generateId();
  const now = Timestamp.now();
  
  // Generate invoice number
  const year = new Date().getFullYear();
  const snapshot = await db.collection('invoices')
    .where('invoiceNumber', '>=', `INV-${year}-`)
    .where('invoiceNumber', '<', `INV-${year + 1}-`)
    .get();
  const invoiceNumber = `INV-${year}-${String(snapshot.size + 1).padStart(4, '0')}`;
  
  const invoiceData = {
    ...invoice,
    invoiceNumber,
    status: "Draft",
    subtotal: 0,
    taxRate: invoice.taxRate || 0,
    taxAmount: 0,
    overheadRate: invoice.overheadRate || 0,
    overheadAmount: 0,
    gaRate: invoice.gaRate || 0,
    gaAmount: 0,
    total: 0,
    amountPaid: 0,
    issueDate: toTimestamp(invoice.issueDate)!,
    dueDate: toTimestamp(invoice.dueDate)!,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.collection('invoices').doc(id).set(invoiceData);
  return {
    id,
    ...invoiceData,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  } as Invoice;
}

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>
): Promise<Invoice | undefined> {
  const updateData: any = { ...updates, updatedAt: Timestamp.now() };
  if (updates.issueDate) updateData.issueDate = toTimestamp(updates.issueDate);
  if (updates.dueDate) updateData.dueDate = toTimestamp(updates.dueDate);
  if (updates.paidAt) updateData.paidAt = toTimestamp(updates.paidAt);
  await db.collection('invoices').doc(id).update(updateData);
  return getInvoice(id);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  // Delete all line items first
  const lineItems = await getInvoiceLineItems(id);
  for (const item of lineItems) {
    await deleteInvoiceLineItem(item.id);
  }
  await db.collection('invoices').doc(id).delete();
  return true;
}

export async function getInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
  const snapshot = await db.collection('invoiceLineItems')
    .where('invoiceId', '==', invoiceId)
    .orderBy('createdAt', 'asc')
    .get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: fromTimestamp(doc.data().createdAt)!,
  } as InvoiceLineItem));
}

export async function createInvoiceLineItem(item: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
  const id = generateId();
  const amount = item.quantity * item.unitPrice;
  const itemData = {
    ...item,
    amount,
    createdAt: Timestamp.now(),
  };
  
  await db.collection('invoiceLineItems').doc(id).set(itemData);
  
  // Recalculate invoice totals
  await recalculateInvoiceTotals(item.invoiceId);
  
  return {
    id,
    ...itemData,
    createdAt: new Date(),
  } as InvoiceLineItem;
}

export async function updateInvoiceLineItem(
  id: string,
  updates: Partial<InvoiceLineItem>
): Promise<InvoiceLineItem | undefined> {
  const doc = await db.collection('invoiceLineItems').doc(id).get();
  if (!doc.exists) return undefined;
  
  const currentData = doc.data()!;
  const newQuantity = updates.quantity !== undefined ? updates.quantity : currentData.quantity;
  const newUnitPrice = updates.unitPrice !== undefined ? updates.unitPrice : currentData.unitPrice;
  const amount = newQuantity * newUnitPrice;
  
  const updateData = { ...updates, amount };
  await db.collection('invoiceLineItems').doc(id).update(updateData);
  
  // Recalculate invoice totals
  await recalculateInvoiceTotals(currentData.invoiceId);
  
  const updatedDoc = await db.collection('invoiceLineItems').doc(id).get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
    createdAt: fromTimestamp(updatedDoc.data()!.createdAt)!,
  } as InvoiceLineItem;
}

export async function deleteInvoiceLineItem(id: string): Promise<boolean> {
  const doc = await db.collection('invoiceLineItems').doc(id).get();
  if (!doc.exists) return false;
  
  const invoiceId = doc.data()!.invoiceId;
  await db.collection('invoiceLineItems').doc(id).delete();
  
  // Recalculate invoice totals
  await recalculateInvoiceTotals(invoiceId);
  
  return true;
}

async function recalculateInvoiceTotals(invoiceId: string): Promise<void> {
  const invoice = await getInvoice(invoiceId);
  if (!invoice) return;
  
  const lineItems = await getInvoiceLineItems(invoiceId);
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const overheadAmount = (subtotal * invoice.overheadRate) / 100;
  const gaAmount = (subtotal * invoice.gaRate) / 100;
  const total = subtotal + taxAmount + overheadAmount + gaAmount;
  
  await updateInvoice(invoiceId, {
    subtotal,
    taxAmount,
    overheadAmount,
    gaAmount,
    total,
  });
}

// ============================================================================
// EXPENSE TRACKING
// ============================================================================

export async function getExpenses(
  employeeId?: string,
  projectId?: string,
  status?: string
): Promise<Expense[]> {
  let query: any = db.collection('expenses');
  
  if (employeeId) {
    query = query.where('employeeId', '==', employeeId);
  }
  
  if (projectId) {
    query = query.where('projectId', '==', projectId);
  }
  
  if (status) {
    query = query.where('status', '==', status);
  }
  
  const snapshot = await query.orderBy('date', 'desc').get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    date: fromTimestamp(doc.data().date)!,
    submittedAt: fromTimestamp(doc.data().submittedAt)!,
    approvedAt: fromTimestamp(doc.data().approvedAt),
    reimbursedAt: fromTimestamp(doc.data().reimbursedAt),
    createdAt: fromTimestamp(doc.data().createdAt)!,
    updatedAt: fromTimestamp(doc.data().updatedAt)!,
  } as Expense));
}

export async function getExpense(id: string): Promise<Expense | undefined> {
  const doc = await db.collection('expenses').doc(id).get();
  if (!doc.exists) return undefined;
  return {
    id: doc.id,
    ...doc.data(),
    date: fromTimestamp(doc.data()!.date)!,
    submittedAt: fromTimestamp(doc.data()!.submittedAt)!,
    approvedAt: fromTimestamp(doc.data()!.approvedAt),
    reimbursedAt: fromTimestamp(doc.data()!.reimbursedAt),
    createdAt: fromTimestamp(doc.data()!.createdAt)!,
    updatedAt: fromTimestamp(doc.data()!.updatedAt)!,
  } as Expense;
}

export async function createExpense(expense: InsertExpense): Promise<Expense> {
  const id = generateId();
  const now = Timestamp.now();
  const expenseData = {
    ...expense,
    status: "Pending",
    date: toTimestamp(expense.date)!,
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection('expenses').doc(id).set(expenseData);
  return {
    id,
    ...expenseData,
    date: expense.date,
    submittedAt: now.toDate(),
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  } as Expense;
}

export async function updateExpense(
  id: string,
  updates: Partial<Expense>
): Promise<Expense | undefined> {
  const updateData: any = { ...updates, updatedAt: Timestamp.now() };
  if (updates.date) updateData.date = toTimestamp(updates.date);
  if (updates.submittedAt) updateData.submittedAt = toTimestamp(updates.submittedAt);
  if (updates.approvedAt) updateData.approvedAt = toTimestamp(updates.approvedAt);
  if (updates.reimbursedAt) updateData.reimbursedAt = toTimestamp(updates.reimbursedAt);
  await db.collection('expenses').doc(id).update(updateData);
  return getExpense(id);
}

export async function deleteExpense(id: string): Promise<boolean> {
  await db.collection('expenses').doc(id).delete();
  return true;
}

export async function getExpenseSummary(projectId: string): Promise<ExpenseSummary> {
  const expenses = await getExpenses(undefined, projectId);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingReimbursements = expenses
    .filter(e => e.status === "Approved" && !e.reimbursedAt)
    .reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === "Approved").length;
  const rejectedExpenses = expenses.filter(e => e.status === "Rejected").length;
  
  // Group by category
  const categoryMap = new Map<string, { amount: number; count: number }>();
  for (const expense of expenses) {
    const existing = categoryMap.get(expense.category);
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      categoryMap.set(expense.category, { amount: expense.amount, count: 1 });
    }
  }
  
  return {
    projectId,
    projectName: projectId, // Will be enriched
    totalExpenses,
    categoryBreakdown: Array.from(categoryMap.entries()).map(([category, data]) => ({
      category: category as any,
      amount: data.amount,
      count: data.count,
    })),
    pendingReimbursements,
    approvedExpenses,
    rejectedExpenses,
  };
}

// ============================================================================
// RESOURCE MANAGEMENT
// ============================================================================

export async function getResourceAllocations(projectId?: string): Promise<ResourceAllocation[]> {
  let query: any = db.collection('resourceAllocations');
  
  if (projectId) {
    query = query.where('projectId', '==', projectId);
  }
  
  const snapshot = await query.orderBy('startDate', 'asc').get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    startDate: fromTimestamp(doc.data().startDate)!,
    endDate: fromTimestamp(doc.data().endDate),
    createdAt: fromTimestamp(doc.data().createdAt)!,
    updatedAt: fromTimestamp(doc.data().updatedAt)!,
  } as ResourceAllocation));
}

export async function createResourceAllocation(
  allocation: InsertResourceAllocation
): Promise<ResourceAllocation> {
  const id = generateId();
  const now = Timestamp.now();
  const allocationData = {
    ...allocation,
    startDate: toTimestamp(allocation.startDate)!,
    endDate: toTimestamp(allocation.endDate),
    createdAt: now,
    updatedAt: now,
  };
  await db.collection('resourceAllocations').doc(id).set(allocationData);
  return {
    id,
    ...allocationData,
    startDate: allocation.startDate,
    endDate: allocation.endDate,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  } as ResourceAllocation;
}

export async function updateResourceAllocation(
  id: string,
  updates: Partial<ResourceAllocation>
): Promise<ResourceAllocation | undefined> {
  const updateData: any = { ...updates, updatedAt: Timestamp.now() };
  if (updates.startDate) updateData.startDate = toTimestamp(updates.startDate);
  if (updates.endDate) updateData.endDate = toTimestamp(updates.endDate);
  await db.collection('resourceAllocations').doc(id).update(updateData);
  const doc = await db.collection('resourceAllocations').doc(id).get();
  if (!doc.exists) return undefined;
  return {
    id: doc.id,
    ...doc.data(),
    startDate: fromTimestamp(doc.data()!.startDate)!,
    endDate: fromTimestamp(doc.data()!.endDate),
    createdAt: fromTimestamp(doc.data()!.createdAt)!,
    updatedAt: fromTimestamp(doc.data()!.updatedAt)!,
  } as ResourceAllocation;
}

export async function deleteResourceAllocation(id: string): Promise<boolean> {
  await db.collection('resourceAllocations').doc(id).delete();
  return true;
}

export async function getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  const snapshot = await db.collection('projectMilestones')
    .where('projectId', '==', projectId)
    .orderBy('order', 'asc')
    .get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    dueDate: fromTimestamp(doc.data().dueDate)!,
    completedDate: fromTimestamp(doc.data().completedDate),
    createdAt: fromTimestamp(doc.data().createdAt)!,
    updatedAt: fromTimestamp(doc.data().updatedAt)!,
  } as ProjectMilestone));
}

export async function createProjectMilestone(
  milestone: InsertProjectMilestone
): Promise<ProjectMilestone> {
  const id = generateId();
  const now = Timestamp.now();
  const milestoneData = {
    ...milestone,
    isCompleted: false,
    dueDate: toTimestamp(milestone.dueDate)!,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection('projectMilestones').doc(id).set(milestoneData);
  return {
    id,
    ...milestoneData,
    isCompleted: false,
    dueDate: milestone.dueDate,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  } as ProjectMilestone;
}

export async function updateProjectMilestone(
  id: string,
  updates: Partial<ProjectMilestone>
): Promise<ProjectMilestone | undefined> {
  const updateData: any = { ...updates, updatedAt: Timestamp.now() };
  if (updates.dueDate) updateData.dueDate = toTimestamp(updates.dueDate);
  if (updates.completedDate) updateData.completedDate = toTimestamp(updates.completedDate);
  await db.collection('projectMilestones').doc(id).update(updateData);
  const doc = await db.collection('projectMilestones').doc(id).get();
  if (!doc.exists) return undefined;
  return {
    id: doc.id,
    ...doc.data(),
    dueDate: fromTimestamp(doc.data()!.dueDate)!,
    completedDate: fromTimestamp(doc.data()!.completedDate),
    createdAt: fromTimestamp(doc.data()!.createdAt)!,
    updatedAt: fromTimestamp(doc.data()!.updatedAt)!,
  } as ProjectMilestone;
}

export async function deleteProjectMilestone(id: string): Promise<boolean> {
  await db.collection('projectMilestones').doc(id).delete();
  return true;
}

// ============================================================================
// BUDGET TRACKING
// ============================================================================

export async function getBudgetCategories(projectId: string): Promise<BudgetCategory[]> {
  const snapshot = await db.collection('budgetCategories')
    .where('projectId', '==', projectId)
    .orderBy('category', 'asc')
    .get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: fromTimestamp(doc.data().createdAt)!,
    updatedAt: fromTimestamp(doc.data().updatedAt)!,
  } as BudgetCategory));
}

export async function createBudgetCategory(
  category: InsertBudgetCategory
): Promise<BudgetCategory> {
  const id = generateId();
  const now = Timestamp.now();
  const categoryData = {
    ...category,
    actualAmount: 0,
    variance: -category.budgetedAmount,
    createdAt: now,
    updatedAt: now,
  };
  await db.collection('budgetCategories').doc(id).set(categoryData);
  return {
    id,
    ...categoryData,
    createdAt: now.toDate(),
    updatedAt: now.toDate(),
  } as BudgetCategory;
}

export async function updateBudgetCategory(
  id: string,
  updates: Partial<BudgetCategory>
): Promise<BudgetCategory | undefined> {
  const doc = await db.collection('budgetCategories').doc(id).get();
  if (!doc.exists) return undefined;
  
  const currentData = doc.data()!;
  const budgeted = updates.budgetedAmount !== undefined ? updates.budgetedAmount : currentData.budgetedAmount;
  const actual = updates.actualAmount !== undefined ? updates.actualAmount : currentData.actualAmount;
  const variance = actual - budgeted;
  
  const updateData = { ...updates, variance, updatedAt: Timestamp.now() };
  await db.collection('budgetCategories').doc(id).update(updateData);
  
  const updatedDoc = await db.collection('budgetCategories').doc(id).get();
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
    createdAt: fromTimestamp(updatedDoc.data()!.createdAt)!,
    updatedAt: fromTimestamp(updatedDoc.data()!.updatedAt)!,
  } as BudgetCategory;
}

export async function deleteBudgetCategory(id: string): Promise<boolean> {
  await db.collection('budgetCategories').doc(id).delete();
  return true;
}
