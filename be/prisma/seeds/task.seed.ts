import type { Prisma, PrismaClient } from '@prisma/client';
import { userSeeds } from './user.seed.js';

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

const priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low'];
const [adminUser, ...memberUsers] = userSeeds;
const memberCreatorIds = memberUsers.map((user) => user.id);
const memberAssigneeIds = [...memberCreatorIds, null] as const;

const statusConfigs = [
  {
    status: 'backlog',
    taskCount: 14,
    adminVisiblePositions: [0, 5, 9],
    idPrefix: 'aaaaaaaa-aaaa-aaaa-aaaa',
    titlePrefix: 'Backlog discovery',
    description: 'Queued work used to test backlog load-more, filters, and ordering.',
    dueDateStart: 9
  },
  {
    status: 'todo',
    taskCount: 16,
    adminVisiblePositions: [1, 4, 8, 11, 14],
    idPrefix: 'bbbbbbbb-bbbb-bbbb-bbbb',
    titlePrefix: 'Todo implementation',
    description: 'Ready work used to test todo load-more, assignees, and priority chips.',
    dueDateStart: 11
  },
  {
    status: 'in-progress',
    taskCount: 15,
    adminVisiblePositions: [0, 3, 7],
    idPrefix: 'cccccccc-cccc-cccc-cccc',
    titlePrefix: 'In-progress delivery',
    description: 'Active work used to test drag/drop, status updates, and modal detail.',
    dueDateStart: 13
  },
  {
    status: 'done',
    taskCount: 20,
    adminVisiblePositions: [2, 5, 8, 12, 15, 18],
    idPrefix: 'dddddddd-dddd-dddd-dddd',
    titlePrefix: 'Done verification',
    description: 'Completed work used to test done column load-more and date filters.',
    dueDateStart: 3
  }
] as const satisfies readonly {
  status: TaskStatus;
  taskCount: number;
  adminVisiblePositions: readonly number[];
  idPrefix: string;
  titlePrefix: string;
  description: string;
  dueDateStart: number;
}[];

function date(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function taskId(idPrefix: string, position: number): string {
  return `${idPrefix}-${String(position + 1).padStart(12, '0')}`;
}

function isAdminVisibleTask(config: { adminVisiblePositions: readonly number[] }, position: number): boolean {
  return config.adminVisiblePositions.includes(position);
}

function pickCreatorId(config: (typeof statusConfigs)[number], statusIndex: number, position: number): string {
  if (isAdminVisibleTask(config, position) && position % 2 === 0) {
    return adminUser.id;
  }

  return memberCreatorIds[(position * 2 + statusIndex * 3) % memberCreatorIds.length];
}

function pickAssigneeId(
  config: (typeof statusConfigs)[number],
  statusIndex: number,
  position: number
): (typeof memberAssigneeIds)[number] | string {
  if (isAdminVisibleTask(config, position) && position % 2 !== 0) {
    return adminUser.id;
  }

  return memberAssigneeIds[(position * 5 + statusIndex * 2) % memberAssigneeIds.length];
}

function dueDate(config: (typeof statusConfigs)[number], position: number): Date | null {
  if (position % 8 === 0) {
    return null;
  }

  const day = ((config.dueDateStart + position - 1) % 24) + 1;

  return date(`2026-06-${String(day).padStart(2, '0')}`);
}

function createTaskSeed(
  config: (typeof statusConfigs)[number],
  statusIndex: number,
  position: number
): Prisma.TaskCreateManyInput {
  return {
    id: taskId(config.idPrefix, position),
    title: `${config.titlePrefix} ${String(position + 1).padStart(2, '0')}`,
    description: `${config.description} Batch item ${position + 1} of ${config.taskCount}.`,
    priority: priorities[(position + statusIndex) % priorities.length],
    status: config.status,
    position,
    assigneeId: pickAssigneeId(config, statusIndex, position),
    createdBy: pickCreatorId(config, statusIndex, position),
    dueDate: dueDate(config, position)
  };
}

export const taskSeeds = statusConfigs.flatMap((config, statusIndex) =>
  Array.from({ length: config.taskCount }, (_, position) => createTaskSeed(config, statusIndex, position))
) satisfies Prisma.TaskCreateManyInput[];

export async function seedTasks(prisma: PrismaClient): Promise<void> {
  await prisma.task.createMany({
    data: taskSeeds
  });
}
