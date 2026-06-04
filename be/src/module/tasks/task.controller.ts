import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/core/http/http-status.js';
import TaskService from './task.service.js';
import type {
  CreateTaskBody,
  ListTasksQuery,
  TaskIdParams,
  UpdateTaskBody,
  UpdateTaskStatusBody
} from './task.schema.js';

export default class TaskController {
  private readonly taskService = new TaskService();

  public getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListTasksQuery;
      const response = await this.taskService.findAll(query);

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as TaskIdParams;
      const task = await this.taskService.findById(id);

      res.status(HttpStatus.OK).json({
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  public createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateTaskBody;
      const task = await this.taskService.create(input);

      res.status(HttpStatus.CREATED).json({
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as TaskIdParams;
      const input = req.body as UpdateTaskBody;
      const task = await this.taskService.update(id, input);

      res.status(HttpStatus.OK).json({
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as TaskIdParams;
      const input = req.body as UpdateTaskStatusBody;
      const task = await this.taskService.updateStatus(id, input);

      res.status(HttpStatus.OK).json({
        data: task
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as TaskIdParams;
      await this.taskService.delete(id);

      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}
