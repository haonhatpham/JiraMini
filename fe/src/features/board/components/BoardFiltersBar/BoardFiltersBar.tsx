import { useCallback, useEffect, useState } from 'react'
import type { TaskPriority } from '@jiramini/shared/task'
import type { TaskAssigneeOption } from '@/features/tasks/components/TaskForm/TaskForm'
import { useDebouncedValue } from '@/hook/useDebouncedValue'
import { EMPTY_BOARD_TASK_FILTERS, getBoardTaskFilterCount, type BoardTaskFilters } from '../../filters/taskFilters'
import TaskBoardFilters from '../TaskBoardFilters/TaskBoardFilters'

type SearchDraft = {
  urlSearch: string
  value: string
}

type BoardFiltersBarProps = {
  filters: BoardTaskFilters
  assigneeOptions: TaskAssigneeOption[]
  resultCount: number
  loading: boolean
  onChange: (filters: BoardTaskFilters) => void
}

export default function BoardFiltersBar({
  filters,
  assigneeOptions,
  resultCount,
  loading,
  onChange
}: BoardFiltersBarProps) {
  const [searchDraft, setSearchDraft] = useState<SearchDraft>(() => ({
    urlSearch: filters.search,
    value: filters.search
  }))
  const searchInput = searchDraft.urlSearch === filters.search ? searchDraft.value : filters.search
  const debouncedSearch = useDebouncedValue(searchInput, 400)
  const activeFilterCount = getBoardTaskFilterCount(filters)

  useEffect(() => {
    const normalizedSearch = debouncedSearch.trim()

    if (normalizedSearch === filters.search) {
      return
    }

    onChange({
      ...filters,
      search: normalizedSearch
    })
  }, [debouncedSearch, filters, onChange])

  const handlePriorityFilterChange = useCallback(
    (priority: TaskPriority, checked: boolean) => {
      const nextPriorities = checked
        ? Array.from(new Set([...filters.priorities, priority]))
        : filters.priorities.filter((currentPriority) => currentPriority !== priority)

      onChange({
        ...filters,
        priorities: nextPriorities
      })
    },
    [filters, onChange]
  )

  const handleSearchFilterChange = useCallback(
    (value: string) => {
      setSearchDraft({
        urlSearch: filters.search,
        value
      })
    },
    [filters.search]
  )

  const handleClearFilters = useCallback(() => {
    setSearchDraft({
      urlSearch: filters.search,
      value: ''
    })
    onChange(EMPTY_BOARD_TASK_FILTERS)
  }, [filters.search, onChange])

  return (
    <TaskBoardFilters
      filters={filters}
      searchValue={searchInput}
      assigneeOptions={assigneeOptions}
      resultCount={resultCount}
      loading={loading}
      activeFilterCount={activeFilterCount}
      onSearchChange={handleSearchFilterChange}
      onPriorityChange={handlePriorityFilterChange}
      onAssigneeChange={(assigneeId) => onChange({ ...filters, assigneeId })}
      onDueDateFromChange={(dueDateFrom) => onChange({ ...filters, dueDateFrom })}
      onDueDateToChange={(dueDateTo) => onChange({ ...filters, dueDateTo })}
      onClear={handleClearFilters}
    />
  )
}
