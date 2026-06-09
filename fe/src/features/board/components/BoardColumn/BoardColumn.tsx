import type { BoardColumn as BoardColumnType } from '../../types'
import { useDroppable } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import TaskCard from '@/features/tasks/components/TaskCard/TaskCard'
import type { Task } from '@/features/tasks/types'
import EmptyColumn from '../EmptyColumn/EmptyColumn'
import styles from './styles.module.css'

interface BoardColumnProps {
  column: BoardColumnType
  tasks: Task[]
  indexTasks?: Task[]
  totalTasks: number
  loadingMore: boolean
  onDragCancel: () => void
  onOpenTask: (task: Task) => void
  onLoadMore: () => void
}

interface SortableTaskCardProps {
  index: number
  task: Task
  onDragCancel: () => void
  onOpenTask: (task: Task) => void
}

function SortableTaskCard({ index, task, onDragCancel, onOpenTask }: SortableTaskCardProps) {
  const { isDragging, isDragSource, ref } = useSortable({
    id: task.id,
    index,
    group: task.columnId,
    type: 'task',
    accept: 'task',
    data: {
      columnId: task.columnId,
      taskId: task.id
    }
  })

  return (
    <div ref={ref} className={`${styles.sortableTask} ${isDragSource ? styles.dragSource : ''}`}>
      <TaskCard task={task} onOpen={isDragging ? onDragCancel : onOpenTask} />
    </div>
  )
}

export default function BoardColumn({
  column,
  tasks,
  indexTasks = tasks,
  totalTasks,
  loadingMore,
  onDragCancel,
  onOpenTask,
  onLoadMore
}: BoardColumnProps) {
  const { isDropTarget, ref } = useDroppable({
    id: column.id,
    accept: 'task',
    type: 'column',
    data: {
      columnId: column.id
    }
  })
  const hasMoreTasks = tasks.length < totalTasks
  const countLabel = totalTasks > tasks.length ? `${tasks.length}/${totalTasks}` : totalTasks

  return (
    <section ref={ref} className={`${styles.column} ${isDropTarget ? styles.columnOver : ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        <span className={styles.count}>{countLabel}</span>
      </header>

      <div className={styles.content}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              index={Math.max(
                indexTasks.findIndex((indexedTask) => indexedTask.id === task.id),
                0
              )}
              task={task}
              onDragCancel={onDragCancel}
              onOpenTask={onOpenTask}
            />
          ))
        ) : (
          <EmptyColumn />
        )}
      </div>

      {hasMoreTasks && (
        <footer className={styles.footer}>
          <button
            type='button'
            className={styles.loadMoreButton}
            onClick={onLoadMore}
            disabled={loadingMore}
            aria-label={`Load more ${column.title} tasks`}
          >
            {loadingMore ? 'Loading...' : `Load more (${totalTasks - tasks.length})`}
          </button>
        </footer>
      )}
    </section>
  )
}
