import type { TaskStatus } from '@jiramini/shared/task'
import type { Task } from '@/features/tasks/types'
import { BOARD_COLUMN_PAGE_SIZE } from '../constants'
import type { BoardColumnRefreshRequest } from '../types'

// Counts currently visible tasks in one column.
export function getColumnTaskCount(tasks: Task[], columnId: TaskStatus): number {
  return tasks.filter((task) => task.columnId === columnId).length
}

// Keeps the source column filled back to the board page size after a task leaves it.
export function getSourceColumnRefreshCount(tasks: Task[], columnId: TaskStatus): number {
  return Math.max(getColumnTaskCount(tasks, columnId), BOARD_COLUMN_PAGE_SIZE)
}

export function didMoveAcrossColumns(initialTask?: Task, activeTask?: Task): boolean {
  return Boolean(initialTask && activeTask && initialTask.columnId !== activeTask.columnId)
}

export function createColumnRefreshRequests(
  initialTasks: Task[] | null,
  currentTasks: Task[],
  nextTasks: Task[],
  initialActiveTask?: Task,
  activeTask?: Task
): BoardColumnRefreshRequest[] {
  if (!initialActiveTask || !activeTask || !didMoveAcrossColumns(initialActiveTask, activeTask)) {
    return []
  }

  return [
    {
      columnId: initialActiveTask.columnId,
      visibleCount: getSourceColumnRefreshCount(initialTasks ?? currentTasks, initialActiveTask.columnId)
    },
    {
      columnId: activeTask.columnId,
      visibleCount: getColumnTaskCount(nextTasks, activeTask.columnId)
    }
  ]
}
