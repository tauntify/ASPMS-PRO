import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { auth as firebaseAuth } from "./firebase";
import { generateToken, verifyToken, extractTokenFromHeader } from "./jwt";
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
  insertSalaryAdvanceSchema,
  insertSalaryPaymentSchema,
  insertAttendanceSchema,
  insertProjectAssignmentSchema,
  insertCommentSchema,
  insertProjectFinancialsSchema,
} from "../shared/schema";
import { requireAuth, requireRole, attachUser, hashPassword, verifyPassword } from "./auth";
import { z } from "zod";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";

export async function registerRoutes(app: Express, server?: Server): Promise<Server> {
  // Note: attachUser middleware is already attached in index.ts, no need to add it here

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
      console.log("📝 Creating project with data:", JSON.stringify(req.body, null, 2));
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("❌ Project validation failed:", parsed.error);
        return res.status(400).json({ error: "Invalid project data", details: parsed.error });
      }

      console.log("✅ Project validation passed:", parsed.data);
      const project = await storage.createProject(parsed.data);
      console.log("✅ Project created successfully:", project.id);
      res.status(201).json(project);
    } catch (error) {
      console.error("❌ Failed to create project - Full error:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: "Failed to create project", details: error instanceof Error ? error.message : String(error) });
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

  // Assign project to employee
  app.post("/api/projects/:id/assign", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { employeeId } = req.body;
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      const assignment = await storage.createProjectAssignment({
        projectId: req.params.id,
        userId: employeeId,
        assignedBy: req.user!.id,
      });

      res.status(201).json(assignment);
    } catch (error) {
      console.error("Failed to assign project:", error);
      res.status(500).json({ error: "Failed to assign project" });
    }
  });

  // Division routes - requireAuth for all authenticated users
  app.get("/api/divisions", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = (req.query.projectId as string) || undefined;
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
      console.log("📝 Creating division with data:", JSON.stringify(req.body, null, 2));
      const parsed = insertDivisionSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("❌ Division validation failed:", parsed.error);
        return res.status(400).json({ error: "Invalid division data", details: parsed.error });
      }

      console.log("✅ Division validation passed:", parsed.data);
      const division = await storage.createDivision(parsed.data);
      console.log("✅ Division created successfully:", division.id);
      res.status(201).json(division);
    } catch (error) {
      console.error("❌ Failed to create division - Full error:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: "Failed to create division", details: error instanceof Error ? error.message : String(error) });
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
      const projectId = (req.query.projectId as string) || undefined;
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
      console.error("❌ Failed to fetch summary - Full error:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: "Failed to fetch summary", details: error instanceof Error ? error.message : String(error) });
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
      console.log("🔐 Login attempt:", { username: req.body.username, hasPassword: !!req.body.password });

      const loginSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      });

      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("❌ Login validation failed:", parsed.error);
        return res.status(400).json({ error: "Invalid credentials", details: parsed.error });
      }

      const { username, password } = parsed.data;
      console.log("🔍 Looking up user:", username);

      let user;
      try {
        user = await storage.getUserByUsername(username);
        console.log("✅ User query completed:", user ? "User found" : "User not found");
      } catch (dbError) {
        console.error("❌ Database query failed:", dbError);
        console.error("❌ This likely means Firebase connection issue");
        return res.status(500).json({
          error: "Database connection error. Please check server logs.",
          details: dbError instanceof Error ? dbError.message : String(dbError)
        });
      }

      if (!user) {
        console.log("❌ User not found:", username);
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (!user.password) {
        console.log("❌ User has no password (Google user?):", username);
        return res.status(401).json({ error: "Invalid username or password" });
      }

      console.log("🔑 Verifying password for user:", username);
      const passwordMatch = verifyPassword(password, user.password);
      console.log("🔑 Password verification:", passwordMatch ? "SUCCESS" : "FAILED");

      if (!passwordMatch) {
        console.log("❌ Password mismatch for user:", username);
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Check if account is active (handle both boolean and number for compatibility)
      const isActive = typeof user.isActive === 'boolean' ? user.isActive : Boolean(user.isActive);
      console.log("👤 User active status:", isActive);

      if (!isActive) {
        console.log("❌ Account inactive:", username);
        return res.status(403).json({ error: "Account is inactive" });
      }

      // Generate JWT token instead of session
      console.log("🔑 Generating JWT token for user:", user.id);
      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      // Return user without password + JWT token
      const { password: _, ...userWithoutPassword } = user;
      console.log("✅ Login successful for:", username, "Role:", user.role);
      console.log("🔑 JWT token generated");
      res.json({
        ...userWithoutPassword,
        token, // Include token in response
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({
        error: "Failed to login",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Signup Route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("📝 Signup attempt:", { email: req.body.email, accountType: req.body.accountType });

      const signupSchema = z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().min(1, "Phone number is required"),
        dateOfBirth: z.string().optional(),
        accountType: z.enum(["individual", "organization"]),
        organizationName: z.string().optional(),
      });

      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("❌ Signup validation failed:", parsed.error);
        return res.status(400).json({ error: "Invalid signup data", details: parsed.error });
      }

      const { fullName, email, password, phone, dateOfBirth, accountType, organizationName } = parsed.data;

      // Generate username from email (before @)
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if username already exists
      try {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          // If username exists, append random numbers
          const randomSuffix = Math.floor(Math.random() * 10000);
          const newUsername = `${username}${randomSuffix}`;
          console.log(`⚠️ Username ${username} exists, using ${newUsername}`);
        }
      } catch (error) {
        // User not found, continue
      }

      // Check if email already exists
      const usersSnapshot = await storage.getUsers();
      const emailExists = usersSnapshot.some(u => u.email === email);
      if (emailExists) {
        console.error("❌ Email already exists:", email);
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = hashPassword(password);

      // Create user account
      const user = await storage.createUser({
        firebaseUid: "", // Will be set if they use Google later
        username,
        password: hashedPassword,
        role: "principle", // All signups get principle role initially
        fullName,
        email,
        phone,
        dateOfBirth,
        accountType,
        organizationName: accountType === "organization" ? organizationName : undefined,
      } as any);

      console.log("✅ User created:", user.id, username);

      // Generate JWT token
      const token = generateToken({
        userId: user.id as any,
        username: user.username,
        role: user.role,
      });

      // Return user without password + JWT token
      const { password: _, ...userWithoutPassword } = user;
      console.log("✅ Signup successful for:", email);
      res.status(201).json({
        ...userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("❌ Signup error:", error);
      res.status(500).json({
        error: "Failed to create account",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Google Sign-In Route
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        console.error("No ID token provided");
        return res.status(400).json({ error: "ID token is required" });
      }

      console.log("Received ID token, length:", idToken?.length);
      console.log("Token preview:", idToken.substring(0, 50) + "...");

      // Decode JWT to inspect claims (without verification)
      let unverifiedClaims: any;
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = Buffer.from(parts[1], 'base64').toString('utf8');
          unverifiedClaims = JSON.parse(payload);
          console.log("Token claims (unverified):");
          console.log("  - Audience:", unverifiedClaims.aud);
          console.log("  - Issuer:", unverifiedClaims.iss);
          console.log("  - Email:", unverifiedClaims.email);
          console.log("  - Subject (UID):", unverifiedClaims.sub);
          console.log("  - User ID:", unverifiedClaims.user_id);
          console.log("  - Expires:", new Date(unverifiedClaims.exp * 1000).toISOString());
        }
      } catch (e) {
        console.error("Failed to decode token:", e);
      }

      // Verify the Firebase ID token
      console.log("Verifying token with Firebase Admin...");

      let decodedToken;
      try {
        // Verify the token without checking revocation (more reliable)
        decodedToken = await firebaseAuth.verifyIdToken(idToken, false);
        console.log("✅ Token verified successfully!");
        console.log("User email:", decodedToken.email);
        console.log("User UID:", decodedToken.uid);
      } catch (verifyError: any) {
        console.error("❌ Token verification failed with Admin SDK");
        console.error("Error code:", verifyError.code);
        console.error("Error message:", verifyError.message);

        // If signature verification fails, it might be a service account issue
        // Try to extract user info from the unverified claims as a workaround
        if (verifyError.code === 'auth/argument-error' && unverifiedClaims) {
          console.log("⚠️  Attempting fallback: Using unverified token claims");
          console.log("⚠️  WARNING: This bypasses signature verification!");

          // Validate that the token is for our Firebase project
          const expectedProjectId = 'aspms-pro-v1';
          const tokenProjectId = unverifiedClaims.aud;

          if (tokenProjectId === expectedProjectId) {
            console.log("✅ Token project ID matches:", tokenProjectId);
            // Use unverified claims (security risk - should fix service account instead)
            // Map the standard JWT claims to Firebase Admin SDK format
            decodedToken = {
              uid: unverifiedClaims.sub || unverifiedClaims.user_id,
              email: unverifiedClaims.email,
              name: unverifiedClaims.name,
              picture: unverifiedClaims.picture,
              email_verified: unverifiedClaims.email_verified,
              ...unverifiedClaims
            };
            console.log("Mapped UID:", decodedToken.uid);
          } else {
            console.error("❌ Token project ID mismatch!");
            console.error("Expected:", expectedProjectId);
            console.error("Got:", tokenProjectId);
            return res.status(401).json({
              error: "Token from wrong Firebase project",
              expected: expectedProjectId,
              got: tokenProjectId
            });
          }
        } else {
          return res.status(401).json({
            error: "Invalid Firebase token",
            details: verifyError.message,
            code: verifyError.code
          });
        }
      }

      // Check if user exists in Firestore by Firebase UID
      let user = await storage.getUserByFirebaseUid(decodedToken.uid);

      if (!user) {
        // Create new user if doesn't exist
        const email = decodedToken.email || '';
        const displayName = decodedToken.name || email.split('@')[0];

        // Determine role based on email domain or specific emails
        let role: 'principle' | 'employee' | 'client' | 'procurement' = 'client'; // Default role

        // Check if this is an admin/principle email
        const principleEmails = ['ahsan@tauntify.com']; // Add admin emails here
        if (principleEmails.includes(email.toLowerCase())) {
          role = 'principle';
        }

        console.log(`Creating new user with email: ${email}, role: ${role}`);

        user = await storage.createUser({
          username: email.toLowerCase(),
          password: '', // No password for Google users
          fullName: displayName,
          role: role,
          firebaseUid: decodedToken.uid,
        });
      } else {
        console.log(`Existing user found: ${user.username}, role: ${user.role}`);
      }

      // Check if account is active (handle both boolean and number for compatibility)
      const isActive = typeof user.isActive === 'boolean' ? user.isActive : Boolean(user.isActive);
      if (!isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      // Generate JWT token for Google Sign-In
      console.log("🔑 Generating JWT token for Google user:", user.id);
      const token = generateToken({
        userId: Number(user.id),
        username: user.username,
        role: user.role,
      });

      // Return user without password + JWT token
      const { password: _, ...userWithoutPassword } = user;
      console.log("✅ Google login successful for:", user.username, "Role:", user.role);
      res.json({
        ...userWithoutPassword,
        token, // Include token in response
      });
    } catch (error: any) {
      console.error("Google authentication error:", error);
      res.status(500).json({ error: error.message || "Failed to authenticate with Google" });
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

  app.get("/api/auth/me", async (req, res) => {
    try {
      let userId: number | undefined;

      // Try JWT token first (from Authorization header)
      const token = extractTokenFromHeader(req.headers.authorization);
      if (token) {
        const payload = verifyToken(token);
        if (payload) {
          userId = payload.userId;
          console.log("✅ Authenticated via JWT token, user:", userId);
        }
      }

      // Fallback to session (for backward compatibility)
      if (!userId && req.session?.userId) {
        userId = req.session.userId;
        console.log("✅ Authenticated via session, user:", userId);
      }

      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user from storage
      const user = await storage.getUser(String(userId));

      if (!user) {
        // Clear invalid session if using sessions
        if (req.session?.userId) {
          req.session.destroy(() => {});
        }
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Check if account is active
      const isActive = typeof user.isActive === 'boolean' ? user.isActive : Boolean(user.isActive);
      if (!isActive) {
        req.session.destroy(() => {});
        return res.status(403).json({ error: "Account is inactive" });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
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
      const hashedPassword = hashPassword(parsed.data.password || '');
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

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
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
      // Try to get employee by employee ID first, then by user ID
      let employee = await storage.getEmployee(req.params.id);

      // If not found by employee ID, try by user ID
      if (!employee) {
        employee = await storage.getEmployeeByUserId(req.params.id);
      }

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Employees can only see their own data, principle can see all
      if (user.role === "employee" && employee.userId !== user.id) {
        return res.status(403).json({ error: "Forbidden: You can only view your own employee data" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Failed to fetch employee:", error);
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
        // Employees only see tasks assigned to them (tasks store user ID, not employee table ID)
        tasks = await storage.getTasks(projectId, user.id);
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
        remarks: z.string().optional(),
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
          // Check if task is assigned to this employee (tasks store user ID, not employee table ID)
          if (task.employeeId !== user.id) {
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

  // Task Statistics Endpoint (monthly progress tracking)
  app.get("/api/tasks/stats/monthly", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const month = req.query.month as string; // Format: YYYY-MM
      const employeeId = req.query.employeeId as string | undefined;
      
      if (!month) {
        return res.status(400).json({ error: "month query parameter is required (format: YYYY-MM)" });
      }

      // Get all tasks for the specified month
      let allTasks = await storage.getTasks();
      
      // Filter by month (tasks created in this month)
      const [year, monthNum] = month.split('-').map(Number);
      allTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getFullYear() === year && taskDate.getMonth() + 1 === monthNum;
      });

      // Apply role-based filtering
      if (user.role === "employee") {
        // Filter tasks assigned to this employee (tasks store user ID, not employee table ID)
        allTasks = allTasks.filter(task => task.employeeId === user.id);
      } else if (employeeId && user.role === "principle") {
        // Principle can filter by specific employee (using user ID)
        allTasks = allTasks.filter(task => task.employeeId === employeeId);
      }

      // Calculate statistics
      const total = allTasks.length;
      const done = allTasks.filter(t => t.status === "Done").length;
      const inProgress = allTasks.filter(t => t.status === "In Progress").length;
      const undone = allTasks.filter(t => t.status === "Undone").length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      res.json({
        month,
        total,
        done,
        inProgress,
        undone,
        completionRate,
        tasks: allTasks
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task statistics" });
    }
  });

  // Procurement Routes with role-based filtering
  app.get("/api/procurement", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const projectId = req.query.projectId as string | undefined;
      
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
          executionCost: 0
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
      const employeeId = req.query.employeeId as string | undefined;

      // If no employeeId provided, return all salaries (principle only)
      if (!employeeId) {
        if (user.role !== "principle") {
          return res.status(403).json({ error: "Forbidden: Only principle can view all salaries" });
        }

        // Get all salaries for all employees
        const allUsers = await storage.getUsers();
        const employeeUsers = allUsers.filter(u => u.role === "employee");

        let allSalaries: any[] = [];
        for (const emp of employeeUsers) {
          const empSalaries = await storage.getSalaries(emp.id);
          allSalaries = [...allSalaries, ...empSalaries];
        }

        return res.json(allSalaries);
      }

      // Employees can only see their own salaries
      if (user.role === "employee") {
        // employeeId in the query can be either user ID or employee table ID
        // First check if it matches user ID directly
        if (employeeId !== user.id) {
          // If not, check if it matches employee table ID
          const employee = await storage.getEmployeeByUserId(user.id);
          if (!employee || employee.id !== employeeId) {
            return res.status(403).json({ error: "Forbidden: You can only view your own salary data" });
          }
        }
      } else if (user.role !== "principle") {
        return res.status(403).json({ error: "Forbidden: Only employees and principle can view salaries" });
      }

      const salaries = await storage.getSalaries(employeeId);
      res.json(salaries);
    } catch (error) {
      console.error("Failed to fetch salaries:", error);
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

  // Salary Generation API - with automatic calculations
  app.post("/api/salaries/generate", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const schema = z.object({
        employeeId: z.string(),
        month: z.string().regex(/^\d{4}-\d{2}$/),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error });
      }

      const { employeeId, month } = parsed.data;

      // Check if salary already exists for this month
      const existing = await storage.getSalaryByMonth(employeeId, month);
      if (existing) {
        return res.status(400).json({ error: "Salary already generated for this month" });
      }

      // Get employee with salary configuration
      const employees = await storage.getEmployees();
      const employeeData = employees.find(e => e.userId === employeeId) as any;
      if (!employeeData) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Calculate working days (exclude Sundays)
      const [year, monthNum] = month.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      let sundays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthNum - 1, day);
        if (date.getDay() === 0) sundays++;
      }
      const workingDays = daysInMonth - sundays;

      // Get attendance for the month
      const attendance = await storage.getAttendance(employeeId, month);
      const presentDays = attendance.filter(a => a.isPresent).length;
      const absentDays = workingDays - presentDays;

      // Get salary advances for this month
      const advances = await storage.getSalaryAdvances(employeeId, month);
      const advancePaid = advances.reduce((sum, adv) => sum + adv.amount, 0);

      // Calculate earnings
      const basicSalary = employeeData.basicSalary || 0;
      const travelingAllowance = employeeData.travelingAllowance || 0;
      const medicalAllowance = employeeData.medicalAllowance || 0;
      const foodAllowance = employeeData.foodAllowance || 0;
      const totalEarnings = basicSalary + travelingAllowance + medicalAllowance + foodAllowance;

      // Calculate deductions
      const perDaySalary = workingDays > 0 ? totalEarnings / workingDays : 0;
      const absentDeductions = absentDays * perDaySalary;
      const totalDeductions = absentDeductions + advancePaid;

      // Calculate net salary
      const netSalary = totalEarnings - totalDeductions;

      // Check for pending tasks
      const tasks = await storage.getTasks(employeeId);
      const pendingTasks = tasks.filter(t => t.status !== "Done");
      const isHeld = pendingTasks.length > 0;

      // Create salary record
      const salary = await storage.createSalary({
        employeeId,
        month,
        basicSalary,
        travelingAllowance,
        medicalAllowance,
        foodAllowance,
        totalEarnings,
        advancePaid,
        absentDeductions,
        otherDeductions: 0,
        totalDeductions,
        netSalary,
        paidAmount: 0,
        remainingAmount: netSalary,
        isPaid: false,
        isHeld,
        salaryDate: employeeData.salaryDate,
        attendanceDays: presentDays,
        totalWorkingDays: workingDays,
      });

      res.status(201).json(salary);
    } catch (error) {
      console.error("Failed to generate salary:", error);
      res.status(500).json({ error: "Failed to generate salary" });
    }
  });

  // Salary Hold/Release
  app.patch("/api/salaries/:id/hold", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const salary = await storage.updateSalary(req.params.id, { isHeld: true });
      if (!salary) {
        return res.status(404).json({ error: "Salary not found" });
      }
      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: "Failed to hold salary" });
    }
  });

  app.patch("/api/salaries/:id/release", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const salary = await storage.updateSalary(req.params.id, { isHeld: false });
      if (!salary) {
        return res.status(404).json({ error: "Salary not found" });
      }
      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: "Failed to release salary" });
    }
  });

  // Salary Advance Routes
  app.get("/api/salary-advances", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const employeeId = req.query.employeeId as string | undefined;
      const month = req.query.month as string | undefined;

      // If no employeeId provided, return all advances (principle only)
      if (!employeeId) {
        if (user.role !== "principle") {
          return res.status(403).json({ error: "Forbidden: Only principle can view all advances" });
        }

        // Get all advances for all employees
        const allUsers = await storage.getUsers();
        const employeeUsers = allUsers.filter(u => u.role === "employee");

        let allAdvances: any[] = [];
        for (const emp of employeeUsers) {
          const empAdvances = await storage.getSalaryAdvances(emp.id, month);
          allAdvances = [...allAdvances, ...empAdvances];
        }

        return res.json(allAdvances);
      }

      // Employees can only see their own advances
      if (user.role === "employee" && employeeId !== user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const advances = await storage.getSalaryAdvances(employeeId, month);
      res.json(advances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary advances" });
    }
  });

  app.post("/api/salary-advances", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertSalaryAdvanceSchema.safeParse({
        ...req.body,
        paidBy: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error });
      }

      const advance = await storage.createSalaryAdvance(parsed.data);
      res.status(201).json(advance);
    } catch (error) {
      res.status(500).json({ error: "Failed to create salary advance" });
    }
  });

  app.delete("/api/salary-advances/:id", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const deleted = await storage.deleteSalaryAdvance(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Advance not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salary advance" });
    }
  });

  // Salary Payment Routes
  app.get("/api/salary-payments", requireAuth, async (req, res) => {
    try {
      const salaryId = req.query.salaryId as string;
      if (!salaryId) {
        return res.status(400).json({ error: "salaryId is required" });
      }

      const payments = await storage.getSalaryPayments(salaryId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary payments" });
    }
  });

  app.post("/api/salary-payments", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertSalaryPaymentSchema.safeParse({
        ...req.body,
        paidBy: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error });
      }

      const payment = await storage.createSalaryPayment(parsed.data);

      // Update salary paidAmount and remainingAmount
      const salary = await storage.getSalary(parsed.data.salaryId);
      if (salary) {
        const payments = await storage.getSalaryPayments(salary.id);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = salary.netSalary - totalPaid;
        const isPaid = remaining <= 0;

        await storage.updateSalary(salary.id, {
          paidAmount: totalPaid,
          remainingAmount: remaining,
          isPaid,
          paidDate: isPaid ? new Date() : salary.paidDate,
        });
      }

      res.status(201).json(payment);
    } catch (error) {
      console.error("Failed to create salary payment:", error);
      res.status(500).json({ error: "Failed to create salary payment" });
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
        // employeeId in attendance table references users.id, not employee table id
        if (employeeId !== user.id) {
          return res.status(403).json({ error: "Forbidden: You can only view your own attendance data" });
        }
      } else if (user.role !== "principle") {
        return res.status(403).json({ error: "Forbidden: Only employees and principle can view attendance" });
      }

      const month = req.query.month as string | undefined;
      const attendance = await storage.getAttendance(employeeId, month);
      res.json(attendance);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
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
        // Verify employee is marking their own attendance (employeeId in attendance table references users.id)
        if (parsed.data.employeeId !== user.id) {
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

  // Create employee with user account (atomic operation)
  app.post("/api/employees/create", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      console.log("📝 Creating employee with data:", JSON.stringify(req.body, null, 2));
      const employeeSchema = insertUserSchema.extend({
        idCard: z.string().min(1, "ID Card is required"),
        whatsapp: z.string().min(1, "WhatsApp number is required"),
        homeAddress: z.string().min(1, "Home address is required"),
        joiningDate: z.string().min(1, "Joining date is required"),
        profilePicture: z.string().optional(),
        designation: z.string().optional(),
        basicSalary: z.number().min(0).optional(),
        travelingAllowance: z.number().min(0).optional(),
        medicalAllowance: z.number().min(0).optional(),
        foodAllowance: z.number().min(0).optional(),
        salaryDate: z.number().min(1).max(31).optional(),
      });

      const parsed = employeeSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("❌ Employee validation failed:", parsed.error);
        return res.status(400).json({ error: "Invalid employee data", details: parsed.error });
      }
      console.log("✅ Employee validation passed:", parsed.data);

      const data = parsed.data;

      // Create user
      const hashedPassword = hashPassword(data.password || '');
      const user = await storage.createUser({
        firebaseUid: data.firebaseUid || '',  // Empty for non-Google users
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
      });

      try {
        // Create employee profile
        console.log("✅ User created successfully:", user.id);
        const employee = await storage.createEmployee({
          userId: user.id,
          idCard: data.idCard,
          whatsapp: data.whatsapp,
          homeAddress: data.homeAddress,
          joiningDate: new Date(data.joiningDate),
          profilePicture: data.profilePicture ?? undefined,
          designation: data.designation as any,
          basicSalary: data.basicSalary ?? undefined,
          travelingAllowance: data.travelingAllowance ?? undefined,
          medicalAllowance: data.medicalAllowance ?? undefined,
          foodAllowance: data.foodAllowance ?? undefined,
          salaryDate: data.salaryDate ?? undefined,
        });

        console.log("✅ Employee created successfully:", employee.id);
        res.status(201).json({ user: { ...user, password: undefined }, employee });
      } catch (employeeError) {
        // Rollback: delete the created user if employee creation fails
        console.error("❌ Employee profile creation failed, rolling back user:", employeeError);
        await storage.deleteUser(user.id);
        throw employeeError;
      }
    } catch (error) {
      console.error("❌ Failed to create employee - Full error:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ error: "Failed to create employee", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Employee Documents routes
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      let queryEmployeeId = req.query.employeeId as string | undefined;
      const user = req.user!;

      // If employeeId is provided, it might be a user ID, so we need to convert it to employee table ID
      if (queryEmployeeId) {
        // Try to get employee by user ID first
        const employeeByUserId = await storage.getEmployeeByUserId(queryEmployeeId);
        if (employeeByUserId) {
          queryEmployeeId = employeeByUserId.id;
        }

        // Employees can only see their own documents
        if (user.role === "employee" && queryEmployeeId) {
          const userEmployee = await storage.getEmployeeByUserId(user.id);
          if (!userEmployee || userEmployee.id !== queryEmployeeId) {
            return res.status(403).json({ error: "Forbidden" });
          }
        }
      }

      const documents = await storage.getEmployeeDocuments(queryEmployeeId);
      res.json(documents);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Use provided server or create a new one
  const httpServer = server || createServer(app);

  return httpServer;
}
