// src/features/board/pages/BoardPage.tsx

import { useState } from 'react'
import type { Task, TaskFormMode, TaskFormValues } from '@/features/tasks/types'
import TaskModal from '@/features/tasks/components/TaskModal/TaskModal'
import Button from '@/components/Button/Button'
import { BOARD_COLUMNS } from '../constants'
import { mockTasks } from '@/mocks/data/task.data'
import BoardColumn from '../components/BoardColumn/BoardColumn'
import styles from './styles.module.css'
import { Plus } from 'lucide-react'

const emptyTaskValues: TaskFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  columnId: 'backlog'
}

function getTaskFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    assignee: task.assignee,
    dueDate: task.dueDate,
    columnId: task.columnId
  }
}

function createTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<TaskFormMode>('create')
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const initialValues = activeTask ? getTaskFormValues(activeTask) : emptyTaskValues

  const handleCreateTask = () => {
    setModalMode('create')
    setActiveTask(null)
    setModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setModalMode('edit')
    setActiveTask(task)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setActiveTask(null)
  }

  const handleSubmitTask = (values: TaskFormValues) => {
    if (modalMode === 'edit' && activeTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === activeTask.id ? { ...task, ...values } : task))
      )
    } else {
      setTasks((currentTasks) => [
        ...currentTasks,
        {
          id: createTaskId(),
          ...values
        }
      ])
    }

    handleCloseModal()
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mini Jira Board</h1>
        </div>

        <Button type='button' className={styles.createButton} onClick={handleCreateTask}>
          <Plus size={16} className={styles.icon} />
          Create task
        </Button>
      </header>

      <div className={styles.grid}>
        {BOARD_COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.columnId === column.id)

          return <BoardColumn key={column.id} column={column} tasks={columnTasks} onEditTask={handleEditTask} />
        })}
      </div>

      <TaskModal
        open={modalOpen}
        mode={modalMode}
        initialValues={initialValues}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTask}
      />
    </main>
  )
}
