import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  updateProjectSchema, 
  insertDivisionSchema, 
  insertItemSchema, 
  updateDivisionSchema, 
  updateItemSchema,
  insertUserSchema,
  insertEmployeeSchema,
  insertTaskSchema,
  insertProcurementItemSchema,
  insertSalarySchema,
  insertAttendanceSchema,
  insertProjectAssignmentSchema,
  insertCommentSchema,
  insertProjectFinancialsSchema,
} from "@shared/schema";
import { requireAuth, requireRole, attachUser, hashPassword, verifyPassword } from "./auth";
import { z } from "zod";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";

export async function registerRoutes(app: Express): Promise<Server> {
  // Attach user middleware to all routes
  app.use(attachUser);

  // Project routes - requireAuth for all authenticated users
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      let projects = await storage.getProjects();
      
      // Filter by role - clients and employees only see assigned projects
      if (user.role === "client" || user.role === "employee") {
        const assignments = await storage.getProjectAssignments(user.id);
        const assignedProjectIds = assignments.map(a => a.projectId);
        projects = projects.filter(p => assignedProjectIds.includes(p.id));
      }
      // Principle and procurement see all projects
      
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid project data", details: parsed.error });
      }

      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = updateProjectSchema.safeParse({ ...req.body, id: req.params.id });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid project data", details: parsed.error });
      }

      const project = await storage.updateProject(parsed.data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Division routes - requireAuth for all authenticated users
  app.get("/api/divisions", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.query.projectId as string | undefined;
      let divisions = await storage.getDivisions(projectId);
      
      // Filter by role - clients and employees only see divisions for assigned projects
      if (user.role === "client" || user.role === "employee") {
        const assignments = await storage.getProjectAssignments(user.id);
        const assignedProjectIds = assignments.map(a => a.projectId);
        divisions = divisions.filter(d => assignedProjectIds.includes(d.projectId));
      }
      
      res.json(divisions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch divisions" });
    }
  });

  app.post("/api/divisions", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertDivisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid division data", details: parsed.error });
      }

      const division = await storage.createDivision(parsed.data);
      res.status(201).json(division);
    } catch (error) {
      res.status(500).json({ error: "Failed to create division" });
    }
  });

  app.patch("/api/divisions/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = updateDivisionSchema.safeParse({ ...req.body, id: req.params.id });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid division data", details: parsed.error });
      }

      const division = await storage.updateDivision(parsed.data);
      if (!division) {
        return res.status(404).json({ error: "Division not found" });
      }

      res.json(division);
    } catch (error) {
      res.status(500).json({ error: "Failed to update division" });
    }
  });

  app.delete("/api/divisions/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteDivision(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Division not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete division" });
    }
  });

  // Item routes - requireAuth for all authenticated users
  app.get("/api/items", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.query.projectId as string | undefined;
      let items = await storage.getItems(projectId);
      
      // Filter by role - clients and employees only see items for divisions in assigned projects
      if (user.role === "client" || user.role === "employee") {
        const assignments = await storage.getProjectAssignments(user.id);
        const assignedProjectIds = assignments.map(a => a.projectId);
        
        // Get all divisions for assigned projects
        const divisions = await storage.getDivisions();
        const assignedDivisionIds = divisions
          .filter(d => assignedProjectIds.includes(d.projectId))
          .map(d => d.id);
        
        items = items.filter(item => assignedDivisionIds.includes(item.divisionId));
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.post("/api/items", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid item data", details: parsed.error });
      }

      const item = await storage.createItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.patch("/api/items/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = updateItemSchema.safeParse({ ...req.body, id: req.params.id });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid item data", details: parsed.error });
      }

      const item = await storage.updateItem(parsed.data);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Summary route - requireAuth for all authenticated users
  app.get("/api/summary", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      let projectId = req.query.projectId as string | undefined;
      
      // Filter by role - clients and employees only see summary for assigned projects
      if (user.role === "client" || user.role === "employee") {
        const assignments = await storage.getProjectAssignments(user.id);
        const assignedProjectIds = assignments.map(a => a.projectId);
        
        // If a specific project is requested, verify user has access
        if (projectId && !assignedProjectIds.includes(projectId)) {
          return res.status(403).json({ error: "Forbidden: You don't have access to this project" });
        }
        
        // If no project specified, calculate summary only for assigned projects
        if (!projectId) {
          // Get summary for all assigned projects by filtering divisions and items
          const allDivisions = await storage.getDivisions();
          const assignedDivisions = allDivisions.filter(d => assignedProjectIds.includes(d.projectId));
          const assignedDivisionIds = assignedDivisions.map(d => d.id);
          
          const allItems = await storage.getItems();
          const assignedItems = allItems.filter(item => assignedDivisionIds.includes(item.divisionId));
          
          // Calculate custom summary for assigned projects only
          const totalCost = assignedItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
          const priorityCosts = { High: 0, Mid: 0, Low: 0 };
          
          assignedItems.forEach((item) => {
            const itemTotal = Number(item.quantity) * Number(item.rate);
            priorityCosts[item.priority as "High" | "Mid" | "Low"] += itemTotal;
          });
          
          const divisionBreakdown = assignedDivisions.map((division) => {
            const divisionItems = assignedItems.filter((item) => item.divisionId === division.id);
            const totalCost = divisionItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
            return {
              divisionId: division.id,
              divisionName: division.name,
              totalCost,
              itemCount: divisionItems.length,
            };
          });
          
          return res.json({
            totalCost,
            highPriorityCost: priorityCosts.High,
            midPriorityCost: priorityCosts.Mid,
            lowPriorityCost: priorityCosts.Low,
            totalItems: assignedItems.length,
            totalDivisions: assignedDivisions.length,
            divisionBreakdown,
          });
        }
      }
      
      // Principle and procurement see all, or specific project summary if requested
      const summary = await storage.getProjectSummary(projectId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // Export routes - requireAuth
  app.post("/api/export/excel", requireAuth, async (req, res) => {
    try {
      const { divisions, items, summary } = req.body;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ARKA SERVICES PROJECT MANAGEMENT";
      workbook.created = new Date();

      // Summary Sheet
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.columns = [
        { header: "Metric", key: "metric", width: 30 },
        { header: "Value", key: "value", width: 20 },
      ];

      summarySheet.addRows([
        { metric: "Total Project Cost (PKR)", value: summary.totalCost },
        { metric: "High Priority Cost (PKR)", value: summary.highPriorityCost },
        { metric: "Mid Priority Cost (PKR)", value: summary.midPriorityCost },
        { metric: "Low Priority Cost (PKR)", value: summary.lowPriorityCost },
        { metric: "Total Items", value: summary.totalItems },
        { metric: "Total Divisions", value: summary.totalDivisions },
      ]);

      summarySheet.getRow(1).font = { bold: true };

      // Divisions Sheet
      const divisionsSheet = workbook.addWorksheet("Divisions");
      divisionsSheet.columns = [
        { header: "Division Name", key: "name", width: 30 },
        { header: "Items", key: "items", width: 10 },
        { header: "Total Cost (PKR)", key: "cost", width: 20 },
      ];

      summary.divisionBreakdown.forEach((div: any) => {
        divisionsSheet.addRow({
          name: div.divisionName,
          items: div.itemCount,
          cost: div.totalCost,
        });
      });

      divisionsSheet.getRow(1).font = { bold: true };

      // Items Sheet
      const itemsSheet = workbook.addWorksheet("Items");
      itemsSheet.columns = [
        { header: "Division", key: "division", width: 20 },
        { header: "Description", key: "description", width: 35 },
        { header: "Unit", key: "unit", width: 15 },
        { header: "Quantity", key: "quantity", width: 12 },
        { header: "Rate (PKR)", key: "rate", width: 15 },
        { header: "Total (PKR)", key: "total", width: 15 },
        { header: "Priority", key: "priority", width: 12 },
      ];

      items.forEach((item: any) => {
        const division = divisions.find((d: any) => d.id === item.divisionId);
        itemsSheet.addRow({
          division: division?.name || "",
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          total: item.quantity * item.rate,
          priority: item.priority,
        });
      });

      itemsSheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=arka-project.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Excel export error:", error);
      res.status(500).json({ error: "Failed to export to Excel" });
    }
  });

  app.post("/api/export/pdf", requireAuth, async (req, res) => {
    try {
      const { divisions, items, summary } = req.body;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(20);
      doc.text("ARKA SERVICES PROJECT MANAGEMENT", 105, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(12);
      doc.text("Master Project Summary", 105, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(10);
      doc.text(`Total Project Cost: ${summary.totalCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`High Priority Cost: ${summary.highPriorityCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`Mid Priority Cost: ${summary.midPriorityCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`Low Priority Cost: ${summary.lowPriorityCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`Total Items: ${summary.totalItems}`, 20, yPos);
      yPos += 8;
      doc.text(`Total Divisions: ${summary.totalDivisions}`, 20, yPos);
      yPos += 15;

      doc.setFontSize(14);
      doc.text("Division Breakdown", 20, yPos);
      yPos += 10;

      doc.setFontSize(9);
      summary.divisionBreakdown.forEach((div: any) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${div.divisionName}: ${div.itemCount} items, ${div.totalCost.toLocaleString('en-PK')} PKR`, 20, yPos);
        yPos += 7;
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=arka-project.pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF export error:", error);
      res.status(500).json({ error: "Failed to export to PDF" });
    }
  });

  app.post("/api/export/jpeg", requireAuth, async (req, res) => {
    try {
      res.status(501).json({ 
        error: "JPEG export requires client-side rendering. Please use the download button in the UI." 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export to JPEG" });
    }
  });

  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      });

      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid credentials", details: parsed.error });
      }

      const { username, password } = parsed.data;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      // Create session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.status(204).send();
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to get current user" });
    }
  });

  // User Management Routes (Principle only)
  app.get("/api/users", requireAuth, requireRole("principle"), async (_req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from all users
      const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid user data", details: parsed.error });
      }

      // Hash the password before storing
      const hashedPassword = hashPassword(parsed.data.password);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updateUserSchema = z.object({
        username: z.string().min(3).optional(),
        password: z.string().min(6).optional(),
        role: z.enum(["principle", "employee", "client", "procurement"]).optional(),
        fullName: z.string().min(1).optional(),
        isActive: z.number().int().min(0).max(1).optional(),
      });

      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid user data", details: parsed.error });
      }

      const updates: any = { ...parsed.data };
      
      // Hash password if provided
      if (updates.password) {
        updates.password = hashPassword(updates.password);
      }

      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Employee Management Routes
  app.get("/api/employees", requireAuth, requireRole('principle'), async (_req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const employee = await storage.getEmployee(req.params.id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Employees can only see their own data, principle can see all
      if (user.role === "employee" && employee.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden: You can only view your own employee data" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid employee data", details: parsed.error });
      }

      const employee = await storage.createEmployee(parsed.data);
      res.status(201).json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updateEmployeeSchema = z.object({
        idCard: z.string().optional(),
        whatsapp: z.string().optional(),
        homeAddress: z.string().optional(),
        joiningDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ).optional(),
        profilePicture: z.string().optional(),
      });

      const parsed = updateEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid employee data", details: parsed.error });
      }

      const employee = await storage.updateEmployee(req.params.id, parsed.data);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  // Task Management Routes with role-based filtering
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.query.projectId as string | undefined;
      const employeeId = req.query.employeeId as string | undefined;
      
      let tasks;
      
      if (user.role === "employee") {
        // Employees only see tasks assigned to them
        const employee = await storage.getEmployeeByUserId(user.id);
        if (!employee) {
          return res.status(404).json({ error: "Employee profile not found" });
        }
        tasks = await storage.getTasks(projectId, employee.id);
      } else if (user.role === "client") {
        // Clients only see tasks for their assigned projects
        const assignments = await storage.getProjectAssignments(user.id);
        const projectIds = assignments.map(a => a.projectId);
        
        tasks = await storage.getTasks(projectId, employeeId);
        tasks = tasks.filter(t => projectIds.includes(t.projectId));
      } else {
        // Principle and procurement see all tasks
        tasks = await storage.getTasks(projectId, employeeId);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid task data", details: parsed.error });
      }

      const task = await storage.createTask(parsed.data);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const updateTaskSchema = z.object({
        taskType: z.enum(["Design CAD", "IFCs", "3D Rendering", "Procurement", "Site Visits"]).optional(),
        description: z.string().optional(),
        status: z.enum(["Done", "Undone", "In Progress"]).optional(),
        dueDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ).optional(),
      });

      const parsed = updateTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid task data", details: parsed.error });
      }

      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Allow principle to update any task OR employee to update their own task
      if (user.role !== 'principle') {
        if (user.role === "employee") {
          const employee = await storage.getEmployeeByUserId(user.id);
          if (!employee || task.employeeId !== employee.id) {
            return res.status(403).json({ error: "Forbidden: You can only update your own tasks" });
          }
        } else {
          // Other roles (client, procurement) cannot update tasks
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const updatedTask = await storage.updateTask(req.params.id, parsed.data);
      if (!updatedTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Procurement Routes with role-based filtering
  app.get("/api/procurement", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.query.projectId as string;
      
      if (!projectId) {
        return res.status(400).json({ error: "projectId query parameter is required" });
      }

      let items = await storage.getProcurementItems(projectId);

      if (user.role === "client") {
        // Clients only see procurement for their assigned projects
        const assignments = await storage.getProjectAssignments(user.id);
        const projectIds = assignments.map(a => a.projectId);
        
        if (!projectIds.includes(projectId)) {
          return res.status(403).json({ error: "Forbidden: You can only view procurement for assigned projects" });
        }
        
        // Clients see project_cost only, hide execution_cost
        items = items.map(item => ({
          ...item,
          executionCost: "0"
        }));
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch procurement items" });
    }
  });

  app.post("/api/procurement", requireAuth, requireRole("principle", "procurement"), async (req, res) => {
    try {
      const parsed = insertProcurementItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid procurement item data", details: parsed.error });
      }

      const item = await storage.createProcurementItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create procurement item" });
    }
  });

  app.patch("/api/procurement/:id", requireAuth, requireRole("principle", "procurement"), async (req, res) => {
    try {
      const updateProcurementSchema = z.object({
        itemName: z.string().min(1).optional(),
        projectCost: z.number().min(0).optional(),
        executionCost: z.number().min(0).optional(),
        isPurchased: z.number().int().min(0).max(1).optional(),
        billNumber: z.string().optional(),
        rentalDetails: z.string().optional(),
        quantity: z.number().min(0).optional(),
        unit: z.string().optional(),
        notes: z.string().optional(),
        purchasedBy: z.string().optional(),
        purchasedDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ).optional(),
      });

      const parsed = updateProcurementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid procurement item data", details: parsed.error });
      }

      // Convert numeric fields to strings for database storage
      const updates: any = { ...parsed.data };
      if (updates.quantity !== undefined) updates.quantity = updates.quantity.toString();
      if (updates.projectCost !== undefined) updates.projectCost = updates.projectCost.toString();
      if (updates.executionCost !== undefined) updates.executionCost = updates.executionCost.toString();

      const item = await storage.updateProcurementItem(req.params.id, updates);
      if (!item) {
        return res.status(404).json({ error: "Procurement item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update procurement item" });
    }
  });

  app.delete("/api/procurement/:id", requireAuth, requireRole("principle", "procurement"), async (req, res) => {
    try {
      const deleted = await storage.deleteProcurementItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Procurement item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete procurement item" });
    }
  });

  // Salary Routes with employee-only and principle access
  app.get("/api/salaries", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const employeeId = req.query.employeeId as string;
      
      if (!employeeId) {
        return res.status(400).json({ error: "employeeId query parameter is required" });
      }

      // Employees can only see their own salaries
      if (user.role === "employee") {
        const employee = await storage.getEmployeeByUserId(user.id);
        if (!employee || employee.id !== employeeId) {
          return res.status(403).json({ error: "Forbidden: You can only view your own salary data" });
        }
      } else if (user.role !== "principle") {
        return res.status(403).json({ error: "Forbidden: Only employees and principle can view salaries" });
      }

      const salaries = await storage.getSalaries(employeeId);
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  });

  app.post("/api/salaries", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertSalarySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid salary data", details: parsed.error });
      }

      const salary = await storage.createSalary(parsed.data);
      res.status(201).json(salary);
    } catch (error) {
      res.status(500).json({ error: "Failed to create salary" });
    }
  });

  app.patch("/api/salaries/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updateSalarySchema = z.object({
        basicSalary: z.number().min(0).optional(),
        incentives: z.number().min(0).optional(),
        medical: z.number().min(0).optional(),
        tax: z.number().min(0).optional(),
        deductions: z.number().min(0).optional(),
        netSalary: z.number().min(0).optional(),
        isPaid: z.number().int().min(0).max(1).optional(),
        paidDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ).optional(),
      });

      const parsed = updateSalarySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid salary data", details: parsed.error });
      }

      // Convert numeric fields to strings for database storage
      const updates: any = { ...parsed.data };
      if (updates.basicSalary !== undefined) updates.basicSalary = updates.basicSalary.toString();
      if (updates.incentives !== undefined) updates.incentives = updates.incentives.toString();
      if (updates.medical !== undefined) updates.medical = updates.medical.toString();
      if (updates.tax !== undefined) updates.tax = updates.tax.toString();
      if (updates.deductions !== undefined) updates.deductions = updates.deductions.toString();
      if (updates.netSalary !== undefined) updates.netSalary = updates.netSalary.toString();

      const salary = await storage.updateSalary(req.params.id, updates);
      if (!salary) {
        return res.status(404).json({ error: "Salary not found" });
      }

      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: "Failed to update salary" });
    }
  });

  app.delete("/api/salaries/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteSalary(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Salary not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salary" });
    }
  });

  // Attendance Routes with employee-only and principle access
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const employeeId = req.query.employeeId as string;
      
      if (!employeeId) {
        return res.status(400).json({ error: "employeeId query parameter is required" });
      }

      // Employees can only see their own attendance
      if (user.role === "employee") {
        const employee = await storage.getEmployeeByUserId(user.id);
        if (!employee || employee.id !== employeeId) {
          return res.status(403).json({ error: "Forbidden: You can only view your own attendance data" });
        }
      } else if (user.role !== "principle") {
        return res.status(403).json({ error: "Forbidden: Only employees and principle can view attendance" });
      }

      const month = req.query.month as string | undefined;
      const attendance = await storage.getAttendance(employeeId, month);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const parsed = insertAttendanceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid attendance data", details: parsed.error });
      }

      // Employees can only mark their own attendance
      if (user.role === "employee") {
        const employee = await storage.getEmployeeByUserId(user.id);
        if (!employee) {
          return res.status(404).json({ error: "Employee profile not found" });
        }
        
        // Verify employee is marking their own attendance
        if (parsed.data.employeeId !== employee.id) {
          return res.status(403).json({ error: "Forbidden: You can only mark your own attendance" });
        }
      }
      // Principle can mark anyone's attendance (no additional check needed)

      const attendance = await storage.createAttendance(parsed.data);
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create attendance record" });
    }
  });

  app.patch("/api/attendance/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updateAttendanceSchema = z.object({
        attendanceDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ).optional(),
        status: z.enum(["Present", "Absent", "Late", "Half Day"]).optional(),
        checkInTime: z.string().optional(),
        checkOutTime: z.string().optional(),
        hoursWorked: z.number().min(0).optional(),
      });

      const parsed = updateAttendanceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid attendance data", details: parsed.error });
      }

      // Convert hoursWorked to string if provided
      const updates: any = { ...parsed.data };
      if (updates.hoursWorked !== undefined) {
        updates.hoursWorked = updates.hoursWorked.toString();
      }

      const attendance = await storage.updateAttendance(req.params.id, updates);
      if (!attendance) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: "Failed to update attendance record" });
    }
  });

  app.delete("/api/attendance/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteAttendance(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete attendance record" });
    }
  });

  // Project Assignment Routes with role-based filtering
  app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const userId = req.query.userId as string | undefined;
      const projectId = req.query.projectId as string | undefined;
      
      let assignments;
      
      if (user.role === "client") {
        // Clients can only see their own assignments
        assignments = await storage.getProjectAssignments(user.id, projectId);
      } else {
        // Principle and other roles can see all assignments
        assignments = await storage.getProjectAssignments(userId, projectId);
      }
      
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project assignments" });
    }
  });

  app.post("/api/assignments", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertProjectAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid assignment data", details: parsed.error });
      }

      const assignment = await storage.createProjectAssignment(parsed.data);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project assignment" });
    }
  });

  app.delete("/api/assignments/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteProjectAssignment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Project assignment not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project assignment" });
    }
  });

  // Comment Routes with role-based filtering
  app.get("/api/comments", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.query.projectId as string;
      
      if (!projectId) {
        return res.status(400).json({ error: "projectId query parameter is required" });
      }

      // Clients can only see comments for their assigned projects
      if (user.role === "client") {
        const assignments = await storage.getProjectAssignments(user.id);
        const projectIds = assignments.map(a => a.projectId);
        
        if (!projectIds.includes(projectId)) {
          return res.status(403).json({ error: "Forbidden: You can only view comments for assigned projects" });
        }
      }

      const comments = await storage.getComments(projectId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const parsed = insertCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid comment data", details: parsed.error });
      }

      const comment = await storage.createComment(parsed.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const comment = await storage.getComment(req.params.id);
      
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Principle OR comment author can delete
      if (user.role !== "principle" && comment.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden: You can only delete your own comments" });
      }

      const deleted = await storage.deleteComment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Project Financials Routes with role-based access
  app.get("/api/financials/:projectId", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.params.projectId;

      // Clients can only view financials for their assigned projects
      if (user.role === "client") {
        const assignments = await storage.getProjectAssignments(user.id);
        const projectIds = assignments.map(a => a.projectId);
        
        if (!projectIds.includes(projectId)) {
          return res.status(403).json({ error: "Forbidden: You can only view financials for assigned projects" });
        }
      }

      const financials = await storage.getProjectFinancials(projectId);
      if (!financials) {
        return res.status(404).json({ error: "Project financials not found" });
      }

      res.json(financials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project financials" });
    }
  });

  app.post("/api/financials", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertProjectFinancialsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid financials data", details: parsed.error });
      }

      const financials = await storage.createProjectFinancials(parsed.data);
      res.status(201).json(financials);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project financials" });
    }
  });

  app.patch("/api/financials/:projectId", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const updateFinancialsSchema = z.object({
        contractValue: z.number().min(0).optional(),
        amountReceived: z.number().min(0).optional(),
        workCompleted: z.number().min(0).max(100).optional(),
        isArchived: z.number().int().min(0).max(1).optional(),
        archivedDate: z.union([z.string(), z.date()]).transform(val => 
          typeof val === 'string' ? new Date(val) : val
        ).optional(),
      });

      const parsed = updateFinancialsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid financials data", details: parsed.error });
      }

      // Convert numeric fields to strings for database storage
      const updates: any = { ...parsed.data };
      if (updates.contractValue !== undefined) updates.contractValue = updates.contractValue.toString();
      if (updates.amountReceived !== undefined) updates.amountReceived = updates.amountReceived.toString();
      if (updates.workCompleted !== undefined) updates.workCompleted = updates.workCompleted.toString();

      const financials = await storage.updateProjectFinancials(req.params.projectId, updates);
      if (!financials) {
        return res.status(404).json({ error: "Project financials not found" });
      }

      res.json(financials);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project financials" });
    }
  });

  app.delete("/api/financials/:projectId", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteProjectFinancials(req.params.projectId);
      if (!deleted) {
        return res.status(404).json({ error: "Project financials not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project financials" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
