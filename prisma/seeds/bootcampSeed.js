import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load JSON data
const loadAcademyData = () => {
  try {
    const dataPath = join(__dirname, 'data', 'academys.json');
    const rawData = readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading academy data:', error);
    throw error;
  }
};

// Data validation function
const validateAcademyData = (academies) => {
  console.log('   🔍 Validating academy data...');

  const errors = [];

  academies.forEach((academy, index) => {
    // Required fields validation
    if (!academy.title || academy.title.length < 1) {
      errors.push(`Academy ${index + 1}: title is required`);
    }
    if (!academy.path_slug || academy.path_slug.length < 1) {
      errors.push(`Academy ${index + 1}: path_slug is required`);
    }

    // Validate rating range
    if (academy.rating && (academy.rating < 0 || academy.rating > 5)) {
      errors.push(`Academy ${index + 1}: rating must be between 0 and 5`);
    }

    // Validate rating_count
    if (academy.rating_count && academy.rating_count < 0) {
      errors.push(`Academy ${index + 1}: rating_count must be positive`);
    }

    // Validate pricing
    if (academy.pricing) {
      academy.pricing.forEach((price, priceIndex) => {
        if (price.original_price <= 0) {
          errors.push(`Academy ${index + 1}, Pricing ${priceIndex + 1}: original_price must be positive`);
        }
        if (price.discount_price <= 0) {
          errors.push(`Academy ${index + 1}, Pricing ${priceIndex + 1}: discount_price must be positive`);
        }
        if (price.discount_price > price.original_price) {
          errors.push(`Academy ${index + 1}, Pricing ${priceIndex + 1}: discount_price cannot exceed original_price`);
        }
      });
    }

    // Validate order fields
    ['features', 'topics', 'testimonials', 'faqs'].forEach((field) => {
      if (academy[field]) {
        academy[field].forEach((item, itemIndex) => {
          const orderField = 'order';
          if (item[orderField] && item[orderField] <= 0) {
            errors.push(`Academy ${index + 1}, ${field} ${itemIndex + 1}: ${orderField} must be positive`);
          }
        });
      }
    });
  });

  if (errors.length > 0) {
    console.error('❌ Validation errors:', errors);
    throw new Error(`Data validation failed: ${errors.join(', ')}`);
  }

  console.log('   ✅ All academy data validated successfully');
};

// Helper function to prepare bulk data
const prepareBulkData = (academyId, items, extraFields = {}) => {
  return items.map((item) => ({
    academy_id: academyId,
    ...item,
    ...extraFields,
  }));
};

export async function seedAcademies() {
  console.log('🗑️  Cleaning existing academy data...');

  try {
    // Clean existing data dalam transaction dengan urutan yang benar
    await prisma.$transaction(async (tx) => {
      await tx.academyEnrollment.deleteMany();
      await tx.academyFaq.deleteMany();
      await tx.academyTestimonial.deleteMany();
      await tx.academyInstructor.deleteMany();
      await tx.academySession.deleteMany();
      await tx.academyTopic.deleteMany();
      await tx.academyFeature.deleteMany();
      await tx.academyPricing.deleteMany();
      await tx.academy.deleteMany();

      // Reset auto-increment sequences untuk semua tabel
      const sequences = [
        'academies_id_seq',
        'academy_pricing_id_seq',
        'academy_features_id_seq',
        'academy_topics_id_seq',
        'academy_sessions_id_seq',
        'academy_testimonials_id_seq',
        'academy_faqs_id_seq',
        'academy_enrollments_id_seq',
      ];

      for (const seq of sequences) {
        await tx.$executeRawUnsafe(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
      }
    });

    console.log('✅ Deleted all existing academy data and reset sequences.');

    // Load and validate data
    const { academies } = loadAcademyData();
    console.log(`📊 Loaded ${academies.length} academies from JSON`);

    // Validate data
    validateAcademyData(academies);

    console.log('📚 Creating academies with optimized bulk operations...');

    // Process each academy dalam transaction
    for (const [index, academyData] of academies.entries()) {
      console.log(`\n   📖 Processing academy ${index + 1}: ${academyData.title}`);

      await prisma.$transaction(async (tx) => {
        // 1. Create main academy
        const { pricing, features, topics, instructors, testimonials, faqs, ...academyFields } = academyData;

        const academy = await tx.academy.create({
          data: academyFields,
        });
        console.log(`      ✅ Created academy: ${academy.title}`);

        // 2. Bulk create pricing tiers
        if (pricing && pricing.length > 0) {
          const pricingData = prepareBulkData(academy.id, pricing);
          await tx.academyPricing.createMany({
            data: pricingData,
            skipDuplicates: true,
          });
          console.log(`      💰 Created ${pricing.length} pricing tiers`);
        }

        // 3. Bulk create features
        if (features && features.length > 0) {
          const featuresData = prepareBulkData(academy.id, features);
          await tx.academyFeature.createMany({
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
            const topic = await tx.academyTopic.create({
              data: {
                academy_id: academy.id,
                ...topicFields,
              },
            });

            // Bulk create sessions untuk topic ini
            if (sessions && sessions.length > 0) {
              const sessionsData = sessions.map((session) => ({
                topic_id: topic.id,
                ...session,
              }));

              await tx.academySession.createMany({
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
            academy_id: academy.id,
            ...rel,
          }));

          await tx.academyInstructor.createMany({
            data: instructorRelations,
            skipDuplicates: true,
          });

          console.log(`      👨‍🏫 Created ${instructors.length} instructors with relationships`);
        }

        // 6. Bulk create testimonials
        if (testimonials && testimonials.length > 0) {
          const testimonialsData = prepareBulkData(academy.id, testimonials);
          await tx.academyTestimonial.createMany({
            data: testimonialsData,
            skipDuplicates: true,
          });
          console.log(`      💬 Created ${testimonials.length} testimonials`);
        }

        // 7. Bulk create FAQs
        if (faqs && faqs.length > 0) {
          const faqsData = prepareBulkData(academy.id, faqs);
          await tx.academyFaq.createMany({
            data: faqsData,
            skipDuplicates: true,
          });
          console.log(`      ❓ Created ${faqs.length} FAQs`);
        }
      });
    }

    // Final summary
    const finalStats = await prisma.$transaction(async (tx) => {
      const academyCount = await tx.academy.count();
      const pricingCount = await tx.academyPricing.count();
      const featureCount = await tx.academyFeature.count();
      const topicCount = await tx.academyTopic.count();
      const sessionCount = await tx.academySession.count();
      const instructorCount = await tx.instructor.count();
      const testimonialCount = await tx.academyTestimonial.count();
      const faqCount = await tx.academyFaq.count();

      return {
        academyCount,
        pricingCount,
        featureCount,
        topicCount,
        sessionCount,
        instructorCount,
        testimonialCount,
        faqCount,
      };
    });

    console.log('\n📊 Academy seeding summary:');
    console.log(`   📚 Academies: ${finalStats.academyCount}`);
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
    console.error('❌ Error seeding academy data:', error);
    throw error;
  }
}
