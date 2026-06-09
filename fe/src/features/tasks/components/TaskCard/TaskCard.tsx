// src/features/task/components/TaskCard.tsx

import { PRIORITY_CLASS_NAMES, PRIORITY_LABELS } from '../../constants'
import type { Task } from '../../types'
import { isOverdue } from '../../utils'
import styles from './style.module.css'

interface TaskCardProps {
  task: Task
  onOpen?: (task: Task) => void
}

export default function TaskCard({ task, onOpen }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate)
  const clickable = Boolean(onOpen)

  return (
    <article
      className={`${styles.card} ${clickable ? styles.clickable : ''} ${overdue ? styles.overdue : ''}`}
      onClick={onOpen ? () => onOpen(task) : undefined}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{task.title}</h3>

        <span className={`${styles.priorityBadge} ${styles[PRIORITY_CLASS_NAMES[task.priority]]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </header>

      <p className={styles.description}>{task.description}</p>

      <footer className={styles.footer}>
        <div className={styles.assignee}>
          <span className={styles.avatar}>{task.assignee.charAt(0)}</span>
          <span>{task.assignee}</span>
        </div>

        {task.dueDate && (
          <time className={`${styles.dueDate} ${overdue ? styles.overdueText : ''}`} dateTime={task.dueDate}>
            {task.dueDate}
          </time>
        )}
      </footer>
    </article>
  )
}
