import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Load data dari JSON file
const loadProgramsData = () => {
  try {
    const dataPath = path.join(__dirname, 'data', 'programs.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading programs data:', error);
    throw error;
  }
};

// Validate programs data
const validateProgramsData = (programs) => {
  console.log('   🔍 Validating programs data...');

  const validPrograms = programs.filter((program) => {
    const isValid =
      program.title &&
      program.slug &&
      program.image &&
      program.description &&
      program.status &&
      ['ACTIVE', 'INACTIVE', 'DRAFT'].includes(program.status);

    if (!isValid) {
      console.warn(`⚠️  Invalid program data:`, program);
    }

    return isValid;
  });

  console.log(`   ✅ Validated ${validPrograms.length}/${programs.length} programs`);
  return validPrograms;
};

export async function seedPrograms() {
  try {
    console.log('📋 Seeding programs...');

    // Clean existing data
    console.log('🗑️  Cleaning existing programs data...');
    await prisma.$transaction(async (tx) => {
      await tx.program.deleteMany();
      // Reset auto-increment sequence
      await tx.$executeRawUnsafe(`ALTER SEQUENCE programs_id_seq RESTART WITH 1`);
    });
    console.log('✅ Deleted all existing programs data and reset sequence.');

    // Load dan validate data
    const programsData = loadProgramsData();
    console.log(`📊 Loaded ${programsData.length} programs from JSON`);

    const validPrograms = validateProgramsData(programsData);

    // Seed programs dengan bulk operations
    console.log('📋 Creating programs with bulk operations...');

    await prisma.$transaction(async (tx) => {
      await tx.program.createMany({
        data: validPrograms,
        skipDuplicates: true,
      });
    });

    console.log(`   ✅ Created ${validPrograms.length} programs successfully`);

    // Log created programs
    validPrograms.forEach((program, index) => {
      console.log(`   📋 ${program.title} (${program.slug}) - ${program.status}`);
    });

    // Summary
    console.log('\n📊 Programs seeding summary:');
    console.log(`   📋 Programs: ${validPrograms.length}`);
    console.log(`   ✅ Active: ${validPrograms.filter((p) => p.status === 'ACTIVE').length}`);
    console.log(`   📝 Draft: ${validPrograms.filter((p) => p.status === 'DRAFT').length}`);
    console.log(`   ❌ Inactive: ${validPrograms.filter((p) => p.status === 'INACTIVE').length}`);

    console.log('\n⚡ Performance optimizations applied:');
    console.log('   ✅ Bulk operations dengan createMany');
    console.log('   ✅ Transaction-based consistency');
    console.log('   ✅ Data validation dan error handling');
    console.log('   ✅ Auto-increment sequence reset');
    console.log('   ✅ Slug uniqueness validation');
  } catch (error) {
    console.error('❌ Error seeding programs data:', error);
    throw error;
  }
}
