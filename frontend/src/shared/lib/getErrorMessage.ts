import { ApiError } from '@/shared/api/ApiError'

function getRawHttpErrorFallback(message: string): string | null {
  const statusMatch = message.match(/Request failed with status code (\d{3})/i)

  if (statusMatch) {
    const status = Number(statusMatch[1])

    if (status === 401) return 'No pudimos validar tus credenciales.'
    if (status === 403) return 'No tienes permiso para realizar esta acción.'
    if (status === 404) return 'No encontramos la información solicitada.'
    if (status === 409) {
      return 'La operación no pudo completarse porque existe un conflicto con la información actual.'
    }
    if (status === 429) {
      return 'Has realizado demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
    }
    if (status >= 500) {
      return 'El servidor no pudo completar la solicitud. Inténtalo de nuevo en unos minutos.'
    }

    return 'No fue posible completar la solicitud. Revisa los datos e inténtalo de nuevo.'
  }

  if (/network error/i.test(message)) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
  }

  if (/timeout|econnaborted/i.test(message)) {
    return 'La solicitud tardó demasiado. Inténtalo de nuevo.'
  }

  return null
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message

  if (error instanceof Error) {
    return getRawHttpErrorFallback(error.message) ?? error.message
  }

  return 'Ocurrió un error inesperado.'
}
