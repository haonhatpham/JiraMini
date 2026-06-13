// src/features/task/components/TaskForm.tsx

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { doesTaskMatchBoardTaskFilters, type BoardTaskFilters } from '@/features/board/filters/taskFilters'
import { buildTaskPayload, mapApiTask } from '@/features/board/utils/boardTaskMapping'
import { getNextColumnPosition } from '@/features/board/utils/boardTaskMovement'
import { notify } from '@/utils/notify'
import { BOARD_COLUMNS } from '@/features/board/constants'
import { PRIORITY_OPTIONS } from '@/features/tasks/constants'
import { taskFormSchema, type TaskFormData } from '@/features/tasks/schemas/task.schema'
import { taskService } from '@/features/tasks/task.service'
import type { Task, TaskFormMode } from '@/features/tasks/types'
import styles from './style.module.css'

export type TaskAssigneeOption = {
  id: string
  name: string
  email?: string
}

interface TaskFormProps {
  mode: TaskFormMode
  task?: Task | null
  initialValues: TaskFormData
  tasks: Task[]
  filters: BoardTaskFilters
  assigneeOptions: TaskAssigneeOption[]
  onCreated: (task: Task) => void
  onUpdated: (previousTask: Task, task: Task, taskMatchesFilters: boolean, taskWasVisible: boolean) => void
  onSaved: () => void
  onError: (error: unknown) => void
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
}

type TaskFormField = keyof TaskFormData

export default function TaskForm({
  mode,
  task,
  initialValues,
  tasks,
  filters,
  assigneeOptions,
  onCreated,
  onUpdated,
  onSaved,
  onError,
  onCancel,
  onDirtyChange
}: TaskFormProps) {
  const {
    formState: { errors, isDirty, isSubmitting, touchedFields, isSubmitted },
    handleSubmit,
    register
  } = useForm<TaskFormData>({
    defaultValues: initialValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(taskFormSchema)
  })

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const getFieldError = (name: TaskFormField) => {
    const shouldShowError = Boolean(touchedFields[name] || isSubmitted)

    return shouldShowError ? errors[name]?.message : undefined
  }

  const handleFormSubmit = async (values: TaskFormData) => {
    try {
      if (mode === 'edit' && task) {
        const position =
          values.columnId === task.columnId ? task.position : getNextColumnPosition(tasks, values.columnId, task.id)
        const updatedTask = await taskService.updateTask(task.id, buildTaskPayload(values, position))
        const mappedTask = mapApiTask(updatedTask)

        onUpdated(
          task,
          mappedTask,
          doesTaskMatchBoardTaskFilters(mappedTask, filters),
          tasks.some(({ id }) => id === task.id)
        )
        notify.success('Task updated')
        onSaved()
        return
      }

      const position = getNextColumnPosition(tasks, values.columnId)
      const createdTask = await taskService.createTask(buildTaskPayload(values, position))
      const mappedTask = mapApiTask(createdTask)

      if (doesTaskMatchBoardTaskFilters(mappedTask, filters)) {
        onCreated(mappedTask)
      }

      notify.success('Task created')
      onSaved()
    } catch (error) {
      onError(error)
      throw error
    }
  }

  const titleError = getFieldError('title')
  const descriptionError = getFieldError('description')
  const priorityError = getFieldError('priority')
  const assigneeIdError = getFieldError('assigneeId')
  const dueDateError = getFieldError('dueDate')
  const columnIdError = getFieldError('columnId')

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <header className={styles.header}>
        <h2 className={styles.title} id='task-modal-title'>
          {mode === 'create' ? 'Create Task' : 'Edit Task'}
        </h2>
        <p className={styles.description} id='task-modal-description'>
          {mode === 'create' ? 'Add a new task to the board.' : 'Update the selected task information.'}
        </p>
      </header>

      <label className={styles.field}>
        <span>Title</span>
        <input
          {...register('title')}
          data-autofocus
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
        <span>Assigned</span>
        <select
          {...register('assigneeId')}
          aria-describedby={assigneeIdError ? 'task-assignee-error' : undefined}
          aria-invalid={Boolean(assigneeIdError)}
        >
          {assigneeOptions.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.email ? `${assignee.name} (${assignee.email})` : assignee.name}
            </option>
          ))}
        </select>
        {assigneeIdError && <small id='task-assignee-error'>{assigneeIdError}</small>}
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
