import { prisma } from '@/core/database/prisma.js';

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export default class UserService {
  public async findAll(): Promise<UserResponse[]> {
    return prisma.user.findMany({
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
  }
}
