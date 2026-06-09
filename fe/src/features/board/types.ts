import type { TaskStatus } from '@jiramini/shared/task'

export interface BoardColumn {
  id: TaskStatus
  title: string
}

export type BoardColumnLoadState = {
  total: number
  loadingMore: boolean
}

export type BoardColumnLoadStateMap = Record<TaskStatus, BoardColumnLoadState>

export type BoardColumnRefreshRequest = {
  columnId: TaskStatus
  visibleCount: number
}
