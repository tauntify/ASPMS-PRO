# ASPMS - New Modules Documentation

## Overview

This document provides comprehensive information about the five new integrated modules in the Architecture Services Project Management System (ASPMS):

1. **Timesheet Management**
2. **Billing and Invoicing**
3. **Time and Expense Tracking**
4. **Resource Management, Allocation, and Planning**
5. **Financial Overview Dashboard**

---

## 1. Timesheet Management

### Purpose
Track employee working hours daily, differentiate between billable and non-billable hours, link hours to projects and tasks, and auto-sync with attendance data.

### Features
- **Daily Time Logging**: Employees log hours worked per day
- **Billable vs Non-Billable**: Categorize hours for accurate billing
- **Project/Task Linking**: Associate hours with specific projects and tasks
- **Status Workflow**: Draft → Submitted → Approved/Rejected
- **Weekly/Monthly Summaries**: Auto-generated summaries per employee
- **Attendance Integration**: Syncs with existing attendance system

### Database Schema

#### TimesheetEntry
```typescript
{
  id: string;
  employeeId: string;
  projectId?: string;
  taskId?: string;
  date: Date;
  hoursWorked: number;
  hourType: "Billable" | "Non-Billable";
  description?: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Get Timesheet Entries
```
GET /api/timesheets
Query Params:
  - employeeId (optional)
  - projectId (optional)
  - startDate (optional, ISO string)
  - endDate (optional, ISO string)
  - status (optional)
```

#### Create Timesheet Entry
```
POST /api/timesheets
Body: {
  employeeId: string;
  projectId?: string;
  taskId?: string;
  date: string (ISO);
  hoursWorked: number;
  hourType: "Billable" | "Non-Billable";
  description?: string;
}
```

#### Update Timesheet Entry
```
PATCH /api/timesheets/:id
Body: Partial<TimesheetEntry>
```

#### Submit Timesheet for Approval
```
POST /api/timesheets/:id/submit
```

#### Approve/Reject Timesheet (Principle only)
```
POST /api/timesheets/:id/approve
POST /api/timesheets/:id/reject
Body: { reason?: string }
```

#### Get Timesheet Summary
```
GET /api/timesheets/summary
Query Params:
  - employeeId (required)
  - period (required, format: YYYY-MM or YYYY-Www)
