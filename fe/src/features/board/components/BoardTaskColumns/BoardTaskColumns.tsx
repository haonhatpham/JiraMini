import { useCallback, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react'
import type { TaskStatus } from '@jiramini/shared/task'
import type { Task } from '@/features/tasks/types'
import { BOARD_COLUMNS } from '../../constants'
import type { BoardColumnLoadStateMap, BoardColumnRefreshRequest } from '../../types'
import { persistBoardTaskMove } from '../../utils/boardDragPersistence'
import { createColumnRefreshRequests, didMoveAcrossColumns } from '../../utils/boardDragRefresh'
import { getDropColumnId, moveTaskToColumn, reorderTaskInColumn } from '../../utils/boardTasks'
import BoardColumn from '../BoardColumn/BoardColumn'
import styles from './styles.module.css'

type BoardTaskColumnsProps = {
  tasks: Task[]
  indexTasks?: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  setBoardTasks: (tasks: Task[]) => void
  tasksRef: MutableRefObject<Task[]>
  columnLoadState: BoardColumnLoadStateMap
  onMoveColumnTaskCount: (fromColumnId: TaskStatus, toColumnId: TaskStatus) => void
  onRefreshColumns: (requests: BoardColumnRefreshRequest[]) => Promise<void>
  onError: (error: unknown) => void
  onOpenTask: (task: Task) => void
  onLoadMoreColumn: (columnId: TaskStatus) => void
}

export default function BoardTaskColumns({
  tasks,
  indexTasks = tasks,
  setTasks,
  setBoardTasks,
  tasksRef,
  columnLoadState,
  onMoveColumnTaskCount,
  onRefreshColumns,
  onError,
  onOpenTask,
  onLoadMoreColumn
}: BoardTaskColumnsProps) {
  const dragStartTasksRef = useRef<Task[] | null>(null)
  const latestMoveByTaskRef = useRef(new Map<string, number>())
  const moveRollbackByTaskRef = useRef(new Map<string, Task>())
  const moveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const moveSequenceRef = useRef(0)

  const handleDragStart = useCallback(() => {
    dragStartTasksRef.current = tasksRef.current
  }, [tasksRef])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { source, target } = event.operation

      if (!source || source.type !== 'task' || typeof source.id !== 'string') {
        return
      }

      const sourceId = source.id

      setTasks((currentTasks) => {
        const taskBeingMoved = currentTasks.find((task) => task.id === sourceId)
        const targetColumnId = getDropColumnId(target, currentTasks)

        if (!taskBeingMoved || !targetColumnId || taskBeingMoved.columnId === targetColumnId) {
          return currentTasks
        }

        const nextTasks = moveTaskToColumn(currentTasks, sourceId, targetColumnId, target)
        tasksRef.current = nextTasks

        return nextTasks
      })
    },
    [setTasks, tasksRef]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { source, target } = event.operation
      const initialTasks = dragStartTasksRef.current
      const currentTasks = tasksRef.current

      dragStartTasksRef.current = null

      if (event.canceled) {
        if (initialTasks) {
          setBoardTasks(initialTasks)
        }
        return
      }

      if (!source || source.type !== 'task' || typeof source.id !== 'string' || !target) {
        if (initialTasks) {
          setBoardTasks(initialTasks)
        }
        return
      }

      const sourceId = source.id
      const initialActiveTask = initialTasks?.find((task) => task.id === sourceId)
      const activeMovedTask = currentTasks.find((task) => task.id === sourceId)
      const nextTasks =
        initialActiveTask && activeMovedTask && initialActiveTask.columnId === activeMovedTask.columnId
          ? reorderTaskInColumn(currentTasks, sourceId, target)
          : currentTasks

      if (initialActiveTask && activeMovedTask && didMoveAcrossColumns(initialActiveTask, activeMovedTask)) {
        onMoveColumnTaskCount(initialActiveTask.columnId, activeMovedTask.columnId)
      }

      void persistBoardTaskMove({
        taskId: sourceId,
        nextTasks,
        rollbackTasks: initialTasks ?? currentTasks,
        columnRefreshRequests: createColumnRefreshRequests(
          initialTasks,
          currentTasks,
          nextTasks,
          initialActiveTask,
          activeMovedTask
        ),
        tasksRef,
        setBoardTasks,
        onMoveColumnTaskCount,
        onRefreshColumns,
        onError,
        latestMoveByTaskRef,
        moveRollbackByTaskRef,
        moveQueueRef,
        moveSequenceRef
      })
    },
    [onError, onMoveColumnTaskCount, onRefreshColumns, setBoardTasks, tasksRef]
  )

  const handleDragCancel = useCallback(() => {
    if (dragStartTasksRef.current) {
      setBoardTasks(dragStartTasksRef.current)
    }

    dragStartTasksRef.current = null
  }, [setBoardTasks])

  return (
    <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className={styles.grid}>
        {BOARD_COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.columnId === column.id)
          const indexedColumnTasks = indexTasks.filter((task) => task.columnId === column.id)
          const loadState = columnLoadState[column.id]

          return (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              indexTasks={indexedColumnTasks}
              totalTasks={loadState.total}
              loadingMore={loadState.loadingMore}
              onDragCancel={handleDragCancel}
              onOpenTask={onOpenTask}
              onLoadMore={() => onLoadMoreColumn(column.id)}
            />
          )
        })}
      </div>
    </DragDropProvider>
  )
}
