import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnauthorizedException } from '@/core/exceptions/common.exception.js';
import AuthService from '@/module/auth/auth.service.js';

const authService = new AuthService();

function getBearerToken(authorization?: string): string {
  if (!authorization) {
    throw new UnauthorizedException('Authorization header is required');
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedException('Bearer token is required');
  }

  return token;
}

export const authMiddleware: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = getBearerToken(req.header('authorization'));
    const payload = authService.verifyAccessToken(token);

    req.user = {
      id: payload.sub
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
