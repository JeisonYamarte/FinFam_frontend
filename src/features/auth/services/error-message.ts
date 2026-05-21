import axios from 'axios'

import type { ApiError } from '../../../lib/api/types'

type StatusMessageMap = Partial<Record<number, string>>

export const getErrorMessage = (
  error: unknown,
  fallback: string,
  statusMessages: StatusMessageMap = {},
): string => {
  if (axios.isAxiosError<ApiError>(error)) {
    const status = error.response?.status

    if (!status) {
      return 'No pudimos conectar con el servidor. Intenta nuevamente.'
    }

    const statusMessage = statusMessages[status]

    if (statusMessage) {
      return statusMessage
    }

    if (status === 429) {
      return 'Demasiados intentos. Espera un momento e intenta nuevamente.'
    }

    if (status >= 500) {
      return 'Ocurrio un error interno. Intenta nuevamente en unos minutos.'
    }

    return fallback
  }

  return fallback
}
