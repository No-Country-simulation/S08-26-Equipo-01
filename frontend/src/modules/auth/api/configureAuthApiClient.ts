import { ApiError } from '@/shared/api/ApiError'
import { apiClient } from '@/shared/api/apiClient'
import { clearCurrentSession, getCurrentSession } from '../store/sessionStore'
import { isSessionActive } from '../model/session'

interface AuthApiClientOptions {
  onUnauthorized?: () => void
}

const PUBLIC_API_PATHS = new Set([
  '/auth/register',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/customer-invitations/resolve',
  '/customer-invitations/accept',
  '/customer-invitations/complete-registration',
  '/internal/invitations/resolve',
  '/internal/invitations/accept',
])

let configured = false

function isPublicApiRequest(url?: string): boolean {
  if (!url) return false

  const queryIndex = url.indexOf('?')
  const path = queryIndex >= 0 ? url.slice(0, queryIndex) : url
  return PUBLIC_API_PATHS.has(path)
}

export function configureAuthApiClient(
  options: AuthApiClientOptions = {},
): void {
  if (configured) return
  configured = true

  apiClient.interceptors.request.use((config) => {
    if (isPublicApiRequest(config.url)) {
      config.headers.delete('Authorization')
      return config
    }

    const session = getCurrentSession()

    if (!session) return config

    if (!isSessionActive(session)) {
      clearCurrentSession()
      return config
    }

    config.headers.set(
      'Authorization',
      `${session.tokenType} ${session.accessToken}`,
    )

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearCurrentSession()
        options.onUnauthorized?.()
      }

      return Promise.reject(error)
    },
  )
}
