/**
 * API Configuration Helper
 *
 * This file determines the correct API base URL based on the environment:
 * - Development (npm run dev): Uses proxy to localhost:5000
 * - Production (deployed): Uses Render backend URL
 */

// Get the API URL from environment variable or use relative path
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// For development, API calls will be proxied through Vite dev server
// For production, set VITE_API_URL in your build environment

/**
 * Makes an API request with the correct base URL
 */
export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: "include", // Important: Include cookies for session management
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  });

  return response;
}

// Export helper to check if we're in development
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Log the API configuration
if (isDevelopment) {
  console.log("🔧 API Config (Development):", { API_BASE_URL, isDevelopment });
} else {
  console.log("🚀 API Config (Production):", { API_BASE_URL, isProduction });
}
