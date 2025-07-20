import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Load data dari JSON file
const loadTestimonialsData = () => {
  try {
    const dataPath = path.join(__dirname, 'data', 'testimonials.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading testimonials data:', error);
    throw error;
  }
};

// Validate testimonials data
const validateTestimonialsData = (testimonials) => {
  console.log('   🔍 Validating testimonials data...');

  const validTestimonials = testimonials.filter((testimonial) => {
    const isValid =
      testimonial.name &&
      testimonial.country &&
      testimonial.text &&
      typeof testimonial.rating === 'number' &&
      testimonial.rating >= 1 &&
      testimonial.rating <= 5;

    if (!isValid) {
      console.warn(`⚠️  Invalid testimonial data:`, testimonial);
    }

    return isValid;
  });

  console.log(`   ✅ Validated ${validTestimonials.length}/${testimonials.length} testimonials`);
  return validTestimonials;
};

export async function seedTestimonials() {
  try {
    console.log('💬 Seeding testimonials...');

    // Clean existing data
    console.log('🗑️  Cleaning existing testimonials data...');
    await prisma.$transaction(async (tx) => {
      await tx.testimonial.deleteMany();
      // Reset auto-increment sequence
      await tx.$executeRawUnsafe(`ALTER SEQUENCE testimonials_id_seq RESTART WITH 1`);
    });
    console.log('✅ Deleted all existing testimonials data and reset sequence.');

    // Load dan validate data
    const testimonialsData = loadTestimonialsData();
    console.log(`📊 Loaded ${testimonialsData.length} testimonials from JSON`);

    const validTestimonials = validateTestimonialsData(testimonialsData);

    // Seed testimonials dengan bulk operations
    console.log('💬 Creating testimonials with bulk operations...');

    await prisma.$transaction(async (tx) => {
      await tx.testimonial.createMany({
        data: validTestimonials,
        skipDuplicates: true,
      });
    });

    console.log(`   ✅ Created ${validTestimonials.length} testimonials successfully`);

    // Log created testimonials
    validTestimonials.forEach((testimonial, index) => {
      console.log(`   💬 ${testimonial.name} (${testimonial.country}) - ${testimonial.featured ? 'Featured' : 'Regular'}`);
    });

    // Summary
    console.log('\n📊 Testimonials seeding summary:');
    console.log(`   💬 Testimonials: ${validTestimonials.length}`);
    console.log(`   🌟 Featured: ${validTestimonials.filter((t) => t.featured).length}`);
    console.log(`   🌍 Countries: ${[...new Set(validTestimonials.map((t) => t.country))].length}`);
    console.log(`   ⭐ Average rating: ${(validTestimonials.reduce((sum, t) => sum + t.rating, 0) / validTestimonials.length).toFixed(1)}`);

    console.log('\n⚡ Performance optimizations applied:');
    console.log('   ✅ Bulk operations dengan createMany');
    console.log('   ✅ Transaction-based consistency');
    console.log('   ✅ Data validation dan error handling');
    console.log('   ✅ Auto-increment sequence reset');
  } catch (error) {
    console.error('❌ Error seeding testimonials data:', error);
    throw error;
  }
}
