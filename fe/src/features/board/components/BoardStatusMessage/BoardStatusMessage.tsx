import type { ReactNode } from 'react'
import styles from './styles.module.css'

type BoardStatusMessageProps = {
  children: ReactNode
  tone?: 'default' | 'error'
}

export default function BoardStatusMessage({ children, tone = 'default' }: BoardStatusMessageProps) {
  return <p className={`${styles.message} ${tone === 'error' ? styles.error : ''}`}>{children}</p>
}
