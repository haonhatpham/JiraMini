import bcrypt from 'bcrypt';
import type { PrismaClient } from '@prisma/client';

const SALT_ROUNDS = 10;

export const SEED_USER_PASSWORD = 'Password123@';

export const userSeeds = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@jiramini.local',
    name: 'Admin User',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin%20User'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'frontend@jiramini.local',
    name: 'Frontend Owner',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Frontend%20Owner'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'backend@jiramini.local',
    name: 'Backend Owner',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Backend%20Owner'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'reviewer@jiramini.local',
    name: 'Reviewer User',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Reviewer%20User'
  }
] as const;

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, SALT_ROUNDS);

  for (const user of userSeeds) {
    await prisma.user.upsert({
      where: {
        id: user.id
      },
      update: {
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        passwordHash
      },
      create: {
        ...user,
        passwordHash
      }
    });
  }
}
