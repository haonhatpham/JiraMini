import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { TaskPriority } from '@jiramini/shared/task'
import { PRIORITY_OPTIONS } from '@/features/tasks/constants'
import type { BoardTaskFilters } from '../../filters/taskFilters'
import styles from './styles.module.css'

type AssigneeOption = {
  id: string
  name: string
  email?: string
}

type TaskBoardFiltersProps = {
  filters: BoardTaskFilters
  searchValue: string
  assigneeOptions: AssigneeOption[]
  resultCount: number
  loading: boolean
  activeFilterCount: number
  onSearchChange: (value: string) => void
  onPriorityChange: (priority: TaskPriority, checked: boolean) => void
  onAssigneeChange: (value: string) => void
  onDueDateFromChange: (value: string) => void
  onDueDateToChange: (value: string) => void
  onClear: () => void
}

const PRIORITY_BADGE_CLASS_NAMES: Record<TaskPriority, string> = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh,
  critical: styles.priorityCritical
}

export default function TaskBoardFilters({
  filters,
  searchValue,
  assigneeOptions,
  resultCount,
  loading,
  activeFilterCount,
  onSearchChange,
  onPriorityChange,
  onAssigneeChange,
  onDueDateFromChange,
  onDueDateToChange,
  onClear
}: TaskBoardFiltersProps) {
  const [priorityOpen, setPriorityOpen] = useState(false)
  const priorityRef = useRef<HTMLDivElement>(null)
  const resultLabel = loading ? 'Searching...' : `Showing ${resultCount} result${resultCount === 1 ? '' : 's'}`
  const selectedPriorityLabels = PRIORITY_OPTIONS.filter((priority) => filters.priorities.includes(priority.value)).map(
    (priority) => priority.label
  )
  const priorityButtonLabel =
    selectedPriorityLabels.length > 0 ? `Priority: ${selectedPriorityLabels.join(', ')}` : 'Priority'

  useEffect(() => {
    if (!priorityOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (priorityRef.current?.contains(event.target as Node)) {
        return
      }

      setPriorityOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPriorityOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [priorityOpen])

  return (
    <section className={styles.filters} aria-label='Task filters'>
      <label className={styles.searchField}>
        <span className={styles.searchControl}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type='search'
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder='Search task...'
          />
        </span>
      </label>

      <div ref={priorityRef} className={styles.priorityDropdown}>
        <button
          type='button'
          className={`${styles.priorityButton} ${priorityOpen ? styles.priorityButtonOpen : ''}`}
          aria-expanded={priorityOpen}
          onClick={() => setPriorityOpen((currentOpen) => !currentOpen)}
        >
          <span>{priorityButtonLabel}</span>
          <ChevronDown size={15} className={`${styles.chevron} ${priorityOpen ? styles.chevronOpen : ''}`} />
        </button>

        {priorityOpen && (
          <div className={styles.priorityMenu}>
            <ul className={styles.priorityList}>
              {PRIORITY_OPTIONS.map((priority) => (
                <li key={priority.value}>
                  <label className={styles.priorityOption}>
                    <input
                      type='checkbox'
                      checked={filters.priorities.includes(priority.value)}
                      onChange={(event) => onPriorityChange(priority.value, event.target.checked)}
                    />
                    <span className={styles.priorityName}>{priority.label}</span>
                    <span className={`${styles.priorityBadge} ${PRIORITY_BADGE_CLASS_NAMES[priority.value]}`}>
                      {priority.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <label className={styles.field}>
        <select value={filters.assigneeId} onChange={(event) => onAssigneeChange(event.target.value)}>
          <option value=''>Assignee: All</option>
          {assigneeOptions.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {`Assignee: ${assignee.name}`}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.dateLabel}>From:</span>
        <input type='date' value={filters.dueDateFrom} onChange={(event) => onDueDateFromChange(event.target.value)} />
      </label>

      <label className={styles.field}>
        <span className={styles.dateLabel}>To:</span>
        <input type='date' value={filters.dueDateTo} onChange={(event) => onDueDateToChange(event.target.value)} />
      </label>

      <button type='button' className={styles.clearButton} onClick={onClear} disabled={activeFilterCount === 0}>
        <X size={14} />
        Clear all
      </button>

      <div className={styles.meta}>
        <span className={styles.resultCount}>{resultLabel}</span>
      </div>
    </section>
  )
}
