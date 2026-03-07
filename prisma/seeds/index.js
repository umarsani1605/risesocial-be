import { PrismaClient } from '@prisma/client';
import { seedUsers } from './userSeed.js';
import { seedAcademies } from './bootcampSeed.js';
import { seedJobs } from './jobsSeed.js';
import { seedTestimonials } from './testimonialsSeed.js';
import { seedPrograms } from './programsSeed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with enhanced schema...\n');

  try {
    // Jalankan seeder secara berurutan untuk menjaga referential integrity

    console.log('👥 Seeding users...');
    await seedUsers();
    console.log('✅ Users seeding completed\n');

    console.log('📚 Seeding academies...');
    await seedAcademies();
    console.log('✅ Academies seeding completed\n');

    console.log('💼 Seeding jobs (Full LinkedIn API)...');
    await seedJobs();
    console.log('✅ Jobs seeding completed\n');

    console.log('💬 Seeding testimonials...');
    await seedTestimonials();
    console.log('✅ Testimonials seeding completed\n');

    console.log('📋 Seeding programs...');
    await seedPrograms();
    console.log('✅ Programs seeding completed\n');

    console.log('🎉 All seeding completed successfully!');
    console.log('');
    console.log('🚀 Enhanced features implemented:');
    console.log('   ✅ Integer auto-increment IDs');
    console.log('   ✅ Data-driven JSON seeders');
    console.log('   ✅ Bulk operations for performance');
    console.log('   ✅ Transaction-based consistency');
    console.log('   ✅ Comprehensive data validation');
    console.log('   ✅ Performance indexes');
    console.log('   ✅ Full LinkedIn API integration (80+ fields)');
    console.log('   ✅ AI-enhanced job insights & salary data');
    console.log('   ✅ Rich company profiles & location intelligence');
    console.log('   ✅ Complete jobs management system');
    console.log('   ✅ Testimonials management system');
    console.log('   ✅ Programs management system');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
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
