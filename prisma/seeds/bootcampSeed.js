import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data
const loadBootcampData = () => {
  try {
    const dataPath = join(__dirname, 'data', 'bootcamps.json');
    const rawData = readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading bootcamp data:', error);
    throw error;
  }
};

// Data validation function
const validateBootcampData = (bootcamps) => {
  console.log('   🔍 Validating bootcamp data...');

  const errors = [];

  bootcamps.forEach((bootcamp, index) => {
    // Required fields validation
    if (!bootcamp.title || bootcamp.title.length < 1) {
      errors.push(`Bootcamp ${index + 1}: title is required`);
    }
    if (!bootcamp.path_slug || bootcamp.path_slug.length < 1) {
      errors.push(`Bootcamp ${index + 1}: path_slug is required`);
    }

    // Validate rating range
    if (bootcamp.rating && (bootcamp.rating < 0 || bootcamp.rating > 5)) {
      errors.push(`Bootcamp ${index + 1}: rating must be between 0 and 5`);
    }

    // Validate rating_count
    if (bootcamp.rating_count && bootcamp.rating_count < 0) {
      errors.push(`Bootcamp ${index + 1}: rating_count must be positive`);
    }

    // Validate pricing
    if (bootcamp.pricing) {
      bootcamp.pricing.forEach((price, priceIndex) => {
        if (price.original_price <= 0) {
          errors.push(`Bootcamp ${index + 1}, Pricing ${priceIndex + 1}: original_price must be positive`);
        }
        if (price.discount_price <= 0) {
          errors.push(`Bootcamp ${index + 1}, Pricing ${priceIndex + 1}: discount_price must be positive`);
        }
        if (price.discount_price > price.original_price) {
          errors.push(`Bootcamp ${index + 1}, Pricing ${priceIndex + 1}: discount_price cannot exceed original_price`);
        }
      });
    }

    // Validate order fields
    ['features', 'topics', 'testimonials', 'faqs'].forEach((field) => {
      if (bootcamp[field]) {
        bootcamp[field].forEach((item, itemIndex) => {
          const orderField = `${field.slice(0, -1)}_order`;
          if (item[orderField] && item[orderField] <= 0) {
            errors.push(`Bootcamp ${index + 1}, ${field} ${itemIndex + 1}: ${orderField} must be positive`);
          }
        });
      }
    });
  });

  if (errors.length > 0) {
    console.error('❌ Validation errors:', errors);
    throw new Error(`Data validation failed: ${errors.join(', ')}`);
  }

  console.log('   ✅ All bootcamp data validated successfully');
};

// Helper function to prepare bulk data
const prepareBulkData = (bootcampId, items, extraFields = {}) => {
  return items.map((item) => ({
    bootcamp_id: bootcampId,
    ...item,
    ...extraFields,
  }));
};

