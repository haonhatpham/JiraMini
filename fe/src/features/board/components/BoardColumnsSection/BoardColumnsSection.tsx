import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'
import type { TaskStatus } from '@jiramini/shared/task'
import type { Task } from '@/features/tasks/types'
import { notify } from '@/utils/notify'
import type { BoardTaskFilters } from '../../filters/taskFilters'
import type { BoardColumnLoadStateMap, BoardColumnRefreshRequest } from '../../types'
import { getErrorMessage } from '../../utils/boardError'
import {
  replaceColumnTasks,
  setColumnLoadResult,
  setColumnLoadResults,
  setColumnLoadingMore,
  setColumnsLoadingMore
} from '../../utils/boardColumnState'
import {
  fetchColumnRefreshes,
  fetchColumnTasks,
  getNextColumnLoadMoreLimit,
  getUniqueColumnRefreshRequests
} from '../../utils/boardDataRequests'
import { normalizeTaskPositions } from '../../utils/boardTasks'
import BoardTaskColumns from '../BoardTaskColumns/BoardTaskColumns'

type BoardColumnsSectionProps = {
  filters: BoardTaskFilters
  tasks: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  setBoardTasks: (tasks: Task[]) => void
  tasksRef: MutableRefObject<Task[]>
  columnLoadState: BoardColumnLoadStateMap
  setColumnLoadState: Dispatch<SetStateAction<BoardColumnLoadStateMap>>
  onMoveColumnTaskCount: (fromColumnId: TaskStatus, toColumnId: TaskStatus) => void
  onOpenTask: (task: Task) => void
  onError: (error: unknown) => void
  onUnauthorized: (error: unknown) => void
}

export default function BoardColumnsSection({
  filters,
  tasks,
  setTasks,
  setBoardTasks,
  tasksRef,
  columnLoadState,
  setColumnLoadState,
  onMoveColumnTaskCount,
  onOpenTask,
  onError,
  onUnauthorized
}: BoardColumnsSectionProps) {
  const handleLoadMoreColumn = useCallback(
    async (columnId: TaskStatus) => {
      const columnState = columnLoadState[columnId]
      const loadedColumnTaskCount = tasksRef.current.filter((task) => task.columnId === columnId).length

      if (columnState.loadingMore || loadedColumnTaskCount >= columnState.total) {
        return
      }

      setColumnLoadState((currentState) => setColumnLoadingMore(currentState, columnId, true))

      try {
        const result = await fetchColumnTasks(
          filters,
          columnId,
          getNextColumnLoadMoreLimit(loadedColumnTaskCount, columnState.total)
        )

        setBoardTasks(
          normalizeTaskPositions(
            replaceColumnTasks(tasksRef.current, {
              [columnId]: result.tasks
            })
          )
        )
        setColumnLoadState((currentState) => setColumnLoadResult(currentState, columnId, result.total))
      } catch (error) {
        notify.error({
          title: 'Unable to load more tasks',
          description: getErrorMessage(error)
        })

        onUnauthorized(error)
        setColumnLoadState((currentState) => setColumnLoadingMore(currentState, columnId, false))
      }
    },
    [columnLoadState, filters, onUnauthorized, setBoardTasks, setColumnLoadState, tasksRef]
  )

  const refreshColumns = useCallback(
    async (requests: BoardColumnRefreshRequest[]) => {
      const uniqueRequests = getUniqueColumnRefreshRequests(requests)
      const refreshedColumnIds = uniqueRequests.map(({ columnId }) => columnId)

      if (uniqueRequests.length === 0) {
        return
      }

      setColumnLoadState((currentState) => setColumnsLoadingMore(currentState, refreshedColumnIds, true))

      try {
        const responses = await fetchColumnRefreshes(filters, uniqueRequests)
        const refreshedColumnTasks: Partial<Record<TaskStatus, Task[]>> = {}

        responses.forEach((response) => {
          refreshedColumnTasks[response.columnId] = response.tasks
        })

        setBoardTasks(normalizeTaskPositions(replaceColumnTasks(tasksRef.current, refreshedColumnTasks)))
        setColumnLoadState((currentState) => setColumnLoadResults(currentState, responses))
      } catch (error) {
        notify.error({
          title: 'Unable to refresh board columns',
          description: getErrorMessage(error)
        })

        onUnauthorized(error)
        setColumnLoadState((currentState) => setColumnsLoadingMore(currentState, refreshedColumnIds, false))
      }
    },
    [filters, onUnauthorized, setBoardTasks, setColumnLoadState, tasksRef]
  )

  return (
    <BoardTaskColumns
      tasks={tasks}
      indexTasks={tasks}
      setTasks={setTasks}
      setBoardTasks={setBoardTasks}
      tasksRef={tasksRef}
      columnLoadState={columnLoadState}
      onMoveColumnTaskCount={onMoveColumnTaskCount}
      onRefreshColumns={refreshColumns}
      onError={onError}
      onOpenTask={onOpenTask}
      onLoadMoreColumn={handleLoadMoreColumn}
    />
  )
}
