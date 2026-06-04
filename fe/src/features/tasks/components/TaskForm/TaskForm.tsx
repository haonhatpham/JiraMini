// src/features/task/components/TaskForm.tsx

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { BOARD_COLUMNS } from '../../../board/constants'
import { PRIORITY_OPTIONS } from '../../constants'
import { taskFormSchema } from '../../schemas/task.schema'
import type { TaskFormMode, TaskFormValues } from '../../types'
import styles from './style.module.css'

interface TaskFormProps {
  mode: TaskFormMode
  initialValues: TaskFormValues
  onSubmit: (values: TaskFormValues) => void | Promise<void>
  onCancel: () => void
}

type TaskFormField = keyof TaskFormValues

export default function TaskForm({ mode, initialValues, onSubmit, onCancel }: TaskFormProps) {
  const {
    formState: { errors, isSubmitting, touchedFields, isSubmitted },
    handleSubmit,
    register
  } = useForm<TaskFormValues>({
    defaultValues: initialValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(taskFormSchema)
  })

  const getFieldError = (name: TaskFormField) => {
    const shouldShowError = Boolean(touchedFields[name] || isSubmitted)

    return shouldShowError ? errors[name]?.message : undefined
  }

  const titleError = getFieldError('title')
  const descriptionError = getFieldError('description')
  const priorityError = getFieldError('priority')
  const assigneeError = getFieldError('assignee')
  const dueDateError = getFieldError('dueDate')
  const columnIdError = getFieldError('columnId')

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className={styles.header}>
        <h2 className={styles.title} id='task-modal-title'>
          {mode === 'create' ? 'Create Task' : 'Edit Task'}
        </h2>
        <p className={styles.description}>
          {mode === 'create' ? 'Add a new task to the board.' : 'Update the selected task information.'}
        </p>
      </header>

      <label className={styles.field}>
        <span>Title</span>
        <input
          {...register('title')}
          aria-describedby={titleError ? 'task-title-error' : undefined}
          aria-invalid={Boolean(titleError)}
          placeholder='Enter task title'
        />
        {titleError && <small id='task-title-error'>{titleError}</small>}
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          {...register('description')}
          aria-describedby={descriptionError ? 'task-description-error' : undefined}
          aria-invalid={Boolean(descriptionError)}
          placeholder='Enter task description'
          rows={4}
        />
        {descriptionError && <small id='task-description-error'>{descriptionError}</small>}
      </label>

      <label className={styles.field}>
        <span>Priority</span>
        <select
          {...register('priority')}
          aria-describedby={priorityError ? 'task-priority-error' : undefined}
          aria-invalid={Boolean(priorityError)}
        >
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>
        {priorityError && <small id='task-priority-error'>{priorityError}</small>}
      </label>

      <label className={styles.field}>
        <span>Assignee</span>
        <input
          {...register('assignee')}
          aria-describedby={assigneeError ? 'task-assignee-error' : undefined}
          aria-invalid={Boolean(assigneeError)}
          placeholder='Enter assignee name'
        />
        {assigneeError && <small id='task-assignee-error'>{assigneeError}</small>}
      </label>

      <label className={styles.field}>
        <span>Due date</span>
        <input
          {...register('dueDate')}
          aria-describedby={dueDateError ? 'task-due-date-error' : undefined}
          aria-invalid={Boolean(dueDateError)}
          type='date'
        />
        {dueDateError && <small id='task-due-date-error'>{dueDateError}</small>}
      </label>

      <label className={styles.field}>
        <span>Column</span>
        <select
          {...register('columnId')}
          aria-describedby={columnIdError ? 'task-column-error' : undefined}
          aria-invalid={Boolean(columnIdError)}
        >
          {BOARD_COLUMNS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
        {columnIdError && <small id='task-column-error'>{columnIdError}</small>}
      </label>

      <div className={styles.actions}>
        <button type='button' className={styles.cancelButton} onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>

        <button type='submit' className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
