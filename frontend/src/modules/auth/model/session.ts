import { z } from 'zod'
import {
  ACCOUNT_TYPES,
  SYSTEM_ROLES,
  type AuthSession,
  type LoginResponseDto,
} from '../types/auth.types'

const jwtClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  accountType: z.enum(ACCOUNT_TYPES),
  roles: z.array(z.enum(SYSTEM_ROLES)).default([]),
  exp: z.number().int().positive(),
})

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().min(1),
  expiresAt: z.number().int().positive(),
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    accountType: z.enum(ACCOUNT_TYPES),
    roles: z.array(z.enum(SYSTEM_ROLES)),
  }),
})

function decodeJwtPayload(token: string): unknown {
  const parts = token.split('.')

  if (parts.length !== 3 || !parts[1]) {
    throw new Error('El token de acceso recibido no es válido.')
  }

  const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  try {
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    )
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new Error('No fue posible leer la sesión recibida.')
  }
}

export function createAuthSession(response: LoginResponseDto): AuthSession {
  const claims = jwtClaimsSchema.safeParse(
    decodeJwtPayload(response.accessToken),
  )

  if (!claims.success) {
    throw new Error('La sesión recibida no contiene datos de acceso válidos.')
  }

  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType || 'Bearer',
    expiresAt: claims.data.exp * 1000,
    user: {
      id: claims.data.sub,
      email: claims.data.email,
      accountType: claims.data.accountType,
      roles: claims.data.roles,
    },
  }
}

export function isSessionActive(
  session: AuthSession,
  now = Date.now(),
): boolean {
  return session.expiresAt > now
}
