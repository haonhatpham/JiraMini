import { forwardRef, type TextareaHTMLAttributes } from 'react'
import styles from './styles.module.css'

export type TextAreaProps = {
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ fullWidth = true, size = 'md', className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={[styles.textarea, styles[size], fullWidth && styles.full, className].filter(Boolean).join(' ')}
        {...props}
      />
    )
  }
)

TextArea.displayName = 'TextArea'
