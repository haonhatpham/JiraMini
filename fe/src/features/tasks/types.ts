// src/features/task/types.ts

import type { BoardColumnId } from '../board/types'
import type { TaskFormData } from './schemas/task.schema'

export type TaskPriority = TaskFormData['priority']

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  assignee: string
  dueDate: string
  columnId: BoardColumnId
}

export type TaskFormValues = TaskFormData

export type TaskFormMode = 'create' | 'edit'
