import axios, { isAxiosError } from 'axios'
import { ApiError } from '@/shared/api/ApiError'
import { env } from '@/shared/config/env'

interface BackendErrorBody {
  code?: unknown
  message?: unknown
}

function toApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return new ApiError('No fue posible completar la solicitud.', {
      cause: error,
    })
  }

  const body = error.response?.data as BackendErrorBody | undefined
  const message =
    typeof body?.message === 'string' && body.message.trim().length > 0
      ? body.message
      : error.message || 'No fue posible completar la solicitud.'

  return new ApiError(message, {
    status: error.response?.status,
    code: typeof body?.code === 'string' ? body.code : undefined,
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
