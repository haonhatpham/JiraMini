export const ErrorCode = {
  ValidationError: 'VALIDATION_ERROR',
  TokenExpired: 'TOKEN_EXPIRED',
  InvalidToken: 'INVALID_TOKEN',
  Unknown: 'UNKNOWN_ERROR',
  RequestCanceled: 'REQUEST_CANCELED'
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]
