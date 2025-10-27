// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Debug logging
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD
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
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...options,
    credentials: 'include', // Important for session cookies
  });
}