```

### Role-Based Access
- **Employees**: Can create, view, and submit their own timesheets
- **Principle**: Can view all timesheets, approve/reject submissions
- **Clients**: No access to timesheet data

---

## 2. Billing and Invoicing

### Purpose
Automatically generate client invoices based on logged time, project milestones, procurement costs, with tax, overhead, and GA calculations. Export to PDF format.

### Features
- **Auto-Invoice Generation**: Based on timesheet data and milestones
- **Line Item Management**: Detailed breakdown of services/materials
- **Tax Calculation**: Configurable tax rates
- **Overhead & GA Costs**: Automatic calculation of indirect costs
- **Invoice Status Tracking**: Draft → Sent → Paid/Overdue
- **PDF Export**: Professional invoice documents
- **Payment Tracking**: Record partial and full payments

### Database Schema

#### Invoice
```typescript
{
  id: string;
  invoiceNumber: string; // Auto-generated: INV-YYYY-0001
  projectId: string;
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: "Net 15" | "Net 30" | "Net 45" | "Net 60" | "Due on Receipt";
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
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
```

#### InvoiceLineItem
```typescript
{
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // Auto-calculated
  category: "Labor" | "Materials" | "Milestone" | "Other";
  createdAt: Date;
}
```

### API Endpoints

#### Get Invoices
```
GET /api/invoices
Query Params:
  - projectId (optional)
  - clientId (optional)
  - status (optional)
```

#### Create Invoice
```
POST /api/invoices
Body: {
  projectId: string;
  clientId: string;
  issueDate: string (ISO);
  dueDate: string (ISO);
  paymentTerms: string;
  taxRate?: number;
  overheadRate?: number;
  gaRate?: number;
  notes?: string;
}
```

#### Add Line Item to Invoice
```
POST /api/invoices/:invoiceId/items
Body: {
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
}
```

#### Generate Invoice from Timesheet
```
POST /api/invoices/generate-from-timesheet
Body: {
  projectId: string;
  startDate: string (ISO);
  endDate: string (ISO);
  hourlyRate: number;
}
```

#### Update Invoice Status
```
PATCH /api/invoices/:id/status
Body: { status: string }
```

#### Record Payment
```
POST /api/invoices/:id/payment
Body: {
  amount: number;
  paymentDate: string (ISO);
  paymentMethod?: string;
}
```

#### Export Invoice to PDF
```
GET /api/invoices/:id/pdf
```

### Role-Based Access
- **Principle**: Full access to all invoices
- **Clients**: Can view invoices for their projects only
- **Employees**: No access to invoices
- **Procurement**: Read-only access

---

## 3. Time and Expense Tracking

### Purpose
Allow employees to record project-related expenses, track approval workflows, auto-calculate reimbursements, and integrate with salary calculations.

### Features
- **Expense Recording**: Log expenses with categories and receipts
- **Receipt Upload**: Attach digital receipts/photos
- **Approval Workflow**: Pending → Approved/Rejected → Reimbursed
- **Reimbursement Tracking**: Track payment status
- **Salary Integration**: Deduct advances or add reimbursements
- **Project-wise Expense Reports**: Visual breakdown by category
- **Budget Alerts**: Warning when expenses exceed budget

### Database Schema

#### Expense
```typescript
{
  id: string;
  employeeId: string;
  projectId: string;
  category: "Fuel" | "Materials" | "Site Visit" | "Transportation" | 
            "Equipment" | "Meals" | "Accommodation" | "Other";
  amount: number;
  date: Date;
  description: string;
  receiptUrl?: string;
  status: "Pending" | "Approved" | "Rejected" | "Reimbursed";
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  reimbursedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Get Expenses
```
GET /api/expenses
Query Params:
  - employeeId (optional)
  - projectId (optional)
  - status (optional)
  - startDate (optional, ISO string)
  - endDate (optional, ISO string)
```

#### Create Expense
```
POST /api/expenses
Body: {
  employeeId: string;
  projectId: string;
  category: string;
  amount: number;
  date: string (ISO);
  description: string;
  receiptUrl?: string;
}
```

#### Upload Receipt
```
POST /api/expenses/upload-receipt
Body: FormData with file
Response: { url: string }
```

#### Approve/Reject Expense (Principle only)
```
POST /api/expenses/:id/approve
POST /api/expenses/:id/reject
Body: { reason?: string }
```

#### Mark as Reimbursed (Principle only)
```
POST /api/expenses/:id/reimburse
Body: { reimbursementDate: string (ISO) }
```

#### Get Expense Summary
```
GET /api/expenses/summary
Query Params:
  - projectId (required)
```

### Role-Based Access
- **Employees**: Create and view their own expenses
- **Principle**: View all expenses, approve/reject/reimburse
- **Clients**: No access to expense data
- **Procurement**: Read-only access for project expenses

---

## 4. Resource Management, Allocation, and Planning

### Purpose
Provide real-time resource allocation dashboard, display workload per employee, suggest optimal resource distribution, and enable Gantt-style timeline for project scheduling.

### Features
- **Resource Allocation Dashboard**: Real-time view of all resources
- **Employee Workload Tracking**: Percentage allocation per project
- **Material/Equipment Tracking**: Monitor usage and availability
- **Budget Allocation**: Track budget distribution
- **Project Milestones**: Define and track key milestones
- **Gantt Timeline**: Visual project scheduling
- **Optimization Suggestions**: AI-powered resource distribution
- **Conflict Detection**: Alert when resources are over-allocated

### Database Schema

#### ResourceAllocation
```typescript
{
  id: string;
  projectId: string;
  resourceType: "Employee" | "Equipment" | "Material" | "Budget";
  resourceId: string;
  resourceName: string;
  allocationPercentage: number; // 0-100
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### ProjectMilestone
```typescript
{
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
```

### API Endpoints

#### Get Resource Allocations
```
GET /api/resources
Query Params:
  - projectId (optional)
  - resourceType (optional)
  - employeeId (optional)
```

#### Create Resource Allocation
```
POST /api/resources
Body: {
  projectId: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  allocationPercentage: number;
  startDate: string (ISO);
  endDate?: string (ISO);
  notes?: string;
}
```

#### Get Employee Workload
```
GET /api/resources/workload/:employeeId
Response: {
  employeeId: string;
  totalAllocation: number;
  allocations: ResourceAllocation[];
  availableCapacity: number;
}
```

#### Get Project Milestones
```
GET /api/projects/:projectId/milestones
```

#### Create Milestone
```
POST /api/projects/:projectId/milestones
Body: {
  title: string;
  description?: string;
  dueDate: string (ISO);
  order: number;
}
```

#### Mark Milestone Complete
```
POST /api/milestones/:id/complete
Body: { completedDate: string (ISO) }
```

#### Get Resource Optimization Suggestions
```
GET /api/resources/optimize
Query Params:
  - projectId (optional)
Response: {
  suggestions: Array<{
    type: string;
    description: string;
    impact: string;
  }>;
}
```

### Role-Based Access
- **Principle**: Full access to all resource management
- **Employees**: View their own allocations only
- **Clients**: View resource allocation for their projects
- **Procurement**: View material/equipment allocations

---

## 5. Financial Overview Dashboard

### Purpose
Provide a unified view showing real-time budgeting, cost tracking, overhead, GA, fringe, profitability metrics, cost comparisons, profit/loss summaries, and live charts for management visibility.

### Features
- **Real-time Budget Tracking**: Live updates on budget vs. actual
- **Cost Breakdown**: Labor, materials, procurement, expenses
- **Profitability Analysis**: Gross and net profit calculations
- **Overhead & GA Tracking**: Automatic calculation and visualization
- **Fringe Benefits**: Employee benefit cost tracking
- **Project Comparison**: Compare estimated vs. actual costs
- **Profit/Loss Summary**: Per project and per department
- **Live Charts**: Interactive visualizations
- **Trend Analysis**: Historical performance tracking
- **Cash Flow Overview**: Receivables and payables

### Data Structures

#### ProjectFinancialSummary
```typescript
{
  projectId: string;
  projectName: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  laborCost: number;
  materialCost: number;
  procurementCost: number;
  expenseCost: number;
  contractValue: number;
  invoiced: number;
  received: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  overheadCost: number;
  gaCost: number;
  fringeCost: number;
  workCompleted: number; // percentage
  budgetUtilized: number; // percentage
}
```

#### FinancialMetrics
```typescript
{
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  totalOverhead: number;
  totalGA: number;
  totalFringe: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectValue: number;
  averageMargin: number;
  accountsReceivable: number;
  accountsPayable: number;
  periodStart: Date;
  periodEnd: Date;
}
```

### API Endpoints

#### Get Financial Dashboard
```
GET /api/financial/dashboard
Query Params:
  - periodStart (optional, ISO string)
  - periodEnd (optional, ISO string)
Response: FinancialMetrics
```

#### Get Project Financial Summary
```
GET /api/financial/projects/:projectId
Response: ProjectFinancialSummary
```

#### Get All Project Financials
```
GET /api/financial/projects
Response: ProjectFinancialSummary[]
```

#### Get Department Summary
```
GET /api/financial/departments
Response: DepartmentFinancialSummary[]
```

#### Get Budget vs Actual Report
```
GET /api/financial/budget-report
Query Params:
  - projectId (optional)
Response: {
  categories: Array<{
    category: string;
    budgeted: number;
    actual: number;
    variance: number;
  }>;
}
```

#### Get Profit/Loss Statement
```
GET /api/financial/profit-loss
Query Params:
  - periodStart (ISO string)
  - periodEnd (ISO string)
  - projectId (optional)
```

#### Get Cash Flow Report
```
GET /api/financial/cash-flow
Query Params:
  - periodStart (ISO string)
  - periodEnd (ISO string)
```

### Role-Based Access
- **Principle**: Full access to all financial data
- **Clients**: View financial data for their projects only (limited)
- **Employees**: No access to financial dashboard
- **Procurement**: View procurement-related financials only

---

## Integration Points

### Attendance ↔ Timesheet
- Attendance records automatically create draft timesheet entries
- Timesheet hours sync with attendance for validation
- Absent days show zero hours in timesheet

### Timesheet ↔ Billing
- Billable hours from timesheets populate invoice line items
- Hourly rates applied from employee/project settings
- Automated invoice generation based on timesheet approval

### Expenses ↔ Salary
- Approved expenses added to next salary as reimbursements
- Expense advances deducted from salary
- Integration with existing salary calculation system

### Resource Allocation ↔ Tasks
- Task assignments update resource allocation percentages
- Resource conflicts prevent task assignment
- Task completion updates resource availability

### All Modules ↔ Financial Dashboard
- Real-time data aggregation from all modules
- Automatic calculation of profitability metrics
- Live updates as transactions occur

---

## Firestore Collections

New collections to be created:

1. **timesheetEntries** - Timesheet data
2. **invoices** - Invoice headers
3. **invoiceLineItems** - Invoice detail lines
4. **expenses** - Expense records
5. **resourceAllocations** - Resource allocation data
6. **projectMilestones** - Project milestone tracking
7. **budgetCategories** - Budget tracking by category

### Required Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "timesheetEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "timesheetEntries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "invoices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "issueDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "invoices",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "clientId", "order": "ASCENDING" },
        { "fieldPath": "issueDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "expenses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "expenses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "resourceAllocations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "projectMilestones",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "budgetCategories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Frontend Components Structure

### Page Components
1. **TimesheetManagement.tsx** - Main timesheet page
2. **BillingInvoicing.tsx** - Invoice management page
3. **ExpenseTracking.tsx** - Expense management page
4. **ResourcePlanning.tsx** - Resource allocation dashboard
5. **FinancialDashboard.tsx** - Comprehensive financial overview

### Reusable Components
1. **TimesheetEntryForm.tsx** - Form for logging hours
2. **InvoiceGenerator.tsx** - Invoice creation wizard
3. **ExpenseForm.tsx** - Expense submission form
4. **ResourceGanttChart.tsx** - Gantt timeline visualization
5. **FinancialChart.tsx** - Financial data visualization
6. **BudgetProgressBar.tsx** - Budget utilization indicator
7. **ProfitabilityCard.tsx** - Profitability metrics card

---

## Implementation Status

✅ **Completed:**
- Schema design for all modules
- Storage layer implementation
- API endpoint design documentation

🔄 **In Progress:**
- Backend API route implementation
- Frontend component development
- Firestore index creation

⏳ **Pending:**
- PDF generation for invoices
- Advanced financial analytics
- Mobile responsive optimization
- Automated testing

---

## Usage Examples

### Example 1: Log Daily Hours
```typescript
// Employee logs 8 hours of billable work on a project
const timesheet = await fetch('/api/timesheets', {
  method: 'POST',
  body: JSON.stringify({
    employeeId: 'emp123',
    projectId: 'proj456',
    taskId: 'task789',
    date: '2025-10-26',
    hoursWorked: 8,
    hourType: 'Billable',
    description: 'Worked on architectural drawings'
  })
});
```

### Example 2: Generate Invoice from Timesheet
```typescript
// Automatically generate invoice from approved timesheets
const invoice = await fetch('/api/invoices/generate-from-timesheet', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 'proj456',
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    hourlyRate: 5000 // PKR per hour
  })
});
```

### Example 3: Submit Expense with Receipt
```typescript
// Employee submits expense with receipt
const formData = new FormData();
formData.append('receipt', receiptFile);
const uploadResponse = await fetch('/api/expenses/upload-receipt', {
  method: 'POST',
  body: formData
});
const { url } = await uploadResponse.json();

