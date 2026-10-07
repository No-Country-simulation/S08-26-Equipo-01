import axios, { isAxiosError } from 'axios'
import { ApiError } from '@/shared/api/ApiError'
import { env } from '@/shared/config/env'

interface BackendErrorBody {
  code?: unknown
  message?: unknown
  detail?: unknown
  error?: unknown
}

function getText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
}

function getStatusFallback(status?: number): string {
  if (status === 400) {
    return 'Revisa la información ingresada e inténtalo de nuevo.'
  }
  if (status === 401) {
    return 'No pudimos validar tus credenciales.'
  }
  if (status === 403) {
    return 'No tienes permiso para realizar esta acción.'
  }
  if (status === 404) {
    return 'No encontramos la información solicitada.'
  }
  if (status === 409) {
    return 'La operación no pudo completarse porque existe un conflicto con la información actual.'
  }
  if (status === 422) {
    return 'Algunos datos no son válidos. Revísalos e inténtalo de nuevo.'
  }
  if (status === 429) {
    return 'Has realizado demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }
  if (status && status >= 500) {
    return 'El servidor no pudo completar la solicitud. Inténtalo de nuevo en unos minutos.'
  }
  return 'No fue posible completar la solicitud.'
}

function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return new ApiError('No fue posible completar la solicitud.', {
      cause: error,
    })
  }

  const status = error.response?.status
  const body = error.response?.data as BackendErrorBody | undefined
  const backendMessage = getText(body?.message) ?? getText(body?.detail)

  const message = error.response
    ? backendMessage ?? getStatusFallback(status)
    : error.code === 'ECONNABORTED'
      ? 'La solicitud tardó demasiado. Inténtalo de nuevo.'
      : 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'

  return new ApiError(message, {
    status,
    code: getText(body?.code),
    details: error.response?.data,
    cause: error,
  })
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
