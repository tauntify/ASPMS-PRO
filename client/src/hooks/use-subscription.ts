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
      const response = await apiRequest("/api/subscription/status");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
