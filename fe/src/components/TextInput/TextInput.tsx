import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './styles.module.css'

export type TextInputProps = {
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
} & InputHTMLAttributes<HTMLInputElement>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ fullWidth = true, size = 'md', className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[styles.input, styles[size], fullWidth && styles.full, className].filter(Boolean).join(' ')}
        {...props}
      />
    )
  }
)

TextInput.displayName = 'TextInput'
