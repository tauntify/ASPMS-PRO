// API client configuration - reads from environment variable
// Empty string means use relative paths (Firebase Hosting will route /api/** to Cloud Functions)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

  console.log('🔐 apiFetch called:', {
    path,
    url,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
  });

  // Validate JWT token format (should have 3 parts separated by dots)
  const isValidJWT = token && token.split('.').length === 3;
  
  if (token && !isValidJWT) {
    console.error('❌ INVALID JWT TOKEN FORMAT:', token);
    console.error('❌ Clearing corrupted token and redirecting to login...');
    localStorage.removeItem('auth_token');
    
    // Don't redirect if this is the login page or auth check
    if (!path.includes('/auth/login') && !path.includes('/auth/google')) {
      window.location.href = '/login?error=invalid_token';
    }
  }

  // Merge headers with Authorization header if token exists and is valid
  const headers = new Headers(options?.headers);
  if (token && isValidJWT) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('✅ Authorization header set with valid JWT');
  } else if (!token) {
    console.warn('⚠️ NO TOKEN FOUND IN localStorage!');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Keep for backward compatibility with sessions
  });
}
