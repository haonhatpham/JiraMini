import { TaskPriority, TaskStatus, type PrismaClient } from '@prisma/client';
import { userSeeds } from './user.seed.js';

const [admin, frontendOwner, backendOwner, reviewer] = userSeeds;

export const taskSeeds = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Setup project structure',
    description: 'Create feature-based folders for auth, users, and tasks.',
    priority: TaskPriority.high,
    status: TaskStatus.backlog,
    position: 1,
    assigneeId: null,
    createdBy: admin.id,
    dueDate: new Date('2026-06-05')
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Build board layout',
    description: 'Create backlog, todo, in-progress, and done columns.',
    priority: TaskPriority.medium,
    status: TaskStatus.todo,
    position: 1,
    assigneeId: frontendOwner.id,
    createdBy: admin.id,
    dueDate: new Date('2026-06-10')
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Create task API',
    description: 'Implement CRUD endpoints with validation and Prisma queries.',
    priority: TaskPriority.critical,
    status: TaskStatus.in_progress,
    position: 1,
    assigneeId: backendOwner.id,
    createdBy: admin.id,
    dueDate: new Date('2026-06-15')
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Review seed data',
    description: 'Verify users, nullable task fields, and enum-backed status values.',
    priority: TaskPriority.low,
    status: TaskStatus.done,
    position: 1,
    assigneeId: reviewer.id,
    createdBy: admin.id,
    dueDate: new Date('2026-06-01')
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    title: 'Add task filters',
    description: 'Support filtering by status, priority, assignee, and due date.',
    priority: TaskPriority.medium,
    status: TaskStatus.backlog,
    position: 2,
    assigneeId: backendOwner.id,
    createdBy: admin.id,
    dueDate: null
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    title: 'Polish empty states',
    description: null,
    priority: TaskPriority.low,
    status: TaskStatus.todo,
    position: 2,
    assigneeId: null,
    createdBy: admin.id,
    dueDate: null
  }
] as const;

export async function seedTasks(prisma: PrismaClient): Promise<void> {
  for (const task of taskSeeds) {
    await prisma.task.upsert({
      where: {
        id: task.id
      },
      update: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        position: task.position,
        assigneeId: task.assigneeId,
        createdBy: task.createdBy,
        dueDate: task.dueDate
      },
      create: task
    });
  }
}
