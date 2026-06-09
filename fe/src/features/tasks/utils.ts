// src/features/task/utils.ts

import type { TaskFormData } from './schemas/task.schema'
import type { Task } from './types'

export function createEmptyTaskValues(assigneeId: string): TaskFormData {
  return {
    title: '',
    description: '',
    priority: 'medium',
    assigneeId,
    dueDate: '',
    columnId: 'backlog'
  }
}

export function getTaskFormValues(task: Task, fallbackAssigneeId: string): TaskFormData {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    assigneeId: task.assigneeId || fallbackAssigneeId,
    dueDate: task.dueDate,
    columnId: task.columnId
  }
}

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(`${dueDate}T23:59:59`)

  return targetDate < today
}
