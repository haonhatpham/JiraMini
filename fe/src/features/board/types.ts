import type { TaskStatus } from '@jiramini/shared/task'

export type BoardColumnId = TaskStatus

export interface BoardColumn {
  id: BoardColumnId
  title: string
  count: number
}
