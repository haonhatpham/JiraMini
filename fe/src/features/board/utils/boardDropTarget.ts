import type { DragOverEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import type { Task } from '@/features/tasks/types'
import { BOARD_COLUMNS } from '../constants'

export function isBoardColumnId(value: unknown): value is Task['columnId'] {
  return BOARD_COLUMNS.some((column) => column.id === value)
}

export function getDropColumnId(target: DragOverEvent['operation']['target'], tasks: Task[]): Task['columnId'] | null {
  if (!target) {
    return null
  }

  if (isSortable(target) && isBoardColumnId(target.group)) {
    return target.group
  }

  if (isBoardColumnId(target.id)) {
    return target.id
  }

  return tasks.find((task) => task.id === target.id)?.columnId ?? null
}
