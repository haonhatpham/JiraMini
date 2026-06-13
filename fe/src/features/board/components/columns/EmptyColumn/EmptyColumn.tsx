// src/features/board/components/EmptyColumn.tsx
import styles from './styles.module.css'

export default function EmptyColumn() {
  return (
    <div className={styles.empty}>
      <p>No items yet</p>
    </div>
  )
}
