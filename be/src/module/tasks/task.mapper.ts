import { type Prisma, type User } from '@prisma/client';
import { taskResponseSchema, type TaskResponse, type TaskStatus } from './task.schema.js';

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    assignee: true;
    creator: true;
  };
}>;

function mapTaskUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl
  };
}

function mapStatus(status: string): TaskStatus {
  return (status === 'in_progress' ? 'in-progress' : status) as TaskStatus;
}

function mapDateOnly(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

export function mapTask(task: TaskWithRelations): TaskResponse {
  return taskResponseSchema.parse({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: mapStatus(task.status),
    position: task.position,
    assigneeId: task.assigneeId,
    createdBy: task.createdBy,
    dueDate: mapDateOnly(task.dueDate),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignee: task.assignee ? mapTaskUser(task.assignee) : null,
    creator: mapTaskUser(task.creator)
  });
}