export async function seedBootcamps() {
  console.log('🗑️  Cleaning existing bootcamp data...');

  try {
    // Clean existing data dalam transaction dengan urutan yang benar
    await prisma.$transaction(async (tx) => {
      await tx.bootcampEnrollment.deleteMany();
      await tx.bootcampFaq.deleteMany();
      await tx.bootcampTestimonial.deleteMany();
      await tx.bootcampInstructor.deleteMany();
      await tx.instructor.deleteMany();
      await tx.bootcampSession.deleteMany();
      await tx.bootcampTopic.deleteMany();
      await tx.bootcampFeature.deleteMany();
      await tx.bootcampPricing.deleteMany();
      await tx.bootcamp.deleteMany();

      // Reset auto-increment sequences untuk semua tabel
      const sequences = [
        'bootcamps_id_seq',
        'bootcamp_pricing_id_seq',
        'bootcamp_features_id_seq',
        'bootcamp_topics_id_seq',
        'bootcamp_sessions_id_seq',
        'instructors_id_seq',
        'bootcamp_testimonials_id_seq',
        'bootcamp_faqs_id_seq',
        'bootcamp_enrollments_id_seq',
      ];

      for (const seq of sequences) {
        await tx.$executeRawUnsafe(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
      }
    });

    console.log('✅ Deleted all existing bootcamp data and reset sequences.');

    // Load and validate data
    const { bootcamps } = loadBootcampData();
    console.log(`📊 Loaded ${bootcamps.length} bootcamps from JSON`);

    // Validate data
    validateBootcampData(bootcamps);

    console.log('📚 Creating bootcamps with optimized bulk operations...');

    // Process each bootcamp dalam transaction
    for (const [index, bootcampData] of bootcamps.entries()) {
      console.log(`\n   📖 Processing bootcamp ${index + 1}: ${bootcampData.title}`);

      await prisma.$transaction(async (tx) => {
        // 1. Create main bootcamp
        const { pricing, features, topics, instructors, testimonials, faqs, ...bootcampFields } = bootcampData;

        const bootcamp = await tx.bootcamp.create({
          data: bootcampFields,
        });
        console.log(`      ✅ Created bootcamp: ${bootcamp.title}`);

        // 2. Bulk create pricing tiers
        if (pricing && pricing.length > 0) {
          const pricingData = prepareBulkData(bootcamp.id, pricing);
          await tx.bootcampPricing.createMany({
            data: pricingData,
            skipDuplicates: true,
          });
          console.log(`      💰 Created ${pricing.length} pricing tiers`);
        }

        // 3. Bulk create features
        if (features && features.length > 0) {
          const featuresData = prepareBulkData(bootcamp.id, features);
          await tx.bootcampFeature.createMany({
            data: featuresData,
            skipDuplicates: true,
          });
          console.log(`      ⭐ Created ${features.length} features`);
        }

        // 4. Create topics and sessions (hierarchical)
        if (topics && topics.length > 0) {
          let totalSessions = 0;

          for (const topicData of topics) {
            const { sessions, ...topicFields } = topicData;

            // Create topic
            const topic = await tx.bootcampTopic.create({
              data: {
                bootcamp_id: bootcamp.id,
                ...topicFields,
              },
            });

            // Bulk create sessions untuk topic ini
            if (sessions && sessions.length > 0) {
              const sessionsData = sessions.map((session) => ({
                topic_id: topic.id,
                ...session,
              }));

              await tx.bootcampSession.createMany({
                data: sessionsData,
                skipDuplicates: true,
              });

              totalSessions += sessions.length;
            }
          }

          console.log(`      📖 Created ${topics.length} topics with ${totalSessions} sessions`);
        }

        // 5. Create instructors dan relationships
        if (instructors && instructors.length > 0) {
          // Create instructors dengan bulk operation
          const instructorIds = [];

          for (const instructorData of instructors) {
            const { instructor_order, ...instructorFields } = instructorData;

            const instructor = await tx.instructor.create({
              data: instructorFields,
            });

            instructorIds.push({
              instructor_id: instructor.id,
              instructor_order: instructor_order || 1,
            });
          }

          // Bulk create relationships
          const instructorRelations = instructorIds.map((rel) => ({
            bootcamp_id: bootcamp.id,
            ...rel,
          }));

          await tx.bootcampInstructor.createMany({
            data: instructorRelations,
            skipDuplicates: true,
          });

          console.log(`      👨‍🏫 Created ${instructors.length} instructors with relationships`);
        }

        // 6. Bulk create testimonials
        if (testimonials && testimonials.length > 0) {
          const testimonialsData = prepareBulkData(bootcamp.id, testimonials);
          await tx.bootcampTestimonial.createMany({
            data: testimonialsData,
            skipDuplicates: true,
          });
          console.log(`      💬 Created ${testimonials.length} testimonials`);
        }

        // 7. Bulk create FAQs
        if (faqs && faqs.length > 0) {
          const faqsData = prepareBulkData(bootcamp.id, faqs);
          await tx.bootcampFaq.createMany({
            data: faqsData,
            skipDuplicates: true,
          });
          console.log(`      ❓ Created ${faqs.length} FAQs`);
        }
      });
    }

    // Final summary
    const finalStats = await prisma.$transaction(async (tx) => {
      const bootcampCount = await tx.bootcamp.count();
      const pricingCount = await tx.bootcampPricing.count();
      const featureCount = await tx.bootcampFeature.count();
      const topicCount = await tx.bootcampTopic.count();
      const sessionCount = await tx.bootcampSession.count();
      const instructorCount = await tx.instructor.count();
      const testimonialCount = await tx.bootcampTestimonial.count();
      const faqCount = await tx.bootcampFaq.count();

      return {
        bootcampCount,
        pricingCount,
        featureCount,
        topicCount,
        sessionCount,
        instructorCount,
        testimonialCount,
        faqCount,
      };
    });

    console.log('\n📊 Bootcamp seeding summary:');
    console.log(`   📚 Bootcamps: ${finalStats.bootcampCount}`);
    console.log(`   💰 Pricing tiers: ${finalStats.pricingCount}`);
    console.log(`   ⭐ Features: ${finalStats.featureCount}`);
    console.log(`   📖 Topics: ${finalStats.topicCount}`);
    console.log(`   📝 Sessions: ${finalStats.sessionCount}`);
    console.log(`   👨‍🏫 Instructors: ${finalStats.instructorCount}`);
    console.log(`   💬 Testimonials: ${finalStats.testimonialCount}`);
    console.log(`   ❓ FAQs: ${finalStats.faqCount}`);
    console.log('');
    console.log('⚡ Performance optimizations applied:');
    console.log('   ✅ Bulk operations dengan createMany');
    console.log('   ✅ Transaction-based consistency');
    console.log('   ✅ Data validation dan error handling');
    console.log('   ✅ Auto-increment sequence reset');
    console.log('   ✅ Optimized relationship creation');
  } catch (error) {
    console.error('❌ Error seeding bootcamp data:', error);
    throw error;
  }
}
