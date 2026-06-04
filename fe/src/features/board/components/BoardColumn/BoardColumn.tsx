import type { BoardColumn as BoardColumnType } from '../../types'
import TaskCard from '@/features/tasks/components/TaskCard/TaskCard'
import type { Task } from '@/features/tasks/types'
import EmptyColumn from '../EmptyColumn/EmptyColumn'
import styles from './styles.module.css'

interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export default function BoardColumn({ column, tasks, onEditTask }: BoardColumnProps) {
  return (
    <section className={styles.column}>
      <header className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <span className={styles.count}>{tasks.length}</span>
      </header>

      <div className={styles.content}>
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEditTask} />)
        ) : (
          <EmptyColumn />
        )}
      </div>
    </section>
  )
}
