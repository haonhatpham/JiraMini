import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/core/http/http-status.js';
import UserService from './user.service.js';

export default class UserController {
  private readonly userService = new UserService();

  public getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.findAll();

      res.status(HttpStatus.OK).json({
        data: users
      });
    } catch (error) {
      next(error);
    }
  };
}
