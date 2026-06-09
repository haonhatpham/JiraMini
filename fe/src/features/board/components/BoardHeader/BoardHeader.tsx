import { Plus } from 'lucide-react'
import Button from '@/components/Button/Button'
import styles from './styles.module.css'

type BoardHeaderProps = {
  onCreateTask: () => void
}

export default function BoardHeader({ onCreateTask }: BoardHeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden='true'>
          <span />
          <span />
          <span />
          <span />
        </span>
        <h1 className={styles.title}>Mini Jira Board</h1>
      </div>

      <div className={styles.actions}>
        <Button type='button' className={styles.createButton} onClick={onCreateTask}>
          <Plus size={15} className={styles.icon} />
          Create task
        </Button>
      </div>
    </header>
  )
}
