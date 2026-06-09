import type { ApiError } from '@/api/api'

// Normalizes unknown errors into text that can be shown to users.
export function getErrorMessage(error: unknown): string {
  return (error as ApiError | undefined)?.message ?? 'Something went wrong'
}
