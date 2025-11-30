/**
 * @deprecated This file is deprecated. Admin authentication now uses Supabase.
 * See app/admin/login/page.tsx for the actual implementation.
 *
 * These functions are kept for backwards compatibility but should not be used.
 */

export function setAdminToken(_token: string): void {
  console.warn('[DEPRECATED] setAdminToken is deprecated. Use Supabase auth instead.')
}

export function getAdminToken(): string | null {
  console.warn('[DEPRECATED] getAdminToken is deprecated. Use Supabase auth instead.')
  return null
}

export function isAdminAuthenticated(): boolean {
  console.warn('[DEPRECATED] isAdminAuthenticated is deprecated. Use Supabase auth instead.')
  return false
}

export function mockAdminLogin(_email: string, _password: string): boolean {
  console.warn('[DEPRECATED] mockAdminLogin is deprecated. Use Supabase auth instead.')
  return false
}

export function logoutAdmin(): void {
  console.warn('[DEPRECATED] logoutAdmin is deprecated. Use Supabase auth instead.')
}
