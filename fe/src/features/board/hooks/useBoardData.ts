import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { TaskStatus } from '@jiramini/shared/task'
import type { ApiError } from '@/api/api'
import { useFetch } from '@/api/useFetch'
import type { Task } from '@/features/tasks/types'
import { notify } from '@/utils/notify'
import { BOARD_COLUMNS } from '../constants'
import type { BoardTaskFilters } from '../filters/taskFilters'
import type { BoardColumnLoadStateMap } from '../types'
import {
  createInitialColumnLoadState,
  incrementColumnTaskCount as incrementColumnTaskCountState,
  moveColumnTaskCount as moveColumnTaskCountState
} from '../utils/boardColumnState'
import { fetchBoardLoadData, mapBoardLoadData, type BoardLoadData } from '../utils/boardDataRequests'
import { getErrorMessage } from '../utils/boardError'
import { createAssigneeOptions, type AssigneeOptionSource } from '../utils/boardTaskMapping'
import { normalizeTaskPositions } from '../utils/boardTaskMovement'

const EMPTY_ASSIGNEE_USERS: BoardLoadData['userResponse'] = []

function isUnauthorized(error: unknown): boolean {
  return (error as ApiError | undefined)?.status === 401
}

type UseBoardDataParams = {
  filters: BoardTaskFilters
  currentUserOption: AssigneeOptionSource | null
  onUnauthorized: () => void
}

/**
 * Sở hữu toàn bộ server-state của board: tải dữ liệu theo filter, danh sách task,
 * số lượng task mỗi cột, và các handler khi tạo/sửa/xoá task. Tách khỏi BoardPage
 * để trang chỉ còn lo layout, và để logic này test được độc lập.
 */
export function useBoardData({ filters, currentUserOption, onUnauthorized }: UseBoardDataParams) {
  const [tasks, setTasks] = useState<Task[]>([])
  const tasksRef = useRef<Task[]>([])
  const [columnLoadState, setColumnLoadState] = useState<BoardColumnLoadStateMap>(() => createInitialColumnLoadState())
  const [actionError, setActionError] = useState<string | null>(null)

  const setBoardTasks = useCallback((nextTasks: Task[]) => {
    tasksRef.current = nextTasks
    setTasks(nextTasks)
  }, [])

  const clearActionError = useCallback(() => {
    setActionError(null)
  }, [])

  const handleApiError = useCallback(
    (error: unknown) => {
      const message = getErrorMessage(error)
      setActionError(message)
      notify.error(message)

      if (isUnauthorized(error)) {
        onUnauthorized()
      }
    },
    [onUnauthorized]
  )

  const handleUnauthorizedError = useCallback(
    (error: unknown) => {
      if (isUnauthorized(error)) {
        onUnauthorized()
      }
    },
    [onUnauthorized]
  )

  const loadBoardData = useCallback(
    (signal: AbortSignal): Promise<BoardLoadData> => fetchBoardLoadData(filters, signal),
    [filters]
  )

  const handleLoadSuccess = useCallback(
    (data: BoardLoadData) => {
      const { columnLoadState: nextColumnLoadState, tasks: nextTasks } = mapBoardLoadData(data)

      setColumnLoadState(nextColumnLoadState)
      setBoardTasks(nextTasks)
    },
    [setBoardTasks]
  )

  const handleLoadError = useCallback(
    (error: ApiError) => {
      setColumnLoadState(createInitialColumnLoadState())
      notify.error({
        title: 'Unable to load board data',
        description: error.message
      })

      if (isUnauthorized(error)) {
        onUnauthorized()
      }
    },
    [onUnauthorized]
  )

  const {
    data: boardData,
    loading,
    error: loadError
  } = useFetch<BoardLoadData>(
    ['board-tasks', filters.search, filters.priorities, filters.assigneeId, filters.dueDateFrom, filters.dueDateTo],
    loadBoardData,
    {
      onStart: clearActionError,
      onSuccess: handleLoadSuccess,
      onError: handleLoadError
    }
  )

  const assigneeUsers = boardData?.userResponse ?? EMPTY_ASSIGNEE_USERS
  const assigneeOptions = useMemo(
    () => createAssigneeOptions(assigneeUsers, currentUserOption),
    [assigneeUsers, currentUserOption]
  )

  const resultCount = useMemo(
    () => BOARD_COLUMNS.reduce((total, column) => total + columnLoadState[column.id].total, 0),
    [columnLoadState]
  )
  const boardError = actionError ?? loadError?.message ?? null
  const hasTasks = tasks.length > 0

  const incrementColumnTaskCount = useCallback((columnId: TaskStatus, delta: number) => {
    setColumnLoadState((currentState) => incrementColumnTaskCountState(currentState, columnId, delta))
  }, [])

  const moveColumnTaskCount = useCallback((fromColumnId: TaskStatus, toColumnId: TaskStatus) => {
    setColumnLoadState((currentState) => moveColumnTaskCountState(currentState, fromColumnId, toColumnId))
  }, [])

  const handleTaskCreated = useCallback(
    (task: Task) => {
      clearActionError()
      incrementColumnTaskCount(task.columnId, 1)
      setBoardTasks(normalizeTaskPositions([...tasksRef.current, task]))
    },
    [clearActionError, incrementColumnTaskCount, setBoardTasks]
  )

  const handleTaskUpdated = useCallback(
    (previousTask: Task, task: Task, taskMatchesFilters: boolean, taskWasVisible: boolean) => {
      clearActionError()

      const nextTasks = taskMatchesFilters
        ? tasksRef.current.map((currentTask) => (currentTask.id === previousTask.id ? task : currentTask))
        : tasksRef.current.filter((currentTask) => currentTask.id !== previousTask.id)

      if (taskWasVisible && !taskMatchesFilters) {
        incrementColumnTaskCount(previousTask.columnId, -1)
      }

      if (taskWasVisible && taskMatchesFilters && previousTask.columnId !== task.columnId) {
        moveColumnTaskCount(previousTask.columnId, task.columnId)
      }

      setBoardTasks(normalizeTaskPositions(nextTasks))
    },
    [clearActionError, incrementColumnTaskCount, moveColumnTaskCount, setBoardTasks]
  )

  const handleTaskDeleted = useCallback(
    (task: Task) => {
      clearActionError()
      incrementColumnTaskCount(task.columnId, -1)
      setBoardTasks(normalizeTaskPositions(tasksRef.current.filter((currentTask) => currentTask.id !== task.id)))
    },
    [clearActionError, incrementColumnTaskCount, setBoardTasks]
  )

  return {
    tasks,
    setTasks: setTasks as Dispatch<SetStateAction<Task[]>>,
    setBoardTasks,
    tasksRef,
    columnLoadState,
    setColumnLoadState,
    assigneeOptions,
    resultCount,
    loading,
    boardError,
    hasTasks,
    clearActionError,
    handleApiError,
    handleUnauthorizedError,
    moveColumnTaskCount,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted
  }
}
