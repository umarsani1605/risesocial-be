import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadAcademyData = () => {
  try {
    const dataPath = join(__dirname, 'data', 'academies.json');
    const rawData = readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error loading academy data:', error);
    throw error;
  }
};

const validateAcademyData = (academies) => {
  console.log('   🔍 Validating academy data...');

  const errors = [];

  academies.forEach((academy, index) => {
    if (!academy.title || academy.title.length < 1) {
      errors.push(`Academy ${index + 1}: title is required`);
    }
    if (!academy.slug || academy.slug.length < 1) {
      errors.push(`Academy ${index + 1}: slug is required`);
    }

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

    ['features', 'themes', 'testimonials', 'faqs'].forEach((field) => {
      if (academy[field]) {
        academy[field].forEach((item, itemIndex) => {
          if (item.order && item.order <= 0) {
            errors.push(`Academy ${index + 1}, ${field} ${itemIndex + 1}: order must be positive`);
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
    await prisma.$transaction(async (tx) => {
      await tx.academyEnrollment.deleteMany();
      await tx.academyFaq.deleteMany();
      await tx.academyTestimonial.deleteMany();
      await tx.academyInstructor.deleteMany();
      await tx.academyTopic.deleteMany();
      await tx.academyTheme.deleteMany();
      await tx.academyFeature.deleteMany();
      await tx.academyPricing.deleteMany();
      await tx.academy.deleteMany();

      // Note: Sequence names follow pattern: {table_name}_id_seq
      // But we need to check if they exist first to avoid errors
      const sequences = [
        'academies_id_seq',
        'academy_pricing_id_seq',
        'academy_features_id_seq',
        'academy_themes_id_seq',
        'academy_topics_id_seq',
        'academy_testimonials_id_seq',
        'academy_faqs_id_seq',
        'academy_instructors_id_seq',
        'academy_enrollments_id_seq',
      ];

      // Reset sequences only if they exist
      for (const seq of sequences) {
        try {
          await tx.$executeRawUnsafe(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
        } catch (error) {
          console.log(`   ⚠️  Sequence ${seq} not found, skipping...`);
        }
      }
    });

    console.log('✅ Deleted all existing academy data and reset sequences.');

    const { academies } = loadAcademyData();
    console.log(`📊 Loaded ${academies.length} academies from JSON`);

    validateAcademyData(academies);

    console.log('📚 Creating academies with optimized bulk operations...');

    for (const [index, academyData] of academies.entries()) {
      console.log(`\n   📖 Processing academy ${index + 1}: ${academyData.title}`);

      await prisma.$transaction(async (tx) => {
        const { pricing, features, themes, instructors, testimonials, faqs, ...academyFields } = academyData;

        const academy = await tx.academy.create({
          data: academyFields,
        });
        console.log(`      ✅ Created academy: ${academy.title}`);

        if (pricing && pricing.length > 0) {
          const pricingData = prepareBulkData(academy.id, pricing);
          await tx.academyPricing.createMany({
            data: pricingData,
            skipDuplicates: true,
          });
          console.log(`      💰 Created ${pricing.length} pricing tiers`);
        }

        if (features && features.length > 0) {
          const featuresData = prepareBulkData(academy.id, features);
          await tx.academyFeature.createMany({
            data: featuresData,
            skipDuplicates: true,
          });
          console.log(`      ⭐ Created ${features.length} features`);
        }

        if (themes && themes.length > 0) {
          let totalTopics = 0;

          for (const themeData of themes) {
            const { topics, ...themeFields } = themeData;

            const theme = await tx.academyTheme.create({
              data: {
                academy_id: academy.id,
                ...themeFields,
              },
            });

            if (topics && topics.length > 0) {
              const topicsData = topics.map((topic) => ({
                theme_id: theme.id,
                academy_id: academy.id,
                ...topic,
              }));

              await tx.academyTopic.createMany({
                data: topicsData,
                skipDuplicates: true,
              });

              totalTopics += topics.length;
            }
          }

          console.log(`      📖 Created ${themes.length} themes with ${totalTopics} topics`);
        }

        if (instructors && instructors.length > 0) {
          const instructorsData = prepareBulkData(academy.id, instructors);
          await tx.academyInstructor.createMany({
            data: instructorsData,
            skipDuplicates: true,
          });
          console.log(`      👨‍🏫 Created ${instructors.length} instructors`);
        }

        if (testimonials && testimonials.length > 0) {
          const testimonialsData = prepareBulkData(academy.id, testimonials);
          await tx.academyTestimonial.createMany({
            data: testimonialsData,
            skipDuplicates: true,
          });
          console.log(`      💬 Created ${testimonials.length} testimonials`);
        }

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

    const finalStats = await prisma.$transaction(async (tx) => {
      const academyCount = await tx.academy.count();
      const pricingCount = await tx.academyPricing.count();
      const featureCount = await tx.academyFeature.count();
      const themeCount = await tx.academyTheme.count();
      const topicCount = await tx.academyTopic.count();
      const instructorCount = await tx.academyInstructor.count();
      const testimonialCount = await tx.academyTestimonial.count();
      const faqCount = await tx.academyFaq.count();

      return {
        academyCount,
        pricingCount,
        featureCount,
        themeCount,
        topicCount,
        instructorCount,
        testimonialCount,
        faqCount,
      };
    });

    console.log('\n📊 Academy seeding summary:');
    console.log(`   📚 Academies: ${finalStats.academyCount}`);
    console.log(`   💰 Pricing tiers: ${finalStats.pricingCount}`);
    console.log(`   ⭐ Features: ${finalStats.featureCount}`);
    console.log(`   📂 Themes: ${finalStats.themeCount}`);
    console.log(`   📖 Topics: ${finalStats.topicCount}`);
    console.log(`   👨‍🏫 Instructors: ${finalStats.instructorCount}`);
    console.log(`   💬 Testimonials: ${finalStats.testimonialCount}`);
    console.log(`   ❓ FAQs: ${finalStats.faqCount}`);
    console.log('');
    console.log('⚡ Performance optimizations applied:');
    console.log('   ✅ Bulk operations with createMany');
    console.log('   ✅ Transaction-based consistency');
    console.log('   ✅ Data validation and error handling');
    console.log('   ✅ Auto-increment sequence reset');
  } catch (error) {
    console.error('❌ Error seeding academy data:', error);
    throw error;
  }
}
