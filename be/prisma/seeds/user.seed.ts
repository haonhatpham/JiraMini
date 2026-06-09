import bcrypt from 'bcrypt';
import type { Prisma, PrismaClient } from '@prisma/client';

const SALT_ROUNDS = 10;

export const SEED_USER_PASSWORD = 'Password123!';

export const userSeeds = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@jiramini.local',
    name: 'Admin User',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin%20User'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'product@jiramini.local',
    name: 'Product Owner',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Product%20Owner'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'frontend@jiramini.local',
    name: 'Frontend Engineer',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Frontend%20Engineer'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'backend@jiramini.local',
    name: 'Backend Engineer',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Backend%20Engineer'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'qa@jiramini.local',
    name: 'QA Reviewer',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=QA%20Reviewer'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'design@jiramini.local',
    name: 'UX Designer',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=UX%20Designer'
  }
] as const satisfies readonly Omit<Prisma.UserCreateManyInput, 'passwordHash'>[];

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, SALT_ROUNDS);

  await prisma.user.createMany({
    data: userSeeds.map((user) => ({
      ...user,
      passwordHash
    }))
  });
}
