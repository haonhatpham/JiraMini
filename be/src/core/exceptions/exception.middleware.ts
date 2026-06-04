import type { NextFunction, Request, Response } from 'express';
import { env } from '@/env.js';
import { logger } from '../logger/logger.js';
import { HttpException } from '@/core/exceptions/http.exception.js';
import type { ErrorResponse } from '@/core/http/api-response.types.js';
import { HttpStatus } from '@/core/http/http-status.js';
import { BadRequestException, ValidationException } from './common.exception.js';

export const GENERIC_ERROR_RESPONSE: ErrorResponse = {
  status: HttpStatus.INTERNAL,
  code: 'UNKNOWN_ERROR',
  message: 'Unknown error'
};

const isProduction = env.NODE_ENV === 'production';

export function globalExceptionHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpException) {
    logger.warn({
      code: err.code,
      status: err.status,
      message: err.message,
      method: req.method,
      path: req.originalUrl
    });
    const shouldExpose = !isProduction || err.expose;
    const response: ErrorResponse = {
      status: err.status,
      code: err.code,
      message: shouldExpose ? err.message : GENERIC_ERROR_RESPONSE.message
    };

    if (err instanceof ValidationException) {
      response.details = err.details;
    }

    return res.status(err.status).json(response);
  }

  // Unknown error
  logger.error({
    err,
    method: req.method,
    path: req.originalUrl
  });
  // Development mode
  if (!isProduction && err instanceof Error) {
    return res.status(HttpStatus.INTERNAL).json({
      status: HttpStatus.INTERNAL,
      code: 'UNKNOWN_ERROR',
      message: err.message
    });
  }
  // Production mode
  return res.status(GENERIC_ERROR_RESPONSE.status).json(GENERIC_ERROR_RESPONSE);
}

export function malformedErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof SyntaxError && 'body' in err) {
    return next(new BadRequestException('Malformed JSON request body'));
  }

  return next(err);
}
