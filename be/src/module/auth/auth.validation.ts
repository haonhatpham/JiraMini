import { z } from 'zod';
import { UnauthorizedException, ValidationException } from '@/core/exceptions/common.exception.js';
import type { LoginInput, RegisterInput } from './auth.type.js';

const registerSchema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
    name: z.string().trim().min(1).max(100),
    avatarUrl: z.preprocess(
      (value) => (value === '' ? null : value),
      z.string().trim().url().max(500).nullable().optional()
    )
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().min(1).max(72)
  })
  .strict();

export class AuthValidation {
  public static parseRegisterBody(body: unknown): RegisterInput {
    return this.parse(registerSchema, body);
  }

  public static parseLoginBody(body: unknown): LoginInput {
    return this.parse(loginSchema, body);
  }

  public static parseBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    return token;
  }

  private static parse<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);

    if (!result.success) {
      throw new ValidationException('Validation failed', result.error.flatten().fieldErrors);
    }

    return result.data;
  }
}
