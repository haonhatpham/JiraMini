import type { User } from '@prisma/client';
import type { AuthUserDto } from './auth.schema.js';

export function mapAuthUser(user: User): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString()
  };
}
