import type { DragEndEvent, DragOverEvent } from '@dnd-kit/react'
import { isSortable } from '@dnd-kit/react/sortable'
import type { Task } from '@/features/tasks/types'
import { BOARD_COLUMNS } from '../constants'
import { isBoardColumnId } from './boardDropTarget'

type TaskGroups = Record<Task['columnId'], Task[]>

function createTaskGroups(tasks: Task[]): TaskGroups {
  const groups = BOARD_COLUMNS.reduce((acc, column) => {
    acc[column.id] = []
    return acc
  }, {} as TaskGroups)

  for (const task of tasks) {
    groups[task.columnId].push(task)
  }

  return groups
}

function flattenTaskGroups(groups: TaskGroups): Task[] {
  return BOARD_COLUMNS.flatMap((column) => groups[column.id])
}

export function normalizeTaskPositions(tasks: Task[]): Task[] {
  const groups = createTaskGroups(tasks)

  return BOARD_COLUMNS.flatMap((column) =>
    groups[column.id].map((task, index) => ({
      ...task,
      columnId: column.id,
      position: index
    }))
  )
}

export function moveTaskToPosition(
  tasks: Task[],
  taskId: string,
  columnId: Task['columnId'],
  position: number
): Task[] {
  const taskToMove = tasks.find((task) => task.id === taskId)

  if (!taskToMove) {
    return tasks
  }

  const groups = createTaskGroups(tasks.filter((task) => task.id !== taskId))
  const targetTasks = groups[columnId]
  const insertIndex = Math.min(Math.max(position, 0), targetTasks.length)

  groups[columnId] = [...targetTasks]
  groups[columnId].splice(insertIndex, 0, {
    ...taskToMove,
    columnId,
    position: insertIndex
  })

  return normalizeTaskPositions(flattenTaskGroups(groups))
}

export function getNextColumnPosition(tasks: Task[], columnId: Task['columnId'], excludeTaskId?: string): number {
  return tasks.filter((task) => task.columnId === columnId && task.id !== excludeTaskId).length
}

export function moveTaskToColumn(
  tasks: Task[],
  activeId: string,
  targetColumnId: Task['columnId'],
  target: DragOverEvent['operation']['target']
): Task[] {
  const groups = createTaskGroups(tasks)
  const activeTask = tasks.find((task) => task.id === activeId)

  if (!activeTask) {
    return tasks
  }

  groups[activeTask.columnId] = groups[activeTask.columnId].filter((task) => task.id !== activeId)

  const targetTasks = groups[targetColumnId]
  const targetIndex = isSortable(target) ? target.index : -1
  const insertIndex = targetIndex >= 0 ? targetIndex : targetTasks.length

  groups[targetColumnId] = [...targetTasks]
  groups[targetColumnId].splice(insertIndex, 0, {
    ...activeTask,
    columnId: targetColumnId
  })

  return flattenTaskGroups(groups)
}

export function reorderTaskInColumn(
  tasks: Task[],
  activeId: string,
  target: DragEndEvent['operation']['target']
): Task[] {
  const groups = createTaskGroups(tasks)
  const activeTask = tasks.find((task) => task.id === activeId)

  if (!activeTask || !isSortable(target) || !isBoardColumnId(target.group) || activeTask.columnId !== target.group) {
    return tasks
  }

  const columnTasks = groups[activeTask.columnId]
  const oldIndex = columnTasks.findIndex((task) => task.id === activeId)
  const newIndex = target.index

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return tasks
  }

  groups[activeTask.columnId] = [...columnTasks]
  const [movedTask] = groups[activeTask.columnId].splice(oldIndex, 1)
  groups[activeTask.columnId].splice(newIndex, 0, movedTask)

  return flattenTaskGroups(groups)
}
