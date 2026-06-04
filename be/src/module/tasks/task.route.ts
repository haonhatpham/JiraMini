import Route from '@/core/interfaces/routes.interface.js';
import validateRequest from '@/core/middleware/validation.middleware.js';
import { env } from '@/env.js';
import { Router } from 'express';
import TaskController from './task.controller.js';
import {
  createTaskSchema,
  deleteTaskSchema,
  getTaskByIdSchema,
  listTasksSchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from './task.schema.js';

export default class TaskRoute implements Route {
  public path = `${env.APP_PREFIX}/tasks`;
  public router = Router();
  private readonly taskController = new TaskController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, validateRequest(listTasksSchema), this.taskController.getTasks);
    this.router.get(`${this.path}/:id`, validateRequest(getTaskByIdSchema), this.taskController.getTask);
    this.router.post(this.path, validateRequest(createTaskSchema), this.taskController.createTask);
    this.router.patch(
      `${this.path}/:id/status`,
      validateRequest(updateTaskStatusSchema),
      this.taskController.updateTaskStatus
    );
    this.router.patch(`${this.path}/:id`, validateRequest(updateTaskSchema), this.taskController.updateTask);
    this.router.delete(`${this.path}/:id`, validateRequest(deleteTaskSchema), this.taskController.deleteTask);
  }
}