const expense = await fetch('/api/expenses', {
  method: 'POST',
  body: JSON.stringify({
    employeeId: 'emp123',
    projectId: 'proj456',
    category: 'Fuel',
    amount: 5000,
    date: '2025-10-26',
    description: 'Site visit transportation',
    receiptUrl: url
  })
});
```

### Example 4: Allocate Resources to Project
```typescript
// Principle allocates employee to project at 50% capacity
const allocation = await fetch('/api/resources', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 'proj456',
    resourceType: 'Employee',
    resourceId: 'emp123',
    resourceName: 'John Doe',
    allocationPercentage: 50,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    notes: 'Lead architect for design phase'
  })
});
```

---

## Best Practices

1. **Timesheet Management**
   - Log hours daily for accuracy
   - Always link to projects/tasks when possible
   - Submit timesheets weekly for timely approval

2. **Billing and Invoicing**
   - Generate invoices only after timesheet approval
   - Include detailed line item descriptions
   - Send invoices promptly upon project milestones

3. **Expense Tracking**
   - Always attach receipts for amounts over PKR 1000
   - Submit expenses within 7 days of incurring them
   - Provide clear descriptions for all expenses

4. **Resource Management**
   - Keep allocation percentages updated
   - Don't over-allocate resources (>100%)
   - Review workload distribution weekly

5. **Financial Dashboard**
   - Review dashboard daily for anomalies
   - Compare budget vs. actual monthly
   - Track profitability trends by project

---

## Support and Troubleshooting

### Common Issues

**Issue**: Timesheet not syncing with attendance
- **Solution**: Ensure attendance is marked before logging timesheet hours

**Issue**: Invoice total not calculating correctly
- **Solution**: Check tax, overhead, and GA rates are set properly

**Issue**: Expense reimbursement not showing in salary
- **Solution**: Verify expense status is "Approved" before salary generation

**Issue**: Resource over-allocation warning
- **Solution**: Adjust allocation percentages to sum ≤ 100%

### Contact
For technical support or feature requests, contact the development team at: support@arka.pk

---

## Changelog

### Version 1.0.0 (2025-10-26)
- Initial integration of all five modules
- Complete backend storage layer
- Comprehensive API documentation
- Role-based access control implementation

---

*Last Updated: October 26, 2025*
