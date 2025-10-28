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
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiFetch("/api/auth/me");

        if (response.status === 401) {
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        return await response.json();
      } catch (error) {
        console.error("Auth check failed:", error);
        return null;
      }
    },
    staleTime: Infinity,
    retry: false
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) throw new Error("Invalid username or password");

    const data = await response.json();

    // Store JWT token
    if (data.token) {
      setToken(data.token);
      console.log("✅ JWT token stored in localStorage");
    }

    // Redirect to root - the router will show the correct dashboard based on role
    window.location.href = "/";
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
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

    // Redirect to root - the router will show the correct dashboard based on role
    window.location.href = "/";
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
