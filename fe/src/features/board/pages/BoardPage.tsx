import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import BoardFiltersBar from '../components/filters/BoardFiltersBar/BoardFiltersBar'
import BoardColumnsSection from '../components/columns/BoardColumnsSection/BoardColumnsSection'
import BoardHeader from '../components/BoardHeader/BoardHeader'
import BoardPageSkeleton from '../components/BoardPageSkeleton/BoardPageSkeleton'
import BoardStatusMessage from '../components/BoardStatusMessage/BoardStatusMessage'
import BoardTaskModals, { type BoardTaskModalsHandle } from '../components/modals/BoardTaskModals/BoardTaskModals'
import {
  createBoardTaskFilterSearchParams,
  hasActiveBoardTaskFilters,
  parseBoardTaskFilters,
  type BoardTaskFilters
} from '../filters/taskFilters'
import { useBoardData } from '../hooks/useBoardData'
import type { Task } from '@/features/tasks/types'
import styles from './styles.module.css'

export default function BoardPage() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const currentUserId = user?.id ?? ''
  const currentUserOption = useMemo(() => (user ? { id: user.id, name: user.name, email: user.email } : null), [user])

  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseBoardTaskFilters(searchParams), [searchParams])
  const hasActiveFilters = hasActiveBoardTaskFilters(filters)
  const updateFilters = useCallback(
    (nextFilters: BoardTaskFilters) => {
      setSearchParams(createBoardTaskFilterSearchParams(nextFilters), { replace: true })
    },
    [setSearchParams]
  )

  const taskModalsRef = useRef<BoardTaskModalsHandle>(null)

  const {
    tasks,
    setTasks,
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
  } = useBoardData({ filters, currentUserOption, onUnauthorized: logout })

  const showNoResults = !loading && !boardError && hasActiveFilters && !hasTasks
  const showEmptyBoard = !loading && !boardError && !hasActiveFilters && !hasTasks

  const handleCreateTask = useCallback(() => {
    taskModalsRef.current?.openCreate()
  }, [])

  const handleOpenTask = useCallback((task: Task) => {
    taskModalsRef.current?.openDetail(task)
  }, [])

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
