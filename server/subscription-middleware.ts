import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { getSubscriptionStatus } from "./subscription-utils";

export async function checkSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // System admin bypasses subscription checks
    if (user.role === "admin") {
      return next();
    }

    // Get user's subscription
    const subscription = await storage.getSubscriptionByUserId(user.id);

    if (!subscription) {
      return res.status(403).json({
        error: "No subscription found",
        message: "Please contact support to activate your account.",
      });
    }

    // Check subscription status
    const status = getSubscriptionStatus(subscription);

    // Block if subscription is blocked or expired
    if (status.status === "blocked") {
      return res.status(403).json({
        error: "Account blocked",
        message: status.message,
        subscriptionStatus: status,
      });
    }

    if (status.status === "expired") {
      // Update subscription to blocked if trial expired
      if (subscription.status === "trial") {
        await storage.updateSubscription(subscription.id, { status: "blocked" });
      }

      return res.status(403).json({
        error: "Subscription expired",
        message: status.message,
        subscriptionStatus: status,
      });
    }

    // Attach subscription info to request for use in routes
    req.subscription = subscription;
    req.subscriptionStatus = status;

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({ error: "Failed to verify subscription" });
  }
}

// Middleware to check if user can add employees
export async function checkCanAddEmployee(req: Request, res: Response, next: NextFunction) {
  const subscription = req.subscription;

  if (!subscription) {
    return res.status(403).json({
      error: "No subscription found",
      message: "Please purchase a package to add employees.",
    });
  }

  if (subscription.status === "trial") {
    return res.status(403).json({
      error: "Feature not available during trial",
      message: "Please purchase a package to add employees.",
    });
  }

  if (subscription.currentEmployees >= subscription.maxEmployees) {
    return res.status(403).json({
      error: "Employee limit reached",
      message: `You have reached your employee limit of ${subscription.maxEmployees}. Please upgrade your package.`,
    });
  }

  next();
}

// Middleware to check if user can add projects
export async function checkCanAddProject(req: Request, res: Response, next: NextFunction) {
  const subscription = req.subscription;

  if (!subscription) {
    return res.status(403).json({
      error: "No subscription found",
      message: "Please purchase a package to add projects.",
    });
  }

  if (subscription.status === "trial") {
    return res.status(403).json({
      error: "Feature not available during trial",
      message: "Please purchase a package to add projects.",
    });
  }

  if (subscription.currentProjects >= subscription.maxProjects) {
    return res.status(403).json({
      error: "Project limit reached",
      message: `You have reached your project limit of ${subscription.maxProjects}. Please upgrade your package.`,
    });
  }

  next();
}

// Middleware to check if user can export PDF
export async function checkCanExportPDF(req: Request, res: Response, next: NextFunction) {
  const subscription = req.subscription;

  if (!subscription) {
    return res.status(403).json({
      error: "No subscription found",
      message: "Please purchase a package to export PDF.",
    });
  }

  if (subscription.status !== "active") {
    return res.status(403).json({
      error: "PDF export not available",
      message: "PDF export is only available with an active subscription. Please purchase a package.",
    });
  }

  next();
}

// Middleware to check if user can export Excel
export async function checkCanExportExcel(req: Request, res: Response, next: NextFunction) {
  const subscription = req.subscription;

  if (!subscription) {
    return res.status(403).json({
      error: "No subscription found",
      message: "Please purchase a package to export Excel.",
    });
  }

  if (subscription.status !== "active") {
    return res.status(403).json({
      error: "Excel export not available",
      message: "Excel export is only available with an active subscription. Please purchase a package.",
    });
  }

  next();
}

// Extend Express Request type to include subscription
declare global {
  namespace Express {
    interface Request {
      subscription?: any;
      subscriptionStatus?: {
        status: 'active' | 'warning' | 'expired' | 'blocked';
        daysRemaining: number;
        message: string;
      };
    }
  }
}
