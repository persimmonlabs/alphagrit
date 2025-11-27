/**
 * Admin Authentication Utilities
 * Mock authentication system using localStorage for demo purposes
 */

/**
 * Stores the admin authentication token in localStorage
 * @param token - The authentication token to store
 */
export function setAdminToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
  }
}

/**
 * Retrieves the admin authentication token from localStorage
 * @returns The stored token or null if not authenticated
 */
export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

/**
 * Checks if the admin is currently authenticated
 * @returns true if authenticated, false otherwise
 */
export function isAdminAuthenticated(): boolean {
  return getAdminToken() !== null;
}

/**
 * Mock admin login function for demo purposes
 * Production implementation should use secure API endpoints
 * @param email - Admin email address
 * @param password - Admin password
 * @returns true if login successful, false otherwise
 */
export function mockAdminLogin(email: string, password: string): boolean {
  // Demo credentials: admin@alphagrit.com / password123
  // TODO: Replace with actual API authentication in production
  if (email === 'admin@alphagrit.com' && password === 'password123') {
    setAdminToken('mock_admin_token_' + Date.now());
    return true;
  }
  return false;
}

/**
 * Logs out the admin user by removing the authentication token
 */
export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
  }
}
