import type { ElementType, ReactNode } from 'react'

import styles from './styles.module.css'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonWidth = 'auto' | 'full'

export type ButtonProps<T extends ElementType = 'button'> = {
  as?: T

  children?: ReactNode

  variant?: ButtonVariant

  loading?: boolean

  width?: ButtonWidth

  className?: string
} & React.ComponentPropsWithoutRef<T>

export default function Button<T extends ElementType = 'button'>({
  as,

  children,

  variant = 'primary',

  loading,

  width = 'auto',

  className,

  ...props
}: ButtonProps<T>) {
  const Component = as || 'button'

  return (
    <Component
      {...props}
      disabled={props.disabled || loading}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${width === 'full' ? styles.full : ''}
        ${loading ? styles.loading : ''}
        ${className ?? ''}
      `}
    >
      {loading ? <Loader2 className={styles.loader} /> : children}
    </Component>
  )
}
