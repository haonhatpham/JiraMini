// src/features/task/utils.ts

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(`${dueDate}T23:59:59`)

  return targetDate < today
}
