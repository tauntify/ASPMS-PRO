/**
 * Architecture Lifecycle Routes
 * Handles meetings, milestones, approvals, and financials
 */

import type { Express } from "express";
import {
  insertMeetingSchema,
  insertMilestoneSchema,
  insertClientApprovalSchema,
} from "@shared/schema";
import { requireAuth, requireRole } from "./auth";
import { calculateProjectFinancials } from "@shared/unit-conversion";
import { toCanonicalSqm } from "@shared/unit-conversion";

export function registerLifecycleRoutes(app: Express) {
  /**
   * MEETINGS ROUTES
   */

  // Get meetings for a project
  app.get("/api/projects/:projectId/meetings", requireAuth, async (req, res) => {
    try {
      const { getMeetingsForUser } = await import("./context-storage");
      const meetings = await getMeetingsForUser(req.user!, req.params.projectId);
      res.json(meetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  // Create a meeting
  app.post("/api/projects/:projectId/meetings", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertMeetingSchema.safeParse({
        ...req.body,
        projectId: req.params.projectId,
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid meeting data", details: parsed.error });
      }

      const { createMeetingForUser, createAuditLogForUser } = await import("./context-storage");
      const meeting = await createMeetingForUser(req.user!, parsed.data);

      // Create audit log
      await createAuditLogForUser(req.user!, {
        userId: req.user!.id,
        userName: req.user!.fullName,
        action: 'CREATE_MEETING',
        entityType: 'meeting',
        entityId: meeting.id,
        changes: parsed.data,
      });

      res.status(201).json(meeting);
    } catch (error) {
      console.error("Failed to create meeting:", error);
      res.status(500).json({ error: "Failed to create meeting" });
    }
  });

  // Update a meeting
  app.patch("/api/projects/:projectId/meetings/:meetingId", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { updateMeetingForUser, createAuditLogForUser } = await import("./context-storage");
      const meeting = await updateMeetingForUser(
        req.user!,
        req.params.projectId,
        req.params.meetingId,
        req.body
      );

      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      // Create audit log
      await createAuditLogForUser(req.user!, {
        userId: req.user!.id,
        userName: req.user!.fullName,
        action: 'UPDATE_MEETING',
        entityType: 'meeting',
        entityId: req.params.meetingId,
        changes: req.body,
      });

      res.json(meeting);
    } catch (error) {
      console.error("Failed to update meeting:", error);
      if (error instanceof Error && error.message.includes('locked')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to update meeting" });
    }
  });

  // Lock a meeting (immutable)
  app.post("/api/projects/:projectId/meetings/:meetingId/lock", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { updateMeetingForUser, createAuditLogForUser } = await import("./context-storage");
      const meeting = await updateMeetingForUser(
        req.user!,
        req.params.projectId,
        req.params.meetingId,
        { isLocked: true }
      );

      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      // Create audit log
      await createAuditLogForUser(req.user!, {
        userId: req.user!.id,
        userName: req.user!.fullName,
        action: 'LOCK_MEETING',
        entityType: 'meeting',
        entityId: req.params.meetingId,
        changes: { isLocked: true },
      });

      res.json(meeting);
    } catch (error) {
      console.error("Failed to lock meeting:", error);
      res.status(500).json({ error: "Failed to lock meeting" });
    }
  });

  /**
   * MILESTONES ROUTES
   */

  // Get milestones for a project
  app.get("/api/projects/:projectId/milestones", requireAuth, async (req, res) => {
    try {
      const { getMilestonesForUser } = await import("./context-storage");
      const milestones = await getMilestonesForUser(req.user!, req.params.projectId);
      res.json(milestones);
    } catch (error) {
      console.error("Failed to fetch milestones:", error);
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  // Create a milestone
  app.post("/api/projects/:projectId/milestones", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertMilestoneSchema.safeParse({
        ...req.body,
        projectId: req.params.projectId,
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid milestone data", details: parsed.error });
      }

      const { createMilestoneForUser } = await import("./context-storage");
      const milestone = await createMilestoneForUser(req.user!, parsed.data);

      res.status(201).json(milestone);
    } catch (error) {
      console.error("Failed to create milestone:", error);
      res.status(500).json({ error: "Failed to create milestone" });
    }
  });

  // Update a milestone
  app.patch("/api/projects/:projectId/milestones/:milestoneId", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const { updateMilestoneForUser } = await import("./context-storage");
      const milestone = await updateMilestoneForUser(
        req.user!,
        req.params.projectId,
        req.params.milestoneId,
        req.body
      );

      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }

      res.json(milestone);
    } catch (error) {
      console.error("Failed to update milestone:", error);
      res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  /**
   * APPROVALS ROUTES
   */

  // Get approvals for a project (or all for a client)
  app.get("/api/approvals", requireAuth, async (req, res) => {
    try {
      const { getApprovalsForUser } = await import("./context-storage");
      const projectId = req.query.projectId as string | undefined;
      const approvals = await getApprovalsForUser(req.user!, projectId);

      // Filter approvals based on user role
      let filteredApprovals = approvals;
      if (req.user!.role === "client") {
        const { getClientsForUser } = await import("./context-storage");
        const clients = await getClientsForUser(req.user!);
        const clientIds = clients.filter(c => c.userId === req.user!.id).map(c => c.id);
        filteredApprovals = approvals.filter(a => clientIds.includes(a.clientId));
      }

      res.json(filteredApprovals);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
      res.status(500).json({ error: "Failed to fetch approvals" });
    }
  });

  // Get approvals for a specific project
  app.get("/api/projects/:projectId/approvals", requireAuth, async (req, res) => {
    try {
      const { getApprovalsForUser } = await import("./context-storage");
      const approvals = await getApprovalsForUser(req.user!, req.params.projectId);

      // Filter approvals based on user role
      let filteredApprovals = approvals;
      if (req.user!.role === "client") {
        const { getClientsForUser } = await import("./context-storage");
        const clients = await getClientsForUser(req.user!);
        const clientIds = clients.filter(c => c.userId === req.user!.id).map(c => c.id);
        filteredApprovals = approvals.filter(a => clientIds.includes(a.clientId));
      }

      res.json(filteredApprovals);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
      res.status(500).json({ error: "Failed to fetch approvals" });
    }
  });

  // Create an approval request
  app.post("/api/projects/:projectId/approvals", requireAuth, requireRole("principle"), async (req, res) => {
    try {
      const parsed = insertClientApprovalSchema.safeParse({
        ...req.body,
        projectId: req.params.projectId,
        requestedBy: req.user!.id,
        requestedAt: new Date(),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid approval data", details: parsed.error });
      }

      const { createApprovalForUser } = await import("./context-storage");
      const approval = await createApprovalForUser(req.user!, parsed.data);

      res.status(201).json(approval);
    } catch (error) {
      console.error("Failed to create approval:", error);
      res.status(500).json({ error: "Failed to create approval" });
    }
  });

  // Update approval (client response)
  app.patch("/api/projects/:projectId/approvals/:approvalId", requireAuth, async (req, res) => {
    try {
      const { status, objectionComment, clientResponse } = req.body;

      // Validate objection comment is required when objecting
      if (status === 'objection' && !objectionComment && !clientResponse?.comment) {
        return res.status(400).json({
          error: "Objection comment is required when objecting to an approval",
        });
      }

      const { updateApprovalForUser } = await import("./context-storage");
      const approval = await updateApprovalForUser(
        req.user!,
        req.params.projectId,
        req.params.approvalId,
        {
          status,
          objectionComment,
          clientResponse: clientResponse ? {
            ...clientResponse,
            timestamp: new Date(),
          } : undefined,
        }
      );

      if (!approval) {
        return res.status(404).json({ error: "Approval not found" });
      }

      res.json(approval);
    } catch (error) {
      console.error("Failed to update approval:", error);
      res.status(500).json({ error: "Failed to update approval" });
    }
  });

  /**
   * CLIENT NOTIFICATIONS ROUTES
   */

  // Get notifications for current user
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      if (req.user!.role !== "client") {
        return res.json([]); // Only clients have notifications
      }

      const { getClientNotificationsForUser, getClientsForUser } = await import("./context-storage");
      const clients = await getClientsForUser(req.user!);
      const client = clients.find(c => c.userId === req.user!.id);

      if (!client) {
        return res.json([]);
      }

      const notifications = await getClientNotificationsForUser(req.user!, client.id);
      res.json(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:notificationId/read", requireAuth, async (req, res) => {
    try {
      // This would require implementing an update function for notifications
      // For now, return success
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  /**
   * PROJECT FINANCIALS ROUTES
   */

  // Calculate project financials
  app.get("/api/projects/:projectId/financials", requireAuth, async (req, res) => {
    try {
      const {
        getProjectsForUser,
        getItemsForUser,
        getProcurementItemsForUser,
      } = await import("./context-storage");

      const projects = await getProjectsForUser(req.user!);
      const project = projects.find(p => p.id === req.params.projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Calculate BOQ total
      const items = await getItemsForUser(req.user!);
      const projectItems = items.filter(i => {
        // Need to check if item belongs to a division of this project
        return true; // Simplified for now
      });

      const boqTotal = projectItems
        .filter(i => i.isBoqItem)
        .reduce((sum, item) => sum + (item.quantity * item.rate), 0);

      // Calculate procurement total
      const procurementItems = await getProcurementItemsForUser(req.user!);
      const projectProcurementItems = procurementItems.filter(p => p.projectId === req.params.projectId);
      const procurementTotal = projectProcurementItems.reduce(
        (sum, item) => sum + (item.executionCost || 0),
        0
      );

      // Calculate labor total (simplified - would need labor collection)
      const laborTotal = 0;
      const subcontractTotal = 0;

      // Use project settings or defaults
      const contingencyPercent = 5;
      const overheadPercent = 10;

      // Calculate canonical area if needed
      let canonicalAreaSqm = project.canonicalAreaSqm;
      if (!canonicalAreaSqm && project.area && project.areaUnit) {
        canonicalAreaSqm = toCanonicalSqm(project.area, project.areaUnit);
      }

      const financials = calculateProjectFinancials({
        boqTotal,
        laborTotal,
        procurementTotal,
        subcontractTotal,
        contingencyPercent,
        overheadPercent,
        feeModel: project.feeModel,
        projectArea: project.area,
        projectAreaUnit: project.areaUnit,
        supervisionPercent: project.supervisionPercent,
      });

      res.json({
        ...financials,
        projectId: req.params.projectId,
        currency: "USD", // Could be made configurable
      });
    } catch (error) {
      console.error("Failed to calculate financials:", error);
      res.status(500).json({ error: "Failed to calculate financials" });
    }
  });

  // Generate project summary
  app.get("/api/projects/:projectId/summary", requireAuth, async (req, res) => {
    try {
      const {
        getProjectsForUser,
        getClientsForUser,
        getMilestonesForUser,
        getApprovalsForUser,
        getMeetingsForUser,
      } = await import("./context-storage");

      const projects = await getProjectsForUser(req.user!);
      const project = projects.find(p => p.id === req.params.projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Get related data
      const clients = await getClientsForUser(req.user!);
      const projectClient = clients.find(c => c.id === project.clientId);

      const milestones = await getMilestonesForUser(req.user!, req.params.projectId);
      const approvals = await getApprovalsForUser(req.user!, req.params.projectId);
      const meetings = await getMeetingsForUser(req.user!, req.params.projectId);

      // Get financials
      const financialsResponse = await fetch(`/api/projects/${req.params.projectId}/financials`);
      const financials = financialsResponse.ok ? await financialsResponse.json() : null;

      res.json({
        project,
        client: projectClient,
        milestones,
        openApprovals: approvals.filter(a => a.status === 'pending'),
        recentMeetings: meetings.slice(0, 5).sort((a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        ),
        financials,
      });
    } catch (error) {
      console.error("Failed to generate project summary:", error);
      res.status(500).json({ error: "Failed to generate project summary" });
    }
  });
}
