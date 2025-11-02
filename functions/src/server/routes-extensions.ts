import type { Express } from "express";
import { requireAuth, requireRole } from "./auth";
import {
  insertTimesheetEntrySchema,
  insertInvoiceSchema,
  insertInvoiceLineItemSchema,
  insertExpenseSchema,
  insertResourceAllocationSchema,
  insertProjectMilestoneSchema,
  insertBudgetCategorySchema,
} from "../shared/schema-extensions";
import * as storageExt from "./storage-extensions";
import { z } from "zod";

export function registerExtensionRoutes(app: Express): void {
  // ============================================================================
  // TIMESHEET MANAGEMENT ROUTES
  // ============================================================================

  // Get timesheet entries
  app.get("/api/timesheets", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { employeeId, projectId, startDate, endDate, status } = req.query;
      
      // Role-based filtering
      let queryEmployeeId = employeeId as string | undefined;
      if (user.role === "employee") {
        queryEmployeeId = user.id; // Employees see only their data
      }
      
      const entries = await storageExt.getTimesheetEntries(
        queryEmployeeId,
        projectId as string | undefined,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      // Filter by status if provided
      const filteredEntries = status 
        ? entries.filter(e => e.status === status)
        : entries;
      
      res.json(filteredEntries);
    } catch (error) {
      console.error("Failed to fetch timesheets:", error);
      res.status(500).json({ error: "Failed to fetch timesheets" });
    }
  });

  // Get single timesheet entry
  app.get("/api/timesheets/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const entry = await storageExt.getTimesheetEntry(req.params.id);
      
      if (!entry) {
        return res.status(404).json({ error: "Timesheet entry not found" });
      }
      
      // Employees can only view their own entries
      if (user.role === "employee" && entry.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Failed to fetch timesheet entry:", error);
      res.status(500).json({ error: "Failed to fetch timesheet entry" });
    }
  });

  // Create timesheet entry
  app.post("/api/timesheets", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const parsed = insertTimesheetEntrySchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid timesheet data", details: parsed.error });
      }
      
      // Employees can only create their own entries
      if (user.role === "employee" && parsed.data.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden: You can only create your own timesheet entries" });
      }
      
      const entry = await storageExt.createTimesheetEntry(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Failed to create timesheet entry:", error);
      res.status(500).json({ error: "Failed to create timesheet entry" });
    }
  });

  // Update timesheet entry
  app.patch("/api/timesheets/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const entry = await storageExt.getTimesheetEntry(req.params.id);
      
      if (!entry) {
        return res.status(404).json({ error: "Timesheet entry not found" });
      }
      
      // Only allow updates to own entries or by principle
      if (user.role === "employee" && entry.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Employees cannot approve their own timesheets
      if (user.role === "employee" && req.body.status === "Approved") {
        return res.status(403).json({ error: "Forbidden: Cannot approve your own timesheet" });
      }
      
      const updated = await storageExt.updateTimesheetEntry(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update timesheet entry:", error);
      res.status(500).json({ error: "Failed to update timesheet entry" });
    }
  });

  // Submit timesheet for approval
  app.post("/api/timesheets/:id/submit", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const entry = await storageExt.getTimesheetEntry(req.params.id);
      
      if (!entry) {
        return res.status(404).json({ error: "Timesheet entry not found" });
      }
      
      if (user.role === "employee" && entry.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updated = await storageExt.updateTimesheetEntry(req.params.id, {
        status: "Submitted",
        submittedAt: new Date(),
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to submit timesheet:", error);
      res.status(500).json({ error: "Failed to submit timesheet" });
    }
  });

  // Approve timesheet (Principle only)
  app.post("/api/timesheets/:id/approve", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateTimesheetEntry(req.params.id, {
        status: "Approved",
        approvedBy: req.user!.id,
        approvedAt: new Date(),
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Timesheet entry not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to approve timesheet:", error);
      res.status(500).json({ error: "Failed to approve timesheet" });
    }
  });

  // Reject timesheet (Principle only)
  app.post("/api/timesheets/:id/reject", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { reason } = req.body;
      
      const updated = await storageExt.updateTimesheetEntry(req.params.id, {
        status: "Rejected",
        rejectionReason: reason,
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Timesheet entry not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to reject timesheet:", error);
      res.status(500).json({ error: "Failed to reject timesheet" });
    }
  });

  // Delete timesheet entry
  app.delete("/api/timesheets/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const entry = await storageExt.getTimesheetEntry(req.params.id);
      
      if (!entry) {
        return res.status(404).json({ error: "Timesheet entry not found" });
      }
      
      // Only allow deletion of own entries or by principle
      if (user.role === "employee" && entry.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Cannot delete approved entries
      if (entry.status === "Approved" && user.role !== "principle") {
        return res.status(403).json({ error: "Cannot delete approved timesheet entries" });
      }
      
      await storageExt.deleteTimesheetEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete timesheet entry:", error);
      res.status(500).json({ error: "Failed to delete timesheet entry" });
    }
  });

  // Get timesheet summary
  app.get("/api/timesheets/summary/:employeeId", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { employeeId } = req.params;
      const { period } = req.query;
      
      if (!period) {
        return res.status(400).json({ error: "period query parameter is required (format: YYYY-MM or YYYY-Www)" });
      }
      
      // Employees can only view their own summary
      if (user.role === "employee" && employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const summary = await storageExt.getTimesheetSummary(employeeId, period as string);
      res.json(summary);
    } catch (error) {
      console.error("Failed to fetch timesheet summary:", error);
      res.status(500).json({ error: "Failed to fetch timesheet summary" });
    }
  });

  // ============================================================================
  // BILLING AND INVOICING ROUTES
  // ============================================================================

  // Get invoices
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { projectId, clientId, status } = req.query;
      
      // Clients can only see their own invoices
      let queryClientId = clientId as string | undefined;
      if (user.role === "client") {
        // Find client record for this user
        // For now, we'll filter after fetching
        queryClientId = undefined;
      }
      
      const invoices = await storageExt.getInvoices(
        projectId as string | undefined,
        queryClientId
      );
      
      // Filter by status if provided
      let filteredInvoices = status 
        ? invoices.filter(inv => inv.status === status)
        : invoices;
      
      // Filter for clients (they only see invoices where clientId matches their user ID)
      if (user.role === "client") {
        filteredInvoices = filteredInvoices.filter(inv => inv.clientId === user.id);
      }
      
      res.json(filteredInvoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get single invoice
  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const invoice = await storageExt.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Clients can only view their own invoices
      if (user.role === "client" && invoice.clientId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Get line items
      const lineItems = await storageExt.getInvoiceLineItems(req.params.id);
      
      res.json({ ...invoice, lineItems });
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Create invoice (Principle only)
  app.post("/api/invoices", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertInvoiceSchema.safeParse({
        ...req.body,
        createdBy: req.user!.id,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid invoice data", details: parsed.error });
      }
      
      const invoice = await storageExt.createInvoice(parsed.data);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Update invoice (Principle only)
  app.patch("/api/invoices/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateInvoice(req.params.id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  });

  // Delete invoice (Principle only)
  app.delete("/api/invoices/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storageExt.deleteInvoice(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // Get invoice line items
  app.get("/api/invoices/:invoiceId/items", requireAuth, async (req, res) => {
    try {
      const items = await storageExt.getInvoiceLineItems(req.params.invoiceId);
      res.json(items);
    } catch (error) {
      console.error("Failed to fetch invoice line items:", error);
      res.status(500).json({ error: "Failed to fetch invoice line items" });
    }
  });

  // Add line item to invoice (Principle only)
  app.post("/api/invoices/:invoiceId/items", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertInvoiceLineItemSchema.safeParse({
        ...req.body,
        invoiceId: req.params.invoiceId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid line item data", details: parsed.error });
      }
      
      const item = await storageExt.createInvoiceLineItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Failed to create invoice line item:", error);
      res.status(500).json({ error: "Failed to create invoice line item" });
    }
  });

  // Update line item (Principle only)
  app.patch("/api/invoices/:invoiceId/items/:itemId", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateInvoiceLineItem(req.params.itemId, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Line item not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update line item:", error);
      res.status(500).json({ error: "Failed to update line item" });
    }
  });

  // Delete line item (Principle only)
  app.delete("/api/invoices/:invoiceId/items/:itemId", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storageExt.deleteInvoiceLineItem(req.params.itemId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Line item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete line item:", error);
      res.status(500).json({ error: "Failed to delete line item" });
    }
  });

  // Update invoice status (Principle only)
  app.patch("/api/invoices/:id/status", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!["Draft", "Sent", "Paid", "Overdue", "Cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updates: any = { status };
      if (status === "Paid") {
        updates.paidAt = new Date();
      }
      
      const updated = await storageExt.updateInvoice(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update invoice status:", error);
      res.status(500).json({ error: "Failed to update invoice status" });
    }
  });

  // Record invoice payment (Principle only)
  app.post("/api/invoices/:id/payment", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { amount, paymentDate } = req.body;
      const invoice = await storageExt.getInvoice(req.params.id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      const newAmountPaid = invoice.amountPaid + amount;
      const isPaid = newAmountPaid >= invoice.total;
      
      const updated = await storageExt.updateInvoice(req.params.id, {
        amountPaid: newAmountPaid,
        status: isPaid ? "Paid" : invoice.status,
        paidAt: isPaid ? new Date(paymentDate) : invoice.paidAt,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to record payment:", error);
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  // ============================================================================
  // EXPENSE TRACKING ROUTES
  // ============================================================================

  // Get expenses
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { employeeId, projectId, status } = req.query;
      
      // Role-based filtering
      let queryEmployeeId = employeeId as string | undefined;
      if (user.role === "employee") {
        queryEmployeeId = user.id; // Employees see only their expenses
      }
      
      const expenses = await storageExt.getExpenses(
        queryEmployeeId,
        projectId as string | undefined,
        status as string | undefined
      );
      
      res.json(expenses);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  // Get single expense
  app.get("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const expense = await storageExt.getExpense(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      // Employees can only view their own expenses
      if (user.role === "employee" && expense.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Failed to fetch expense:", error);
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  // Create expense
  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const parsed = insertExpenseSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid expense data", details: parsed.error });
      }
      
      // Employees can only create their own expenses
      if (user.role === "employee" && parsed.data.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden: You can only create your own expenses" });
      }
      
      const expense = await storageExt.createExpense(parsed.data);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Failed to create expense:", error);
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  // Update expense
  app.patch("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const expense = await storageExt.getExpense(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      // Only allow updates to own expenses (for employees) or by principle
      if (user.role === "employee" && expense.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Employees cannot change status to Approved or Reimbursed
      if (user.role === "employee" && 
          (req.body.status === "Approved" || req.body.status === "Reimbursed")) {
        return res.status(403).json({ error: "Forbidden: Cannot approve or reimburse your own expenses" });
      }
      
      const updated = await storageExt.updateExpense(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update expense:", error);
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  // Approve expense (Principle only)
  app.post("/api/expenses/:id/approve", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateExpense(req.params.id, {
        status: "Approved",
        approvedBy: req.user!.id,
        approvedAt: new Date(),
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to approve expense:", error);
      res.status(500).json({ error: "Failed to approve expense" });
    }
  });

  // Reject expense (Principle only)
  app.post("/api/expenses/:id/reject", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { reason } = req.body;
      
      const updated = await storageExt.updateExpense(req.params.id, {
        status: "Rejected",
        rejectionReason: reason,
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to reject expense:", error);
      res.status(500).json({ error: "Failed to reject expense" });
    }
  });

  // Mark expense as reimbursed (Principle only)
  app.post("/api/expenses/:id/reimburse", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { reimbursementDate } = req.body;
      
      const updated = await storageExt.updateExpense(req.params.id, {
        status: "Reimbursed",
        reimbursedAt: reimbursementDate ? new Date(reimbursementDate) : new Date(),
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to mark expense as reimbursed:", error);
      res.status(500).json({ error: "Failed to mark expense as reimbursed" });
    }
  });

  // Delete expense
  app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const expense = await storageExt.getExpense(req.params.id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      // Only allow deletion of own expenses or by principle
      if (user.role === "employee" && expense.employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Cannot delete approved/reimbursed expenses
      if ((expense.status === "Approved" || expense.status === "Reimbursed") && 
          user.role !== "principle") {
        return res.status(403).json({ error: "Cannot delete approved or reimbursed expenses" });
      }
      
      await storageExt.deleteExpense(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Get expense summary for a project
  app.get("/api/expenses/summary/:projectId", requireAuth, async (req, res) => {
    try {
      const summary = await storageExt.getExpenseSummary(req.params.projectId);
      res.json(summary);
    } catch (error) {
      console.error("Failed to fetch expense summary:", error);
      res.status(500).json({ error: "Failed to fetch expense summary" });
    }
  });

  // ============================================================================
  // RESOURCE MANAGEMENT ROUTES
  // ============================================================================

  // Get resource allocations
  app.get("/api/resources", requireAuth, async (req, res) => {
    try {
      const { projectId } = req.query;
      const allocations = await storageExt.getResourceAllocations(projectId as string | undefined);
      res.json(allocations);
    } catch (error) {
      console.error("Failed to fetch resource allocations:", error);
      res.status(500).json({ error: "Failed to fetch resource allocations" });
    }
  });

  // Create resource allocation (Principle only)
  app.post("/api/resources", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertResourceAllocationSchema.safeParse({
        ...req.body,
        createdBy: req.user!.id,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid allocation data", details: parsed.error });
      }
      
      const allocation = await storageExt.createResourceAllocation(parsed.data);
      res.status(201).json(allocation);
    } catch (error) {
      console.error("Failed to create resource allocation:", error);
      res.status(500).json({ error: "Failed to create resource allocation" });
    }
  });

  // Update resource allocation (Principle only)
  app.patch("/api/resources/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateResourceAllocation(req.params.id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Resource allocation not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update resource allocation:", error);
      res.status(500).json({ error: "Failed to update resource allocation" });
    }
  });

  // Delete resource allocation (Principle only)
  app.delete("/api/resources/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storageExt.deleteResourceAllocation(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Resource allocation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete resource allocation:", error);
      res.status(500).json({ error: "Failed to delete resource allocation" });
    }
  });

  // Get employee workload
  app.get("/api/resources/workload/:employeeId", requireAuth, async (req, res) => {
    try {
      const allocations = await storageExt.getResourceAllocations();
      const employeeAllocations = allocations.filter(
        a => a.resourceType === "Employee" && a.resourceId === req.params.employeeId
      );
      
      // Calculate total allocation (only for current/active allocations)
      const now = new Date();
      const activeAllocations = employeeAllocations.filter(a => {
        const isActive = a.startDate <= now && (!a.endDate || a.endDate >= now);
        return isActive;
      });
      
      const totalAllocation = activeAllocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
      const availableCapacity = Math.max(0, 100 - totalAllocation);
      
      res.json({
        employeeId: req.params.employeeId,
        totalAllocation,
        allocations: employeeAllocations,
        availableCapacity,
      });
    } catch (error) {
      console.error("Failed to fetch employee workload:", error);
      res.status(500).json({ error: "Failed to fetch employee workload" });
    }
  });

  // ============================================================================
  // PROJECT MILESTONE ROUTES
  // ============================================================================

  // Get project milestones
  app.get("/api/projects/:projectId/milestones", requireAuth, async (req, res) => {
    try {
      const milestones = await storageExt.getProjectMilestones(req.params.projectId);
      res.json(milestones);
    } catch (error) {
      console.error("Failed to fetch project milestones:", error);
      res.status(500).json({ error: "Failed to fetch project milestones" });
    }
  });

  // Create milestone (Principle only)
  app.post("/api/projects/:projectId/milestones", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertProjectMilestoneSchema.safeParse({
        ...req.body,
        projectId: req.params.projectId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid milestone data", details: parsed.error });
      }
      
      const milestone = await storageExt.createProjectMilestone(parsed.data);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Failed to create milestone:", error);
      res.status(500).json({ error: "Failed to create milestone" });
    }
  });

  // Update milestone (Principle only)
  app.patch("/api/milestones/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateProjectMilestone(req.params.id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update milestone:", error);
      res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  // Mark milestone as complete (Principle only)
  app.post("/api/milestones/:id/complete", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { completedDate } = req.body;
      
      const updated = await storageExt.updateProjectMilestone(req.params.id, {
        isCompleted: true,
        completedDate: completedDate ? new Date(completedDate) : new Date(),
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to complete milestone:", error);
      res.status(500).json({ error: "Failed to complete milestone" });
    }
  });

  // Delete milestone (Principle only)
  app.delete("/api/milestones/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storageExt.deleteProjectMilestone(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      res.status(500).json({ error: "Failed to delete milestone" });
    }
  });

  // ============================================================================
  // BUDGET TRACKING ROUTES
  // ============================================================================

  // Get budget categories for a project
  app.get("/api/projects/:projectId/budget", requireAuth, async (req, res) => {
    try {
      const categories = await storageExt.getBudgetCategories(req.params.projectId);
      res.json(categories);
    } catch (error) {
      console.error("Failed to fetch budget categories:", error);
      res.status(500).json({ error: "Failed to fetch budget categories" });
    }
  });

  // Create budget category (Principle only)
  app.post("/api/projects/:projectId/budget", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertBudgetCategorySchema.safeParse({
        ...req.body,
        projectId: req.params.projectId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid budget category data", details: parsed.error });
      }
      
      const category = await storageExt.createBudgetCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Failed to create budget category:", error);
      res.status(500).json({ error: "Failed to create budget category" });
    }
  });

  // Update budget category (Principle only)
  app.patch("/api/budget/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updated = await storageExt.updateBudgetCategory(req.params.id, req.body);
      
      if (!updated) {
        return res.status(404).json({ error: "Budget category not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Failed to update budget category:", error);
      res.status(500).json({ error: "Failed to update budget category" });
    }
  });

  // Delete budget category (Principle only)
  app.delete("/api/budget/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storageExt.deleteBudgetCategory(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Budget category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete budget category:", error);
      res.status(500).json({ error: "Failed to delete budget category" });
    }
  });
}
