import api from '@/api/api'
import { routes } from '@/constants/route'
import type {
  CreateTaskBody,
  ListTasksResponse,
  TaskDetailResponse,
  TaskPriority,
  TaskStatus,
  TaskResponse,
  UpdateTaskBody,
  UpdateTaskStatusBody
} from '@jiramini/shared/task'

export type ListTasksParams = {
  status?: TaskStatus
  search?: string
  priority?: TaskPriority[]
  assigneeId?: string
  dueDateFrom?: string
  dueDateTo?: string
  page?: number
  limit?: number
}

type RequestOptions = {
  signal?: AbortSignal
}

function createListTasksSearchParams(input: ListTasksParams): URLSearchParams {
  const params = new URLSearchParams({
    limit: String(input.limit ?? 100),
    sortBy: 'position',
    sortOrder: 'asc'
  })

  if (input.status) params.set('status', input.status)
  if (input.search) params.set('search', input.search)
  if (input.assigneeId) params.set('assigneeId', input.assigneeId)
  if (input.dueDateFrom) params.set('dueDateFrom', input.dueDateFrom)
  if (input.dueDateTo) params.set('dueDateTo', input.dueDateTo)
  if (input.page) params.set('page', String(input.page))

  input.priority?.forEach((priority) => {
    params.append('priority', priority)
  })

  return params
}

async function listTasks(input: ListTasksParams = {}, options?: RequestOptions): Promise<ListTasksResponse> {
  const response = await api.get<ListTasksResponse>(routes.tasks.list, {
    params: createListTasksSearchParams(input),
    signal: options?.signal
  })

  return response
}

async function createTask(input: CreateTaskBody): Promise<TaskResponse> {
  const response = await api.post<TaskDetailResponse>(routes.tasks.list, input)

  return response.data
}

async function updateTask(id: string, input: UpdateTaskBody): Promise<TaskResponse> {
  const response = await api.put<TaskDetailResponse>(routes.tasks.detail(id), input)

  return response.data
}

async function updateTaskStatus(id: string, input: UpdateTaskStatusBody): Promise<TaskResponse> {
  const response = await api.patch<TaskDetailResponse>(routes.tasks.status(id), input)

  return response.data
}

async function deleteTask(id: string): Promise<void> {
  await api.delete<void>(routes.tasks.detail(id))
}

export const taskService = {
  listTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
}
