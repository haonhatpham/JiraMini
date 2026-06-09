import type { Task } from '@/features/tasks/types'

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Setup project structure',
    description: 'Create feature-based folders for board and task modules.',
    priority: 'high',
    assigneeId: '',
    assignee: 'Hao Pham',
    dueDate: '2026-06-05',
    createdBy: 'Hao Pham',
    createdAt: '2026-06-01T09:30:00.000Z',
    updatedAt: '2026-06-01T09:30:00.000Z',
    columnId: 'backlog',
    position: 0
  },
  {
    id: 'task-2',
    title: 'Build board layout',
    description: 'Create four columns with responsive and empty states.',
    priority: 'medium',
    assigneeId: '',
    assignee: 'Hao Pham',
    dueDate: '2026-06-10',
    createdBy: 'Hao Pham',
    createdAt: '2026-06-02T09:30:00.000Z',
    updatedAt: '2026-06-02T09:30:00.000Z',
    columnId: 'todo',
    position: 0
  },
  {
    id: 'task-3',
    title: 'Create task card',
    description: 'Show title, description, priority, assignee, and due date.',
    priority: 'low',
    assigneeId: '',
    assignee: 'Hao Pham',
    dueDate: '2026-06-15',
    createdBy: 'Hao Pham',
    createdAt: '2026-06-03T09:30:00.000Z',
    updatedAt: '2026-06-03T09:30:00.000Z',
    columnId: 'in-progress',
    position: 0
  },
  {
    id: 'task-4',
    title: 'Fix overdue style',
    description: 'Highlight overdue tasks based on the due date.',
    priority: 'critical',
    assigneeId: '',
    assignee: 'Hao Pham',
    dueDate: '2026-06-01',
    createdBy: 'Hao Pham',
    createdAt: '2026-06-04T09:30:00.000Z',
    updatedAt: '2026-06-04T09:30:00.000Z',
    columnId: 'done',
    position: 0
  }
]
