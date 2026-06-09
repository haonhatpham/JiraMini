import { forwardRef, useCallback, useImperativeHandle, useRef, useState, type ForwardedRef } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog'
import { BOARD_COLUMNS } from '@/features/board/constants'
import { useFocusTrap } from '@/hook/useFocusTrap'
import { useKeyboardShortcut } from '@/hook/useKeyboardShortcut'
import { notify } from '@/utils/notify'
import { PRIORITY_CLASS_NAMES, PRIORITY_LABELS } from '../../constants'
import { taskService } from '../../task.service'
import type { Task } from '../../types'
import styles from './style.module.css'

export type TaskDetailModalHandle = {
  open: (task: Task) => void
  close: () => void
}

interface TaskDetailModalProps {
  onEdit: (task: Task) => void
  onDeleted: (task: Task) => void
  onError: (error: unknown) => void
}

function getStatusLabel(task: Task): string {
  return BOARD_COLUMNS.find((column) => column.id === task.columnId)?.title ?? task.columnId
}

function getTaskNumber(taskId: string): string {
  const compactId = taskId.replace(/-/g, '').slice(0, 4).toUpperCase()

  return compactId ? `TAS-${compactId}` : 'TASK'
}

function formatDateTime(value: string): string {
  if (!value) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

function formatDueDate(value: string): string {
  if (!value) {
    return 'No date'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short'
  }).format(new Date(value))
}

function TaskDetailModal(
  { onEdit, onDeleted, onError }: TaskDetailModalProps,
  ref: ForwardedRef<TaskDetailModalHandle>
) {
  const modalRef = useRef<HTMLElement>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const open = Boolean(task)

  const handleClose = useCallback(() => {
    setShowDeleteConfirm(false)
    setDeleting(false)
    setTask(null)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      open: (nextTask: Task) => {
        setTask(nextTask)
      },
      close: handleClose
    }),
    [handleClose]
  )

  useFocusTrap({
    open,
    containerRef: modalRef
  })

  useKeyboardShortcut({
    key: 'Escape',
    enabled: open && !showDeleteConfirm,
    ignoreEditable: false,
    onKeyDown: handleClose
  })

  if (!task) {
    return null
  }

  const statusLabel = getStatusLabel(task)
  const assigneeInitial = task.assignee.charAt(0).toUpperCase()

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleConfirmDelete = () => {
    setDeleting(true)
    void taskService
      .deleteTask(task.id)
      .then(() => {
        onDeleted(task)
        notify.success('Task deleted')
        handleClose()
      })
      .catch((error) => {
        setDeleting(false)
        onError(error)
      })
  }

  const handleEditClick = () => {
    onEdit(task)
    handleClose()
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleClose}>
        <section
          ref={modalRef}
          className={styles.modal}
          role='dialog'
          aria-modal='true'
          aria-labelledby='task-detail-title'
          aria-describedby='task-detail-summary'
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
        >
          <button type='button' className={styles.closeButton} onClick={handleClose} aria-label='Close task details'>
            <X size={18} />
          </button>

          <p className={styles.srOnly} id='task-detail-summary'>
            Task details, status, assignee, dates, and available task actions.
          </p>

          <header className={styles.header}>
            <span className={styles.taskCode}>{getTaskNumber(task.id)}</span>
            <h2 className={styles.title} id='task-detail-title'>
              {task.title}
            </h2>
          </header>

          <dl className={styles.details}>
            <div className={styles.row}>
              <dt>Description</dt>
              <dd>{task.description || 'No description.'}</dd>
            </div>

            <div className={styles.row}>
              <dt>Priority</dt>
              <dd>
                <span className={`${styles.priorityBadge} ${styles[PRIORITY_CLASS_NAMES[task.priority]]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </dd>
            </div>

            <div className={styles.row}>
              <dt>Status</dt>
              <dd>
                <span className={styles.statusBadge}>{statusLabel}</span>
              </dd>
            </div>

            <div className={styles.row}>
              <dt>Assignee</dt>
              <dd>
                <span className={styles.assignee}>
                  <span className={styles.avatar}>{assigneeInitial}</span>
                  {task.assignee}
                </span>
              </dd>
            </div>

            <div className={styles.row}>
              <dt>Due Date</dt>
              <dd>{formatDueDate(task.dueDate)}</dd>
            </div>

            <div className={styles.row}>
              <dt>Created By</dt>
              <dd>{task.createdBy || 'Unknown'}</dd>
            </div>

            <div className={styles.row}>
              <dt>Created At</dt>
              <dd>{formatDateTime(task.createdAt)}</dd>
            </div>

            <div className={styles.row}>
              <dt>Updated At</dt>
              <dd>{formatDateTime(task.updatedAt)}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <button type='button' className={styles.editButton} onClick={handleEditClick} data-autofocus>
              <Pencil size={16} />
              Edit
            </button>

            <button type='button' className={styles.deleteButton} onClick={handleDeleteClick}>
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title='Delete task?'
        description='This task will be permanently deleted. This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        loading={deleting}
        variant='danger'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}

export default forwardRef(TaskDetailModal)
