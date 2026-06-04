// src/features/task/components/TaskModal.tsx

import type { TaskFormMode, TaskFormValues } from '../../types'
import TaskForm from '../../components/TaskForm/TaskForm'
import styles from './style.module.css'

interface TaskModalProps {
  open: boolean
  mode: TaskFormMode
  initialValues: TaskFormValues
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void | Promise<void>
}

export default function TaskModal({ open, mode, initialValues, onClose, onSubmit }: TaskModalProps) {
  if (!open) {
    return null
  }

  const formKey = [
    mode,
    initialValues.title,
    initialValues.description,
    initialValues.priority,
    initialValues.assignee,
    initialValues.dueDate,
    initialValues.columnId
  ].join('|')

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section
        className={styles.modal}
        role='dialog'
        aria-modal='true'
        aria-labelledby='task-modal-title'
        onClick={(event) => event.stopPropagation()}
      >
        <button type='button' className={styles.closeButton} onClick={onClose} aria-label='Close modal'>
          ×
        </button>

        <TaskForm key={formKey} mode={mode} initialValues={initialValues} onSubmit={onSubmit} onCancel={onClose} />
      </section>
    </div>
  )
}
