import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TaskStatus } from '@jiramini/shared/task'
import type { ApiError } from '@/api/api'
import { useFetch } from '@/api/useFetch'
import { useAuthStore } from '@/features/auth/auth.store'
import type { Task } from '@/features/tasks/types'
import { useKeyboardShortcut } from '@/hook/useKeyboardShortcut'
import { notify } from '@/utils/notify'
import BoardFiltersBar from '../components/BoardFiltersBar/BoardFiltersBar'
import BoardColumnsSection from '../components/BoardColumnsSection/BoardColumnsSection'
import BoardHeader from '../components/BoardHeader/BoardHeader'
import BoardPageSkeleton from '../components/BoardPageSkeleton/BoardPageSkeleton'
import BoardStatusMessage from '../components/BoardStatusMessage/BoardStatusMessage'
import BoardTaskModals, { type BoardTaskModalsHandle } from '../components/BoardTaskModals/BoardTaskModals'
import { BOARD_COLUMNS } from '../constants'
import {
  createBoardTaskFilterSearchParams,
  hasActiveBoardTaskFilters,
  parseBoardTaskFilters,
  type BoardTaskFilters
} from '../filters/taskFilters'
import type { BoardColumnLoadStateMap } from '../types'
import { getErrorMessage } from '../utils/boardError'
import {
  createInitialColumnLoadState,
  incrementColumnTaskCount as incrementColumnTaskCountState,
  moveColumnTaskCount as moveColumnTaskCountState
} from '../utils/boardColumnState'
import { fetchBoardLoadData, mapBoardLoadData, type BoardLoadData } from '../utils/boardDataRequests'
import { createAssigneeOptions, normalizeTaskPositions } from '../utils/boardTasks'
import styles from './styles.module.css'

const EMPTY_ASSIGNEE_USERS: BoardLoadData['userResponse'] = []

function isUnauthorized(error: unknown): boolean {
  return (error as ApiError | undefined)?.status === 401
}

export default function BoardPage() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const currentUserId = user?.id ?? ''
  const currentUserOption = useMemo(
    () =>
      user
        ? {
            id: user.id,
            name: user.name,
            email: user.email
          }
        : null,
    [user]
  )
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseBoardTaskFilters(searchParams), [searchParams])
  const hasActiveFilters = hasActiveBoardTaskFilters(filters)

  const [tasks, setTasks] = useState<Task[]>([])
  const tasksRef = useRef<Task[]>([])
  const taskModalsRef = useRef<BoardTaskModalsHandle>(null)
  const [columnLoadState, setColumnLoadState] = useState<BoardColumnLoadStateMap>(() => createInitialColumnLoadState())
  const [actionError, setActionError] = useState<string | null>(null)
  const resultCount = useMemo(
    () => BOARD_COLUMNS.reduce((total, column) => total + columnLoadState[column.id].total, 0),
    [columnLoadState]
  )

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
        logout()
      }
    },
    [logout]
  )

  const handleUnauthorizedError = useCallback(
    (error: unknown) => {
      if (isUnauthorized(error)) {
        logout()
      }
    },
    [logout]
  )

  const updateFilters = useCallback(
    (nextFilters: BoardTaskFilters) => {
      setSearchParams(createBoardTaskFilterSearchParams(nextFilters), { replace: true })
    },
    [setSearchParams]
  )

  const loadBoardData = useCallback(
    async (signal: AbortSignal): Promise<BoardLoadData> => {
      return fetchBoardLoadData(filters, signal)
    },
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
        logout()
      }
    },
    [logout]
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
  const boardError = actionError ?? loadError?.message ?? null
  const hasTasks = tasks.length > 0
  const showNoResults = !loading && !boardError && hasActiveFilters && !hasTasks
  const showEmptyBoard = !loading && !boardError && !hasActiveFilters && !hasTasks

  const incrementColumnTaskCount = useCallback((columnId: TaskStatus, delta: number) => {
    setColumnLoadState((currentState) => incrementColumnTaskCountState(currentState, columnId, delta))
  }, [])

  const moveColumnTaskCount = useCallback((fromColumnId: TaskStatus, toColumnId: TaskStatus) => {
    setColumnLoadState((currentState) => moveColumnTaskCountState(currentState, fromColumnId, toColumnId))
  }, [])

  const handleCreateTask = useCallback(() => {
    taskModalsRef.current?.openCreate()
  }, [])

  const handleOpenTask = useCallback((task: Task) => {
    taskModalsRef.current?.openDetail(task)
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

  useKeyboardShortcut({
    key: 'n',
    ctrlOrMetaKey: true,
    ignoreEditable: false,
    onKeyDown: () => {
      if (!taskModalsRef.current?.isFormOpen()) {
        handleCreateTask()
      }
    }
  })

  return (
    <main className={styles.page}>
      <BoardHeader onCreateTask={handleCreateTask} />

      {boardError && <BoardStatusMessage tone='error'>{boardError}</BoardStatusMessage>}

      <BoardFiltersBar
        filters={filters}
        assigneeOptions={assigneeOptions}
        resultCount={resultCount}
        loading={loading}
        onChange={updateFilters}
      />

      {showEmptyBoard && <BoardStatusMessage>No tasks yet</BoardStatusMessage>}
      {showNoResults && <BoardStatusMessage>No results found</BoardStatusMessage>}

      {loading ? (
        <BoardPageSkeleton />
      ) : (
        <BoardColumnsSection
          filters={filters}
          tasks={tasks}
          setTasks={setTasks}
          setBoardTasks={setBoardTasks}
          tasksRef={tasksRef}
          columnLoadState={columnLoadState}
          setColumnLoadState={setColumnLoadState}
          onMoveColumnTaskCount={moveColumnTaskCount}
          onError={handleApiError}
          onUnauthorized={handleUnauthorizedError}
          onOpenTask={handleOpenTask}
        />
      )}

      <BoardTaskModals
        ref={taskModalsRef}
        currentUserId={currentUserId}
        currentUser={currentUserOption}
        tasks={tasks}
        filters={filters}
        assigneeOptions={assigneeOptions}
        onCreated={handleTaskCreated}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
        onOpenForm={clearActionError}
        onError={handleApiError}
      />
    </main>
  )
}
