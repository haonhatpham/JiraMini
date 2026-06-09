import { PrismaClient } from '@prisma/client';
import { taskSeeds, seedTasks } from './task.seed.js';
import { SEED_USER_PASSWORD, seedUsers, userSeeds } from './user.seed.js';

const prisma = new PrismaClient();

async function resetDatabase(): Promise<void> {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  console.log('Starting database reset and seeding...');

  await resetDatabase();
  await seedUsers(prisma);
  await seedTasks(prisma);

  console.log(`Seeded ${userSeeds.length} users and ${taskSeeds.length} tasks.`);
  console.log(`Seed password for all users: ${SEED_USER_PASSWORD}`);
  console.log('Database seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
