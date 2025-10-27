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

    const user = await response.json();
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

    const user = await response.json();
    console.log("Authentication successful, redirecting...");
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

  // Clear backend session
  await apiFetch("/api/auth/logout", {
    method: "POST",
  });

  // Redirect to login
  window.location.href = "/login";
}
