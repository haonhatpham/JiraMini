import { prisma } from '@/core/database/prisma.js';
import { mapUser, type UserResponse } from './user.mapper.js';

export default class UserService {
  public async findAll(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true
      },
      orderBy: [
        {
          name: 'asc'
        },
        {
          email: 'asc'
        }
      ]
    });

    return users.map(mapUser);
  }
}
