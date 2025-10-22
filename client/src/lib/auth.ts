import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "./queryClient";
import { User } from "@shared/schema";

export type { User } from "@shared/schema";

export interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const res = await apiRequest("POST", "/api/auth/login", credentials);
  const user = await res.json();
  
  queryClient.setQueryData(["/api/auth/me"], user);
  
  return user;
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
  
  queryClient.setQueryData(["/api/auth/me"], null);
  queryClient.clear();
}
