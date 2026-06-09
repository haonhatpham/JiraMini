import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/core/http/http-status.js';
import AuthService from './auth.service.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

export default class AuthController {
  private readonly authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as RegisterInput;
      const response = await this.authService.register(input);

      res.status(HttpStatus.CREATED).json({
        data: response
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as LoginInput;
      const response = await this.authService.login(input);

      res.status(HttpStatus.OK).json({
        data: response
      });
    } catch (error) {
      next(error);
    }
  };
}
