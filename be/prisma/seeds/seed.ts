import { PrismaClient } from '@prisma/client';
import { seedTasks } from './task.seed.js';
import { seedUsers } from './user.seed.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting database seeding...');

  await seedUsers(prisma);
  await seedTasks(prisma);

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
