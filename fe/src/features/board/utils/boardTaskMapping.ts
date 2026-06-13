import type { CreateTaskBody, TaskResponse, UpdateTaskBody } from '@jiramini/shared/task'
import type { TaskFormData } from '@/features/tasks/schemas/task.schema'
import type { Task } from '@/features/tasks/types'

export type AssigneeOptionSource = {
  id: string
  name: string
  email?: string
}

export function mapApiTask(task: TaskResponse): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    assigneeId: task.assigneeId ?? '',
    assignee: task.assignee?.name ?? 'Unassigned',
    dueDate: task.dueDate ?? '',
    createdBy: task.creator?.name ?? 'Unknown',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    columnId: task.status,
    position: task.position
  }
}

export function createAssigneeOptions(
  users: AssigneeOptionSource[],
  fallback?: AssigneeOptionSource | null
): AssigneeOptionSource[] {
  const options: AssigneeOptionSource[] = users.map((assignee) => ({
    id: assignee.id,
    name: assignee.name,
    email: assignee.email
  }))

  if (fallback?.id && !options.some((option) => option.id === fallback.id)) {
    options.push(fallback)
  }

  return options
}

// Create và Update dùng chung một payload shape, nên gộp thành một builder.
export function buildTaskPayload(values: TaskFormData, position: number): CreateTaskBody & UpdateTaskBody {
  return {
    title: values.title,
    description: values.description || null,
    priority: values.priority,
    status: values.columnId,
    position,
    assigneeId: values.assigneeId || null,
    dueDate: values.dueDate || null
  }
}
