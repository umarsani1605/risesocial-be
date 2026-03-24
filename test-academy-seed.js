import { seedAcademies } from './prisma/seeds/academySeed.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Testing academy seeder...\n');

  try {
    await seedAcademies();
    console.log('\n✅ Academy seeding test completed successfully!');
  } catch (error) {
    console.error('❌ Error during academy seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
