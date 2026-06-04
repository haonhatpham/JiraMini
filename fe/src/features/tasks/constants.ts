// src/features/task/constants.ts

import type { TaskPriority } from './types'

export const PRIORITY_OPTIONS: {
  value: TaskPriority
  label: string
}[] = [
  {
    value: 'low',
    label: 'Low'
  },
  {
    value: 'medium',
    label: 'Medium'
  },
  {
    value: 'high',
    label: 'High'
  },
  {
    value: 'critical',
    label: 'Critical'
  }
]

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
}

export const PRIORITY_CLASS_NAMES: Record<TaskPriority, string> = {
  low: 'priorityLow',
  medium: 'priorityMedium',
  high: 'priorityHigh',
  critical: 'priorityCritical'
}
