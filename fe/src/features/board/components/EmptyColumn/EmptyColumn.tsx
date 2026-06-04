// src/features/board/components/EmptyColumn.tsx
import styles from './styles.module.css'

export default function EmptyColumn() {
  return (
    <div className={styles.emptyColumn}>
      <p>No items yet</p>
    </div>
  )
}
