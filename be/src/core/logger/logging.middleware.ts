import type { NextFunction, Request, Response } from 'express';
import { LogScope, logger } from './logger.js';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    const message = `${LogScope.REQUEST} ${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(2)}ms`;

    if (res.statusCode >= 400) {
      logger.warn(message);
      return;
    }

    logger.info(message);
  });

  next();
}
