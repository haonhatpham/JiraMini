import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload, type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { BadRequestException, UnauthorizedException } from '@/core/exceptions/common.exception.js';
import { prisma } from '@/core/database/prisma.js';
import { env } from '@/env.js';
import type { AuthResponseDto, AuthTokenPayload, AuthUserDto, LoginInput, RegisterInput } from './auth.type.js';

export default class AuthService {
  public async register(input: RegisterInput): Promise<AuthResponseDto> {
    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    try {
      const user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          avatarUrl: input.avatarUrl
        }
      });

      return {
        user: this.mapUser(user),
        accessToken: this.signAccessToken({
          sub: user.id,
          email: user.email
        })
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Email is already registered', 'EMAIL_ALREADY_EXISTS');
      }

      throw error;
    }
  }

  public async login(input: LoginInput): Promise<AuthResponseDto> {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: this.mapUser(user),
      accessToken: this.signAccessToken({
        sub: user.id,
        email: user.email
      })
    };
  }

  public async getProfile(token: string): Promise<AuthUserDto> {
    const payload = this.verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token user');
    }

    return this.mapUser(user);
  }

  private signAccessToken(payload: AuthTokenPayload): string {
    const options: SignOptions = {
      issuer: env.JWT_ISSUER,
      expiresIn: env.JWT_EXPIRES_IN
    };

    if (env.JWT_AUDIENCE) {
      options.audience = env.JWT_AUDIENCE;
    }

    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  private verifyAccessToken(token: string): AuthTokenPayload {
    const options: VerifyOptions = {
      issuer: env.JWT_ISSUER
    };

    if (env.JWT_AUDIENCE) {
      options.audience = env.JWT_AUDIENCE;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET, options) as JwtPayload;

    if (typeof decoded !== 'object' || typeof decoded.sub !== 'string' || typeof decoded.email !== 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      sub: decoded.sub,
      email: decoded.email
    };
  }

  private mapUser(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
  }): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString()
    };
  }
}
