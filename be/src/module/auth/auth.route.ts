import Route from '@/core/interfaces/routes.interface.js';
import { env } from '@/env.js';
import { Router } from 'express';
import AuthController from './auth.controller.js';

export default class AuthRoute implements Route {
  public path = `${env.APP_PREFIX}/auth`;
  public router = Router();
  private readonly authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}/register`, this.authController.register);
    this.router.post(`${this.path}/login`, this.authController.login);
    this.router.get(`${this.path}/me`, this.authController.me);
  }
}
