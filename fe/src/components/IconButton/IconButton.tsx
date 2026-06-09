import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import styles from './styles.module.css'

type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'danger'

type IconButtonProps<T extends ElementType = 'button'> = {
  as?: T
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
  variant?: IconButtonVariant
  className?: string
} & ComponentPropsWithoutRef<T>

export default function IconButton<T extends ElementType = 'button'>({
  as,
  children,
  size = 'md',
  active,
  variant = 'default',
  className,
  ...props
}: IconButtonProps<T>) {
  const Component = as || 'button'

  return (
    <Component
      className={[styles.button, styles[size], styles[variant], active ? styles.active : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  )
}
