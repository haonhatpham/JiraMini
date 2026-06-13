import Route from '@/core/interfaces/routes.interface.js';
import validateRequest from '@/core/middleware/validation.middleware.js';
import { env } from '@/env.js';
import { Router } from 'express';
import AuthController from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';

export default class AuthRoute implements Route {
  public path = `${env.APP_PREFIX}/auth`;
  public router = Router();
  private readonly authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}/register`, validateRequest(registerSchema), this.authController.register);
    this.router.post(`${this.path}/login`, validateRequest(loginSchema), this.authController.login);
  }
}
