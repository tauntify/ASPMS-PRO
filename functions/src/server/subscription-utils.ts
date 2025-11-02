import { Subscription } from "@shared/schema";

export const SUBSCRIPTION_CONFIG = {
  TRIAL_DAYS: 3,
  BASE_FEE: 50, // $50 base account fee for custom plan
  EMPLOYEE_FEE: 10, // $10 per employee
  PROJECT_FEE: 5, // $5 per project
  WARNING_DAYS: 2, // Show warning 2 days before expiry

  INDIVIDUAL_PLAN: {
    MAX_EMPLOYEES: 0,
    MAX_PROJECTS: 5,
    MAX_ACCOUNTS: 1,
    PRICE: 10,
  },

  CUSTOM_PLAN: {
    BASE_EMPLOYEES: 5,
    BASE_PROJECTS: 10,
    BASE_ACCOUNTS: 5,
    BASE_PRICE: 50,
    EMPLOYEE_FEE: 10,
    PROJECT_FEE: 5,
  },

  ORGANIZATION_PLAN: {
    MAX_EMPLOYEES: 30,
    MAX_PROJECTS: 50,
    MAX_ACCOUNTS: -1, // Unlimited
    PRICE: 300,
  },
};

export function createTrialSubscription(userId: string): Omit<Subscription, 'id'> {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + SUBSCRIPTION_CONFIG.TRIAL_DAYS);

  return {
    userId,
    status: "trial",
    trialStartDate: now,
    trialEndDate: trialEnd,
    maxEmployees: 0,
    maxProjects: 0,
    currentEmployees: 0,
    currentProjects: 0,
    baseFee: SUBSCRIPTION_CONFIG.BASE_FEE,
    employeeFee: SUBSCRIPTION_CONFIG.EMPLOYEE_FEE,
    projectFee: SUBSCRIPTION_CONFIG.PROJECT_FEE,
    totalAmount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function calculateSubscriptionAmount(maxEmployees: number, maxProjects: number): number {
  return SUBSCRIPTION_CONFIG.BASE_FEE +
         (maxEmployees * SUBSCRIPTION_CONFIG.EMPLOYEE_FEE) +
         (maxProjects * SUBSCRIPTION_CONFIG.PROJECT_FEE);
}

export function getSubscriptionStatus(subscription: Subscription): {
  status: 'active' | 'warning' | 'expired' | 'blocked';
  daysRemaining: number;
  message: string;
} {
  const now = new Date();

  if (subscription.status === 'blocked') {
    return {
      status: 'blocked',
      daysRemaining: 0,
      message: 'Your account has been blocked. Please purchase a package to continue.'
    };
  }

  if (subscription.status === 'trial') {
    const daysRemaining = Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return {
        status: 'expired',
        daysRemaining: 0,
        message: 'Your free trial has expired. Purchase a package to continue using ARKA Services.'
      };
    } else if (daysRemaining <= SUBSCRIPTION_CONFIG.WARNING_DAYS) {
      return {
        status: 'warning',
        daysRemaining,
        message: `Your free trial expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}. Purchase a package to keep your data and continue.`
      };
    } else {
      return {
        status: 'active',
        daysRemaining,
        message: `Free trial: ${daysRemaining} days remaining`
      };
    }
  }

  if (subscription.status === 'active' && subscription.subscriptionEndDate) {
    const daysRemaining = Math.ceil((subscription.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return {
        status: 'expired',
        daysRemaining: 0,
        message: 'Your subscription has expired. Renew to continue.'
      };
    } else if (daysRemaining <= 7) {
      return {
        status: 'warning',
        daysRemaining,
        message: `Your subscription expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`
      };
    } else {
      return {
        status: 'active',
        daysRemaining,
        message: `Active subscription: ${daysRemaining} days remaining`
      };
    }
  }

  return {
    status: 'expired',
    daysRemaining: 0,
    message: 'No active subscription'
  };
}

export function canAddEmployee(subscription: Subscription): boolean {
  if (subscription.status === 'blocked') return false;
  if (subscription.status === 'trial') return false; // No employees during trial
  return subscription.currentEmployees < subscription.maxEmployees;
}

export function canAddProject(subscription: Subscription): boolean {
  if (subscription.status === 'blocked') return false;
  if (subscription.status === 'trial') return false; // No projects during trial
  return subscription.currentProjects < subscription.maxProjects;
}

export function canExportPDF(subscription: Subscription): boolean {
  // PDF export only available for paid subscriptions
  return subscription.status === 'active';
}

export function canExportExcel(subscription: Subscription): boolean {
  // Excel export only available for paid subscriptions
  return subscription.status === 'active';
}

export function needsWatermark(subscription: Subscription): boolean {
  // Watermark on trial exports
  return subscription.status === 'trial';
}
