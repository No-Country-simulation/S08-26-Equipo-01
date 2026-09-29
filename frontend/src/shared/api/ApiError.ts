export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(
    message: string,
    options: {
      status?: number
      code?: string
      details?: unknown
      cause?: unknown
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
  }
}
