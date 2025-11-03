import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface SubscriptionStatus {
  subscription: {
    id: string;
    userId: string;
    status: "trial" | "active" | "expired" | "blocked";
    trialStartDate: string;
    trialEndDate: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    maxEmployees: number;
    maxProjects: number;
    currentEmployees: number;
    currentProjects: number;
    baseFee: number;
    employeeFee: number;
    projectFee: number;
    totalAmount: number;
    lastPaymentDate?: string;
    createdAt: string;
    updatedAt: string;
  };
  status: {
    status: "active" | "warning" | "expired" | "blocked";
    daysRemaining: number;
    message: string;
  };
}

export function useSubscription() {
  return useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/subscription/status");
        if (!response.ok) {
          console.error("Subscription status error:", response.status);
          // Return a default status to prevent infinite loading
          return {
            subscription: {
              id: "default",
              userId: "default",
              status: "active" as const,
              trialStartDate: new Date().toISOString(),
              trialEndDate: new Date().toISOString(),
              maxEmployees: 999,
              maxProjects: 999,
              currentEmployees: 0,
              currentProjects: 0,
              baseFee: 0,
              employeeFee: 0,
              projectFee: 0,
              totalAmount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            status: {
              status: "active" as const,
              daysRemaining: 999,
              message: "Active",
            },
          };
        }
        return response.json();
      } catch (error) {
        console.error("Subscription fetch error:", error);
        // Return default to prevent infinite loading
        return {
          subscription: {
            id: "default",
            userId: "default",
            status: "active" as const,
            trialStartDate: new Date().toISOString(),
            trialEndDate: new Date().toISOString(),
            maxEmployees: 999,
            maxProjects: 999,
            currentEmployees: 0,
            currentProjects: 0,
            baseFee: 0,
            employeeFee: 0,
            projectFee: 0,
            totalAmount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          status: {
            status: "active" as const,
            daysRemaining: 999,
            message: "Active",
          },
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
