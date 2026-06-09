import type { TaskPriority } from '@jiramini/shared/task'
import type { ListTasksParams } from '@/features/tasks/task.service'
import type { Task } from '@/features/tasks/types'

export type BoardTaskFilters = {
  search: string
  priorities: TaskPriority[]
  assigneeId: string
  dueDateFrom: string
  dueDateTo: string
}

const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical']
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const EMPTY_BOARD_TASK_FILTERS: BoardTaskFilters = {
  search: '',
  priorities: [],
  assigneeId: '',
  dueDateFrom: '',
  dueDateTo: ''
}

function normalizeText(value: string | null): string {
  return value?.trim() ?? ''
}

function normalizeDate(value: string | null): string {
  const normalizedValue = normalizeText(value)

  return DATE_ONLY_PATTERN.test(normalizedValue) ? normalizedValue : ''
}

function normalizePriorities(searchParams: URLSearchParams): TaskPriority[] {
  const priorityValues = searchParams
    .getAll('priority')
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter((value): value is TaskPriority => TASK_PRIORITIES.includes(value as TaskPriority))

  return Array.from(new Set(priorityValues))
}

export function parseBoardTaskFilters(searchParams: URLSearchParams): BoardTaskFilters {
  return {
    search: normalizeText(searchParams.get('search')),
    priorities: normalizePriorities(searchParams),
    assigneeId: normalizeText(searchParams.get('assigneeId')),
    dueDateFrom: normalizeDate(searchParams.get('dueDateFrom')),
    dueDateTo: normalizeDate(searchParams.get('dueDateTo'))
  }
}

export function createBoardTaskFilterSearchParams(filters: BoardTaskFilters): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (filters.search) searchParams.set('search', filters.search)
  if (filters.assigneeId) searchParams.set('assigneeId', filters.assigneeId)
  if (filters.dueDateFrom) searchParams.set('dueDateFrom', filters.dueDateFrom)
  if (filters.dueDateTo) searchParams.set('dueDateTo', filters.dueDateTo)

  filters.priorities.forEach((priority) => {
    searchParams.append('priority', priority)
  })

  return searchParams
}

export function getBoardTaskFilterCount(filters: BoardTaskFilters): number {
  return [filters.search, filters.assigneeId, filters.dueDateFrom, filters.dueDateTo, ...filters.priorities].filter(
    Boolean
  ).length
}

export function hasActiveBoardTaskFilters(filters: BoardTaskFilters): boolean {
  return getBoardTaskFilterCount(filters) > 0
}

export function toListTasksParams(filters: BoardTaskFilters): ListTasksParams {
  return {
    search: filters.search || undefined,
    priority: filters.priorities.length > 0 ? filters.priorities : undefined,
    assigneeId: filters.assigneeId || undefined,
    dueDateFrom: filters.dueDateFrom || undefined,
    dueDateTo: filters.dueDateTo || undefined
  }
}

export function doesTaskMatchBoardTaskFilters(task: Task, filters: BoardTaskFilters): boolean {
  const normalizedSearch = filters.search.toLowerCase()

  if (normalizedSearch && !task.title.toLowerCase().includes(normalizedSearch)) {
    return false
  }

  if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
    return false
  }

  if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
    return false
  }

  if (filters.dueDateFrom && (!task.dueDate || task.dueDate < filters.dueDateFrom)) {
    return false
  }

  if (filters.dueDateTo && (!task.dueDate || task.dueDate > filters.dueDateTo)) {
    return false
  }

  return true
}
