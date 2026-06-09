import { BOARD_COLUMNS } from '../../constants'
import styles from './styles.module.css'

const SKELETON_TASK_COUNT_BY_COLUMN = 4

function SkeletonTaskCard({ compact = false }: { compact?: boolean }) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={`${styles.skeleton} ${styles.titleLine}`} />
        <div className={`${styles.skeleton} ${styles.badge}`} />
      </header>

      <div className={styles.cardBody}>
        <div className={`${styles.skeleton} ${styles.textLine}`} />
        <div className={`${styles.skeleton} ${compact ? styles.textShort : styles.textLine}`} />
      </div>

      <footer className={styles.cardFooter}>
        <div className={styles.assignee}>
          <div className={`${styles.skeleton} ${styles.avatar}`} />
          <div className={`${styles.skeleton} ${styles.nameLine}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.dateLine}`} />
      </footer>
    </article>
  )
}

export default function BoardPageSkeleton() {
  return (
    <div className={styles.wrapper} aria-hidden='true'>
      <section className={styles.filters}>
        <div className={`${styles.skeleton} ${styles.search}`} />
        <div className={`${styles.skeleton} ${styles.control}`} />
        <div className={`${styles.skeleton} ${styles.control}`} />
        <div className={`${styles.skeleton} ${styles.date}`} />
        <div className={`${styles.skeleton} ${styles.date}`} />
        <div className={`${styles.skeleton} ${styles.clear}`} />
        <div className={`${styles.skeleton} ${styles.result}`} />
      </section>

      <div className={styles.grid}>
        {BOARD_COLUMNS.map((column) => (
          <section key={column.id} className={styles.column}>
            <header className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <div className={`${styles.skeleton} ${styles.dot}`} />
                <div className={`${styles.skeleton} ${styles.columnName}`} />
              </div>
              <div className={`${styles.skeleton} ${styles.count}`} />
            </header>

            <div className={styles.columnContent}>
              {Array.from({ length: SKELETON_TASK_COUNT_BY_COLUMN }).map((_, taskIndex) => (
                <SkeletonTaskCard key={`${column.id}-${taskIndex}`} compact={taskIndex % 2 === 1} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
