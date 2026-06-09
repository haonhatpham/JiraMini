// src/features/task/components/TaskModal.tsx

import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, type ForwardedRef } from 'react'
import { X } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog'
import type { BoardTaskFilters } from '@/features/board/filters/taskFilters'
import { createAssigneeOptions } from '@/features/board/utils/boardTasks'
import { useFocusTrap } from '@/hook/useFocusTrap'
import { useKeyboardShortcut } from '@/hook/useKeyboardShortcut'
import type { Task, TaskFormMode } from '../../types'
import { createEmptyTaskValues, getTaskFormValues } from '../../utils'
import TaskForm, { type TaskAssigneeOption } from '../../components/TaskForm/TaskForm'
import styles from './style.module.css'

export type TaskModalHandle = {
  openCreate: () => void
  openEdit: (task: Task) => void
  close: () => void
  isOpen: () => boolean
}

interface TaskModalProps {
  currentUserId: string
  currentUser: TaskAssigneeOption | null
  tasks: Task[]
  filters: BoardTaskFilters
  assigneeOptions: TaskAssigneeOption[]
  onCreated: (task: Task) => void
  onUpdated: (previousTask: Task, task: Task, taskMatchesFilters: boolean, taskWasVisible: boolean) => void
  onError: (error: unknown) => void
}

type CloseGuardState = {
  formKey: string
  dirty: boolean
  confirmOpen: boolean
}

function TaskModal(
  { currentUserId, currentUser, tasks, filters, assigneeOptions, onCreated, onUpdated, onError }: TaskModalProps,
  ref: ForwardedRef<TaskModalHandle>
) {
  const modalRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<TaskFormMode>('create')
  const [task, setTask] = useState<Task | null>(null)
  const initialValues = useMemo(
    () => (task ? getTaskFormValues(task, currentUserId) : createEmptyTaskValues(currentUserId)),
    [currentUserId, task]
  )
  const fallbackAssignee = useMemo(
    () =>
      task?.assigneeId
        ? {
            id: task.assigneeId,
            name: task.assignee
          }
        : currentUser,
    [currentUser, task]
  )
  const formAssigneeOptions = useMemo(
    () => createAssigneeOptions(assigneeOptions, fallbackAssignee),
    [assigneeOptions, fallbackAssignee]
  )
  const formKey = [
    mode,
    initialValues.title,
    initialValues.description,
    initialValues.priority,
    initialValues.assigneeId,
    initialValues.dueDate,
    initialValues.columnId
  ].join('|')
  const [closeGuard, setCloseGuard] = useState<CloseGuardState>({
    formKey,
    dirty: false,
    confirmOpen: false
  })
  const hasUnsavedChanges = closeGuard.formKey === formKey && closeGuard.dirty
  const discardConfirmOpen = closeGuard.formKey === formKey && closeGuard.confirmOpen

  const closeModal = useCallback(() => {
    setCloseGuard({ formKey, dirty: false, confirmOpen: false })
    setOpen(false)
    setTask(null)
  }, [formKey])

  useImperativeHandle(
    ref,
    () => ({
      openCreate: () => {
        setMode('create')
        setTask(null)
        setOpen(true)
      },
      openEdit: (nextTask: Task) => {
        setMode('edit')
        setTask(nextTask)
        setOpen(true)
      },
      close: closeModal,
      isOpen: () => open
    }),
    [closeModal, open]
  )

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setCloseGuard({ formKey, dirty: true, confirmOpen: true })
      return
    }
    closeModal()
  }

  const handleDirtyChange = (dirty: boolean) => {
    setCloseGuard((currentGuard) => ({
      formKey,
      dirty,
      confirmOpen: currentGuard.formKey === formKey && currentGuard.confirmOpen && dirty
    }))
  }

  const handleCancelDiscard = () => {
    setCloseGuard((currentGuard) => ({
      ...currentGuard,
      confirmOpen: false
    }))
  }

  const handleConfirmDiscard = () => {
    closeModal()
  }

  const handleSaved = () => {
    setCloseGuard({ formKey, dirty: false, confirmOpen: false })
    closeModal()
  }

  useFocusTrap({
    open,
    containerRef: modalRef
  })

  useKeyboardShortcut({
    key: 'Escape',
    enabled: open && !discardConfirmOpen,
    ignoreEditable: false,
    onKeyDown: requestClose
  })

  if (!open) {
    return null
  }

  return (
    <>
      <div className={styles.backdrop} onClick={requestClose}>
        <section
          ref={modalRef}
          className={styles.modal}
          role='dialog'
          aria-modal='true'
          aria-labelledby='task-modal-title'
          aria-describedby='task-modal-description'
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
        >
          <button type='button' className={styles.closeButton} onClick={requestClose} aria-label='Close task form'>
            <X size={18} />
          </button>

          <TaskForm
            key={formKey}
            mode={mode}
            task={task}
            initialValues={initialValues}
            tasks={tasks}
            filters={filters}
            assigneeOptions={formAssigneeOptions}
            onCreated={onCreated}
            onUpdated={onUpdated}
            onSaved={handleSaved}
            onError={onError}
            onCancel={requestClose}
            onDirtyChange={handleDirtyChange}
          />
        </section>
      </div>

      <ConfirmDialog
        open={discardConfirmOpen}
        title='Discard unsaved changes?'
        description='You have changes in this task form. If you leave now, those changes will be lost.'
        confirmText='Discard changes'
        cancelText='Keep editing'
        variant='danger'
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
      />
    </>
  )
}

export default forwardRef(TaskModal)
