import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/core/http/http-status.js';
import AuthService from './auth.service.js';
import { AuthValidation } from './auth.validation.js';

export default class AuthController {
  private readonly authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = AuthValidation.parseRegisterBody(req.body);
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
      const input = AuthValidation.parseLoginBody(req.body);
      const response = await this.authService.login(input);

      res.status(HttpStatus.OK).json({
        data: response
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = AuthValidation.parseBearerToken(req.header('authorization'));
      const user = await this.authService.getProfile(token);

      res.status(HttpStatus.OK).json({
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
}
