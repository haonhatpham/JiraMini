import type { TaskStatus } from '@jiramini/shared/task'
import { taskService } from '@/features/tasks/task.service'
import type { Task } from '@/features/tasks/types'
import { userService } from '@/features/users/user.service'
import { BOARD_COLUMN_PAGE_SIZE, BOARD_COLUMNS } from '../constants'
import { toListTasksParams, type BoardTaskFilters } from '../filters/taskFilters'
import type { BoardColumnLoadStateMap, BoardColumnRefreshRequest } from '../types'
import { createInitialColumnLoadState } from './boardColumnState'
import { mapApiTask } from './boardTaskMapping'
import { normalizeTaskPositions } from './boardTaskMovement'

const MAX_BOARD_COLUMN_FETCH_LIMIT = 100

export type BoardLoadData = {
  taskResponses: Record<TaskStatus, Awaited<ReturnType<typeof taskService.listTasks>>>
  userResponse: Awaited<ReturnType<typeof userService.listUsers>>
}

export type BoardColumnTasksResult = {
  columnId: TaskStatus
  tasks: Task[]
  total: number
}

export async function fetchBoardLoadData(filters: BoardTaskFilters, signal: AbortSignal): Promise<BoardLoadData> {
  const taskParams = toListTasksParams(filters)
  const [taskResponseEntries, userResponse] = await Promise.all([
    Promise.all(
      BOARD_COLUMNS.map(async (column) => {
        const response = await taskService.listTasks(
          {
            ...taskParams,
            status: column.id,
            page: 1,
            limit: BOARD_COLUMN_PAGE_SIZE
          },
          { signal }
        )

        return [column.id, response] as const
      })
    ),
    userService.listUsers({ signal })
  ])

  return {
    taskResponses: Object.fromEntries(taskResponseEntries) as BoardLoadData['taskResponses'],
    userResponse
  }
}

export function mapBoardLoadData({ taskResponses }: BoardLoadData): {
  tasks: Task[]
  columnLoadState: BoardColumnLoadStateMap
} {
  const columnLoadState = createInitialColumnLoadState()
  const tasks = BOARD_COLUMNS.flatMap((column) => {
    const response = taskResponses[column.id]
    columnLoadState[column.id] = {
      total: response.pagination.total,
      loadingMore: false
    }

    return response.data.map(mapApiTask)
  })

  return {
    columnLoadState,
    tasks: normalizeTaskPositions(tasks)
  }
}

export function getNextColumnLoadMoreLimit(loadedCount: number, totalCount: number): number {
  return getColumnFetchLimit(Math.min(loadedCount + BOARD_COLUMN_PAGE_SIZE, totalCount))
}

function getColumnFetchLimit(visibleCount: number): number {
  return Math.min(Math.max(Math.ceil(visibleCount), 1), MAX_BOARD_COLUMN_FETCH_LIMIT)
}

export function getUniqueColumnRefreshRequests(requests: BoardColumnRefreshRequest[]): BoardColumnRefreshRequest[] {
  const requestByColumn = requests.reduce((acc, request) => {
    acc.set(request.columnId, Math.max(acc.get(request.columnId) ?? 0, request.visibleCount))

    return acc
  }, new Map<TaskStatus, number>())

  return Array.from(requestByColumn, ([columnId, visibleCount]) => ({
    columnId,
    visibleCount
  }))
}

export async function fetchColumnTasks(
  filters: BoardTaskFilters,
  columnId: TaskStatus,
  limit: number
): Promise<BoardColumnTasksResult> {
  const response = await taskService.listTasks({
    ...toListTasksParams(filters),
    status: columnId,
    page: 1,
    limit
  })

  return {
    columnId,
    tasks: response.data.map(mapApiTask),
    total: response.pagination.total
  }
}

export async function fetchColumnRefreshes(
  filters: BoardTaskFilters,
  requests: BoardColumnRefreshRequest[]
): Promise<BoardColumnTasksResult[]> {
  return Promise.all(
    requests.map(({ columnId, visibleCount }) => fetchColumnTasks(filters, columnId, getColumnFetchLimit(visibleCount)))
  )
}
