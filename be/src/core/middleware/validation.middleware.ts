import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { ValidationException } from '@/core/exceptions/index.js';
import type { ErrorDetail } from '@/core/http/api-response.types.js';

type ValidatedRequestParts = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

function formatIssuePath(path: (string | number | symbol)[]): string {
  const normalizedPath = ['body', 'params', 'query'].includes(String(path[0])) ? path.slice(1) : path;
  const field = normalizedPath.map(String).join('.');

  return field || 'request';
}

export function validateRequest(schema: ZodSchema): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      })) as ValidatedRequestParts;

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      if (parsed.params !== undefined) {
        req.params = parsed.params as Request['params'];
      }

      if (parsed.query !== undefined) {
        req.validated = {
          ...req.validated,
          query: parsed.query
        };
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: ErrorDetail[] = error.issues.map((issue) => ({
          field: formatIssuePath(issue.path),
          message: issue.message
        }));

        next(new ValidationException('Validation failed', details));
        return;
      }

      next(error);
    }
  };
}

export default validateRequest;
