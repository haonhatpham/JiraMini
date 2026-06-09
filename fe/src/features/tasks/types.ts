import type { TaskPriority, TaskStatus } from '@jiramini/shared/task'

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  assigneeId: string
  assignee: string
  dueDate: string
  createdBy: string
  createdAt: string
  updatedAt: string
  columnId: TaskStatus
  position: number
}

export type TaskFormMode = 'create' | 'edit'
