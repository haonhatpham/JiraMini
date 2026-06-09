import type { TaskStatus } from '@jiramini/shared/task'
import type { Task } from '@/features/tasks/types'
import { BOARD_COLUMNS } from '../constants'
import type { BoardColumnLoadStateMap } from '../types'

// Creates the default pagination state for every board column.
export function createInitialColumnLoadState(): BoardColumnLoadStateMap {
  return BOARD_COLUMNS.reduce((acc, column) => {
    acc[column.id] = {
      total: 0,
      loadingMore: false
    }

    return acc
  }, {} as BoardColumnLoadStateMap)
}

// Replaces only the refreshed columns and preserves the current tasks in untouched columns.
export function replaceColumnTasks(
  currentTasks: Task[],
  refreshedColumnTasks: Partial<Record<TaskStatus, Task[]>>
): Task[] {
  return BOARD_COLUMNS.flatMap((column) => {
    const nextColumnTasks = refreshedColumnTasks[column.id]

    return nextColumnTasks ?? currentTasks.filter((task) => task.columnId === column.id)
  })
}

// Adjusts a single column total after create/delete/filter-local changes.
export function incrementColumnTaskCount(
  currentState: BoardColumnLoadStateMap,
  columnId: TaskStatus,
  delta: number
): BoardColumnLoadStateMap {
  return {
    ...currentState,
    [columnId]: {
      ...currentState[columnId],
      total: Math.max(currentState[columnId].total + delta, 0)
    }
  }
}

// Moves one task count from a source column to a target column.
export function moveColumnTaskCount(
  currentState: BoardColumnLoadStateMap,
  fromColumnId: TaskStatus,
  toColumnId: TaskStatus
): BoardColumnLoadStateMap {
  if (fromColumnId === toColumnId) {
    return currentState
  }

  return {
    ...currentState,
    [fromColumnId]: {
      ...currentState[fromColumnId],
      total: Math.max(currentState[fromColumnId].total - 1, 0)
    },
    [toColumnId]: {
      ...currentState[toColumnId],
      total: currentState[toColumnId].total + 1
    }
  }
}

export function setColumnLoadingMore(
  currentState: BoardColumnLoadStateMap,
  columnId: TaskStatus,
  loadingMore: boolean
): BoardColumnLoadStateMap {
  return {
    ...currentState,
    [columnId]: {
      ...currentState[columnId],
      loadingMore
    }
  }
}

export function setColumnsLoadingMore(
  currentState: BoardColumnLoadStateMap,
  columnIds: TaskStatus[],
  loadingMore: boolean
): BoardColumnLoadStateMap {
  return columnIds.reduce((nextState, columnId) => setColumnLoadingMore(nextState, columnId, loadingMore), currentState)
}

export function setColumnLoadResult(
  currentState: BoardColumnLoadStateMap,
  columnId: TaskStatus,
  total: number
): BoardColumnLoadStateMap {
  return {
    ...currentState,
    [columnId]: {
      total,
      loadingMore: false
    }
  }
}

export function setColumnLoadResults(
  currentState: BoardColumnLoadStateMap,
  results: Array<{ columnId: TaskStatus; total: number }>
): BoardColumnLoadStateMap {
  return results.reduce(
    (nextState, result) => setColumnLoadResult(nextState, result.columnId, result.total),
    currentState
  )
}
