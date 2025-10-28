// API client configuration - reads from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aspms-pro-backend.onrender.com';

// Debug logging
console.log('🔧 API Configuration:', {
  API_BASE_URL,
  fromEnv: !!import.meta.env.VITE_API_URL,
  env: import.meta.env.MODE
});

/**
 * Helper function to construct full API URLs
 * In development, uses relative paths (handled by Vite proxy)
 * In production, uses the full backend URL from env variable
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If API_BASE_URL is empty (dev), return the path as-is for proxy
  if (!API_BASE_URL) {
    console.log('⚠️ No API_BASE_URL set, using relative path:', `/${cleanPath}`);
    return `/${cleanPath}`;
  }

  // In production, use full URL
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  console.log('✅ Using full API URL:', fullUrl);
  return fullUrl;
}

/**
 * Enhanced fetch that automatically uses the correct API URL
 * and includes JWT token if available
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);

  // Get JWT token from localStorage
  const token = localStorage.getItem('auth_token');

  // Merge headers with Authorization header if token exists
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Keep for backward compatibility with sessions
  });
}
