import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getToasts, notify, subscribeToToasts, type Toast, type ToastVariant } from '@/utils/notify'
import styles from './styles.module.css'

const TOAST_LABELS: Record<ToastVariant, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning'
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>(() => getToasts())

  useEffect(() => {
    return subscribeToToasts(() => {
      setToasts(getToasts())
    })
  }, [])

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className={styles.viewport} role='region' aria-label='Notifications'>
      {toasts.map((toast) => (
        <section
          key={toast.id}
          className={`${styles.toast} ${styles[toast.variant]}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
        >
          <div className={styles.content}>
            <span className={styles.kicker}>{TOAST_LABELS[toast.variant]}</span>
            <strong className={styles.title}>{toast.title}</strong>
            {toast.description && <p className={styles.description}>{toast.description}</p>}
          </div>

          <button
            type='button'
            className={styles.closeButton}
            onClick={() => notify.dismiss(toast.id)}
            aria-label='Dismiss notification'
          >
            <X size={15} />
          </button>
        </section>
      ))}
    </div>
  )
}
