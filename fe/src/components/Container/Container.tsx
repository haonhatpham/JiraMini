import type { ComponentPropsWithoutRef, ElementType } from 'react'
import styles from './styles.module.css'

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'

type ContainerPadding = 'none' | 'sm' | 'md' | 'lg'

type ContainerProps<T extends ElementType = 'div'> = {
  as?: T
  size?: ContainerSize
  padding?: ContainerPadding
  className?: string
} & ComponentPropsWithoutRef<T>

export default function Container<T extends ElementType = 'div'>({
  as,
  children,
  size = 'xxl',
  padding = 'md',
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as || 'div'
  const containerClassName = [styles.container, styles[size], styles[`padding-${padding}`], className]
    .filter(Boolean)
    .join(' ')

  return (
    <Component {...props} className={containerClassName}>
      {children}
    </Component>
  )
}
