import Route from '@/core/interfaces/routes.interface.js';
import authMiddleware from '@/core/middleware/auth.middleware.js';
import { env } from '@/env.js';
import { Router } from 'express';
import UserController from './user.controller.js';

export default class UserRoute implements Route {
  public path = `${env.APP_PREFIX}/users`;
  public router = Router();
  private readonly userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, authMiddleware, this.userController.getUsers);
  }
}
