import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationException } from '@/core/exceptions/index.js';

type ValidatedRequestParts = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export function validateRequest(schema: ZodSchema): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      })) as ValidatedRequestParts;

      req.body = parsed.body ?? req.body;
      req.params = (parsed.params ?? req.params) as Request['params'];
      req.query = (parsed.query ?? req.query) as Request['query'];

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.reduce<Record<string, string[]>>((acc, issue) => {
          const field = issue.path.join('.');

          acc[field] ??= [];
          acc[field].push(issue.message);

          return acc;
        }, {});

        next(new ValidationException('Validation failed', details));
        return;
      }

      next(error);
    }
  };
}

export default validateRequest;
