import { Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@/core/exceptions/common.exception.js';
import { prisma } from '@/core/database/prisma.js';
import { listTasksResponseSchema } from './task.schema.js';
import { mapTask } from './task.mapper.js';
import type {
  CreateTaskBody,
  ListTasksQuery,
  ListTasksResponse,
  TaskResponse,
  TaskStatus,
  UpdateTaskBody,
  UpdateTaskStatusBody
} from './task.schema.js';

type PrismaTaskStatusValue = NonNullable<Prisma.TaskUncheckedCreateInput['status']>;

const taskInclude = {
  assignee: true,
  creator: true
} as const;

export default class TaskService {
  public async findAll(query: ListTasksQuery, userId: string): Promise<ListTasksResponse> {
    const where = this.buildScopedWhere(query, userId);
    const skip = (query.page - 1) * query.limit;
    const orderBy = {
      [query.sortBy]: query.sortOrder
    } as Prisma.TaskOrderByWithRelationInput;

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy,
        skip,
        take: query.limit
      }),
      prisma.task.count({
        where
      })
    ]);

    return listTasksResponseSchema.parse({
      data: tasks.map(mapTask),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    });
  }

  public async findById(id: string, userId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: this.buildTaskAccessWhere(id, userId),
      include: taskInclude
    });

    if (!task) {
      throw new NotFoundException('Task not found', 'TASK_NOT_FOUND');
    }

    return mapTask(task);
  }

  public async create(input: CreateTaskBody, createdBy: string): Promise<TaskResponse> {
    const assigneeId = input.assigneeId ?? null;

    await this.assertUsersExist(createdBy, assigneeId);

    try {
      const task = await prisma.task.create({
        data: {
          title: input.title,
          description: input.description ?? null,
          priority: input.priority,
          status: this.toPrismaStatus(input.status),
          position: input.position,
          assigneeId,
          createdBy,
          dueDate: this.toDate(input.dueDate)
        },
        include: taskInclude
      });

      return mapTask(task);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  public async update(id: string, input: UpdateTaskBody, userId: string): Promise<TaskResponse> {
    await this.assertTaskAccessible(id, userId);

    if ('assigneeId' in input) {
      await this.assertUsersExist(undefined, input.assigneeId);
    }

    try {
      const task = await prisma.task.update({
        where: {
          id
        },
        data: this.toUpdateData(input),
        include: taskInclude
      });

      return mapTask(task);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  public async updateStatus(id: string, input: UpdateTaskStatusBody, userId: string): Promise<TaskResponse> {
    try {
      const task = await prisma.$transaction(async (tx) => {
        const currentTask = await tx.task.findFirst({
          where: this.buildTaskAccessWhere(id, userId),
          include: taskInclude
        });

        if (!currentTask) {
          throw new NotFoundException('Task not found', 'TASK_NOT_FOUND');
        }

        const oldStatus = this.fromPrismaStatus(currentTask.status);
        const newStatus = input.status;
        const oldPosition = currentTask.position;
        const newPosition = await this.resolveMovePosition(tx, oldStatus, newStatus, input.position);

        if (oldStatus === newStatus) {
          await this.reorderWithinStatus(tx, oldStatus, oldPosition, newPosition);
        } else {
          await this.moveAcrossStatuses(tx, oldStatus, newStatus, oldPosition, newPosition);
        }

        return tx.task.update({
          where: {
            id
          },
          data: {
            status: this.toPrismaStatus(newStatus),
            position: newPosition
          },
          include: taskInclude
        });
      });

      return mapTask(task);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  public async delete(id: string, userId: string): Promise<void> {
    await this.assertTaskAccessible(id, userId);

    try {
      await prisma.task.delete({
        where: {
          id
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private buildWhere(query: ListTasksQuery): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (query.status) where.status = this.toPrismaStatus(query.status);
    if (query.priority?.length) where.priority = { in: query.priority };
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.createdBy) where.createdBy = query.createdBy;

    if (query.dueDateFrom || query.dueDateTo) {
      where.dueDate = {
        ...(query.dueDateFrom ? { gte: this.toDateFilterValue(query.dueDateFrom) } : {}),
        ...(query.dueDateTo ? { lte: this.toDateFilterValue(query.dueDateTo) } : {})
      };
    }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: 'insensitive'
      };
    }

    return where;
  }

  private buildUserTaskScope(userId: string): Prisma.TaskWhereInput {
    return {
      OR: [
        {
          createdBy: userId
        },
        {
          assigneeId: userId
        }
      ]
    };
  }

  private buildScopedWhere(query: ListTasksQuery, userId: string): Prisma.TaskWhereInput {
    return {
      AND: [this.buildWhere(query), this.buildUserTaskScope(userId)]
    };
  }

  private buildTaskAccessWhere(id: string, userId: string): Prisma.TaskWhereInput {
    return {
      id,
      ...this.buildUserTaskScope(userId)
    };
  }

  private async assertTaskAccessible(id: string, userId: string): Promise<void> {
    const task = await prisma.task.findFirst({
      where: this.buildTaskAccessWhere(id, userId),
      select: {
        id: true
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found', 'TASK_NOT_FOUND');
    }
  }

  private toUpdateData(input: UpdateTaskBody): Prisma.TaskUncheckedUpdateInput {
    const data: Prisma.TaskUncheckedUpdateInput = {};

    if ('title' in input) data.title = input.title;
    if ('description' in input) data.description = input.description ?? null;
    if ('priority' in input) data.priority = input.priority;
    if ('status' in input && input.status) data.status = this.toPrismaStatus(input.status);
    if ('position' in input) data.position = input.position;
    if ('assigneeId' in input) data.assigneeId = input.assigneeId ?? null;
    if ('dueDate' in input) data.dueDate = this.toDate(input.dueDate);

    return data;
  }

  private async resolveMovePosition(
    tx: Prisma.TransactionClient,
    oldStatus: TaskStatus,
    newStatus: TaskStatus,
    requestedPosition: number
  ): Promise<number> {
    const isSameStatus = oldStatus === newStatus;
    const targetStatusTaskCount = await tx.task.count({
      where: {
        status: this.toPrismaStatus(newStatus)
      }
    });
    const maxPosition = isSameStatus ? Math.max(targetStatusTaskCount - 1, 0) : targetStatusTaskCount;

    return Math.min(Math.max(requestedPosition, 0), maxPosition);
  }

  private async reorderWithinStatus(
    tx: Prisma.TransactionClient,
    status: TaskStatus,
    oldPosition: number,
    newPosition: number
  ): Promise<void> {
    if (newPosition === oldPosition) {
      return;
    }

    if (newPosition < oldPosition) {
      await tx.task.updateMany({
        where: {
          status: this.toPrismaStatus(status),
          position: {
            gte: newPosition,
            lt: oldPosition
          }
        },
        data: {
          position: {
            increment: 1
          }
        }
      });

      return;
    }

    await tx.task.updateMany({
      where: {
        status: this.toPrismaStatus(status),
        position: {
          gt: oldPosition,
          lte: newPosition
        }
      },
      data: {
        position: {
          decrement: 1
        }
      }
    });
  }

  private async moveAcrossStatuses(
    tx: Prisma.TransactionClient,
    oldStatus: TaskStatus,
    newStatus: TaskStatus,
    oldPosition: number,
    newPosition: number
  ): Promise<void> {
    await tx.task.updateMany({
      where: {
        status: this.toPrismaStatus(oldStatus),
        position: {
          gt: oldPosition
        }
      },
      data: {
        position: {
          decrement: 1
        }
      }
    });

    await tx.task.updateMany({
      where: {
        status: this.toPrismaStatus(newStatus),
        position: {
          gte: newPosition
        }
      },
      data: {
        position: {
          increment: 1
        }
      }
    });
  }

  private toDate(value: string | null | undefined): Date | null {
    return value ? new Date(`${value}T00:00:00.000Z`) : null;
  }

  private toDateFilterValue(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private fromPrismaStatus(status: string): TaskStatus {
    return (status === 'in_progress' ? 'in-progress' : status) as TaskStatus;
  }

  private toPrismaStatus(status: TaskStatus): PrismaTaskStatusValue {
    const taskStatusEnum = (Prisma as unknown as { TaskStatus?: Record<string, PrismaTaskStatusValue> }).TaskStatus;

    if (status === 'in-progress' && taskStatusEnum?.in_progress) {
      return taskStatusEnum.in_progress;
    }

    return status as PrismaTaskStatusValue;
  }

  private async assertUsersExist(createdBy?: string, assigneeId?: string | null): Promise<void> {
    if (createdBy) {
      const creator = await prisma.user.findUnique({
        where: {
          id: createdBy
        },
        select: {
          id: true
        }
      });

      if (!creator) {
        throw new BadRequestException('Creator does not exist', 'CREATOR_NOT_FOUND');
      }
    }

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: {
          id: assigneeId
        },
        select: {
          id: true
        }
      });

      if (!assignee) {
        throw new BadRequestException('Assignee does not exist', 'ASSIGNEE_NOT_FOUND');
      }
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Task not found', 'TASK_NOT_FOUND');
      }

      if (error.code === 'P2003') {
        throw new BadRequestException('Related user does not exist', 'TASK_RELATION_NOT_FOUND');
      }
    }

    throw error;
  }
}
