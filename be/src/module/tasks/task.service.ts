import { Prisma, TaskStatus as PrismaTaskStatus } from '@prisma/client';
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

const taskInclude = {
  assignee: true,
  creator: true
} as const;

export default class TaskService {
  public async findAll(query: ListTasksQuery): Promise<ListTasksResponse> {
    const where = this.buildWhere(query);
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

  public async findById(id: string): Promise<TaskResponse> {
    const task = await prisma.task.findUnique({
      where: {
        id
      },
      include: taskInclude
    });

    if (!task) {
      throw new NotFoundException('Task not found', 'TASK_NOT_FOUND');
    }

    return mapTask(task);
  }

  public async create(input: CreateTaskBody): Promise<TaskResponse> {
    await this.assertUsersExist(input.createdBy, input.assigneeId);

    try {
      const task = await prisma.task.create({
        data: {
          title: input.title,
          description: input.description ?? null,
          priority: input.priority,
          status: this.toPrismaStatus(input.status),
          position: input.position,
          assigneeId: input.assigneeId ?? null,
          createdBy: input.createdBy,
          dueDate: this.toDate(input.dueDate)
        },
        include: taskInclude
      });

      return mapTask(task);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  public async update(id: string, input: UpdateTaskBody): Promise<TaskResponse> {
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

  public async updateStatus(id: string, input: UpdateTaskStatusBody): Promise<TaskResponse> {
    try {
      const task = await prisma.task.update({
        where: {
          id
        },
        data: {
          status: this.toPrismaStatus(input.status),
          position: input.position
        },
        include: taskInclude
      });

      return mapTask(task);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  public async delete(id: string): Promise<void> {
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
    if (query.priority) where.priority = query.priority;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.createdBy) where.createdBy = query.createdBy;

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    return where;
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

  private toPrismaStatus(status: TaskStatus): PrismaTaskStatus {
    return status === 'in-progress' ? PrismaTaskStatus.in_progress : status;
  }

  private toDate(value: string | null | undefined): Date | null {
    return value ? new Date(`${value}T00:00:00.000Z`) : null;
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
