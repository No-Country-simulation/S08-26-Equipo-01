import type { AuthenticatedUser } from '../types/auth.types'

const PUBLIC_DEMO_EMAILS = new Set([
  'admin.demo@qualitytrack.com',
  'cliente.demo@qualitytrack.com',
])

export function isPublicDemoAccount(
  user: Pick<AuthenticatedUser, 'email'>,
): boolean {
  return PUBLIC_DEMO_EMAILS.has(user.email.trim().toLowerCase())
}
