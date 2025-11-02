import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import { useQuery } from "@tanstack/react-query";
import { User as SchemaUser } from "@shared/schema";
import { apiFetch } from "./api";

export interface LoginCredentials {
  username: string;
  password: string;
}

// Re-export the User type from schema
export type User = SchemaUser;

// JWT Token management
const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        console.log("🔍 useAuth: Checking authentication status...");
        const response = await apiFetch("/api/auth/me");

        if (response.status === 401) {
          console.log("❌ useAuth: Not authenticated (401)");
          return null;
        }

        if (!response.ok) {
          console.error("❌ useAuth: Auth check failed with status:", response.status);
          throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        console.log("✅ useAuth: User authenticated:", userData.username, userData.role);
        return userData;
      } catch (error) {
        console.error("❌ useAuth: Auth check error:", error);
        return null;
      }
    },
    staleTime: Infinity,
    retry: false
  });

  console.log("🔐 useAuth hook state:", {
    hasUser: !!user,
    isLoading,
    isAuthenticated: !!user,
    username: user?.username
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

export async function login(credentials: LoginCredentials) {
  console.log("🔑 Login attempt starting...");
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  console.log("📡 Login response status:", response.status);
  if (!response.ok) throw new Error("Invalid username or password");

  const data = await response.json();
  console.log("📦 Login response data:", { ...data, token: data.token ? 'EXISTS' : 'MISSING' });

  // Store JWT token
  if (data.token) {
    console.log("💾 Saving token to localStorage...");
    setToken(data.token);

    // Verify it was saved
    const savedToken = localStorage.getItem('auth_token');
    console.log("✅ Token saved successfully:", savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED TO SAVE');

    if (!savedToken) {
      console.error("❌ CRITICAL: Token was NOT saved to localStorage!");
      throw new Error("Failed to save authentication token");
    }
  } else {
    console.error("❌ No token in login response!");
    throw new Error("No authentication token received");
  }

  console.log("✅ Login successful, returning user data");
  return data;
}

export async function loginWithGoogle() {
  try {
    console.log("Starting Google sign-in popup...");
    const result = await signInWithPopup(auth, provider);
    console.log("Google sign-in successful, user:", result.user.email);

    console.log("Getting ID token...");
    const idToken = await result.user.getIdToken();
    console.log("ID token obtained, length:", idToken.length);

    console.log("Sending token to server...");
    const response = await apiFetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    console.log("Server response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Server authentication failed:", errorData);
      throw new Error(errorData.error || "Failed to authenticate with server");
    }

    const data = await response.json();
    console.log("Authentication successful, redirecting...");

    // Store JWT token
    if (data.token) {
      setToken(data.token);
      console.log("✅ JWT token stored in localStorage");
    }

    // Redirect to dashboard - the router will show the correct dashboard based on role
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
}

export async function logout() {
  try {
    // Sign out from Firebase
    await auth.signOut();
  } catch (error) {
    console.error("Firebase sign-out error:", error);
  }

  // Clear JWT token
  clearToken();

  // Clear backend session (optional, for backward compatibility)
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Redirect to login
  window.location.href = "/login";
}
