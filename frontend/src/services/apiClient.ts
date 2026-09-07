import axios, { isAxiosError } from 'axios'
import { ApiError } from '@/shared/types/apiError'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status
      const data = error.response?.data
      const message =
        typeof data === 'string' && data
          ? data
          : data &&
              typeof data === 'object' &&
              'message' in data &&
              typeof (data as { message: unknown }).message === 'string'
            ? (data as { message: string }).message
            : error.message
      return Promise.reject(new ApiError(message, status, data))
    }
    return Promise.reject(new ApiError('Error de red'))
  },
)

export default apiClient
