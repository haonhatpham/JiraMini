import { forwardRef, useImperativeHandle, useRef, type ForwardedRef } from 'react'
import TaskDetailModal, { type TaskDetailModalHandle } from '../TaskDetailModal/TaskDetailModal'
import TaskModal, { type TaskModalHandle } from '../TaskModal/TaskModal'
import type { TaskAssigneeOption } from '../TaskForm/TaskForm'
import type { Task } from '@/features/tasks/types'
import type { BoardTaskFilters } from '@/features/board/filters/taskFilters'

export type BoardTaskModalsHandle = {
  openCreate: () => void
  openDetail: (task: Task) => void
  isFormOpen: () => boolean
}

type BoardTaskModalsProps = {
  currentUserId: string
  currentUser: TaskAssigneeOption | null
  tasks: Task[]
  filters: BoardTaskFilters
  assigneeOptions: TaskAssigneeOption[]
  onCreated: (task: Task) => void
  onUpdated: (previousTask: Task, task: Task, taskMatchesFilters: boolean, taskWasVisible: boolean) => void
  onDeleted: (task: Task) => void
  onOpenForm: () => void
  onError: (error: unknown) => void
}

function BoardTaskModals(
  {
    currentUserId,
    currentUser,
    tasks,
    filters,
    assigneeOptions,
    onCreated,
    onUpdated,
    onDeleted,
    onOpenForm,
    onError
  }: BoardTaskModalsProps,
  ref: ForwardedRef<BoardTaskModalsHandle>
) {
  const taskModalRef = useRef<TaskModalHandle>(null)
  const taskDetailModalRef = useRef<TaskDetailModalHandle>(null)

  useImperativeHandle(
    ref,
    () => ({
      openCreate: () => {
        onOpenForm()
        taskDetailModalRef.current?.close()
        taskModalRef.current?.openCreate()
      },
      openDetail: (task: Task) => {
        taskDetailModalRef.current?.open(task)
      },
      isFormOpen: () => Boolean(taskModalRef.current?.isOpen())
    }),
    [onOpenForm]
  )

  return (
    <>
      <TaskModal
        ref={taskModalRef}
        currentUserId={currentUserId}
        currentUser={currentUser}
        tasks={tasks}
        filters={filters}
        assigneeOptions={assigneeOptions}
        onCreated={onCreated}
        onUpdated={onUpdated}
        onError={onError}
      />

      <TaskDetailModal
        ref={taskDetailModalRef}
        onEdit={(task) => {
          onOpenForm()
          taskModalRef.current?.openEdit(task)
        }}
        onDeleted={onDeleted}
        onError={onError}
      />
    </>
  )
}

export default forwardRef(BoardTaskModals)
