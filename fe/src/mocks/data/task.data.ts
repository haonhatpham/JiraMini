import type { Task } from '@/features/tasks/types'

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Setup project structure',
    description: 'Create feature-based folders for board and task modules.',
    priority: 'high',
    assignee: 'Hao Pham',
    dueDate: '2026-06-05',
    columnId: 'backlog'
  },
  {
    id: 'task-2',
    title: 'Build board layout',
    description: 'Create four columns with responsive and empty states.',
    priority: 'medium',
    assignee: 'Hao Pham',
    dueDate: '2026-06-10',
    columnId: 'todo'
  },
  {
    id: 'task-3',
    title: 'Create task card',
    description: 'Show title, description, priority, assignee, and due date.',
    priority: 'low',
    assignee: 'Hao Pham',
    dueDate: '2026-06-15',
    columnId: 'in-progress'
  },
  {
    id: 'task-4',
    title: 'Fix overdue style',
    description: 'Highlight overdue tasks based on the due date.',
    priority: 'critical',
    assignee: 'Hao Pham',
    dueDate: '2026-06-01',
    columnId: 'done'
  }
]
