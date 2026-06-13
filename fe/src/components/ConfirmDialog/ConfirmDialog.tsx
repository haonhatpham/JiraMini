import { useId, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Button from '@/components/Button/Button'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import styles from './styles.module.css'

type ConfirmDialogVariant = 'default' | 'danger'
type InitialFocus = 'cancel' | 'confirm'

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: ConfirmDialogVariant
  initialFocus?: InitialFocus
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'default',
  initialFocus = 'cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap({
    open,
    containerRef: dialogRef
  })

  const handleCancel = () => {
    if (!loading) {
      onCancel()
    }
  }

  useKeyboardShortcut({
    key: 'Escape',
    enabled: open && !loading,
    ignoreEditable: false,
    onKeyDown: handleCancel
  })

  if (!open) {
    return null
  }

  return (
    <div className={styles.root}>
      <div className={styles.overlay} onClick={handleCancel} />

      <div
        ref={dialogRef}
        className={styles.dialog}
        role='alertdialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <button
          type='button'
          className={styles.close}
          onClick={handleCancel}
          disabled={loading}
          aria-label='Close confirmation dialog'
        >
          <X size={18} />
        </button>

        <div className={`${styles.icon} ${variant === 'danger' ? styles.dangerIcon : ''}`} aria-hidden='true'>
          <AlertTriangle size={26} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          <p className={styles.description} id={descriptionId}>
            {description}
          </p>
        </div>

        <div className={styles.footer}>
          <Button
            type='button'
            variant='secondary'
            onClick={handleCancel}
            disabled={loading}
            data-autofocus={initialFocus === 'cancel' ? true : undefined}
          >
            {cancelText}
          </Button>
          <Button
            type='button'
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            data-autofocus={initialFocus === 'confirm' ? true : undefined}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
