export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

type ToastInput =
  | string
  | {
      title: string
      description?: string
      variant?: ToastVariant
      duration?: number
    }
type ToastListener = () => void

const DEFAULT_DURATION_MS = 4000
const listeners = new Set<ToastListener>()
let toasts: Toast[] = []

function createToast(input: ToastInput, variant: ToastVariant): Toast {
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

  if (typeof input === 'string') {
    return {
      id,
      title: input,
      variant,
      duration: DEFAULT_DURATION_MS
    }
  }

  return {
    ...input,
    id,
    variant: input.variant ?? variant,
    duration: input.duration ?? DEFAULT_DURATION_MS
  }
}

function emitChange(): void {
  listeners.forEach((listener) => listener())
}

function addToast(input: ToastInput, variant: ToastVariant): string {
  const toast = createToast(input, variant)
  toasts = [toast, ...toasts].slice(0, 5)
  emitChange()

  if (toast.duration > 0) {
    window.setTimeout(() => {
      dismissToast(toast.id)
    }, toast.duration)
  }

  return toast.id
}

function dismissToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id)
  emitChange()
}

function clearToasts(): void {
  toasts = []
  emitChange()
}

export function subscribeToToasts(listener: ToastListener): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getToasts(): Toast[] {
  return toasts
}

export const notify = {
  success: (input: ToastInput) => addToast(input, 'success'),
  error: (input: ToastInput) => addToast(input, 'error'),
  info: (input: ToastInput) => addToast(input, 'info'),
  warning: (input: ToastInput) => addToast(input, 'warning'),
  dismiss: dismissToast,
  clear: clearToasts
}
