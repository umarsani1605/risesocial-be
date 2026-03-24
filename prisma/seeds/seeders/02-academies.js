/**
 * Academy seeder - seeds academies with all related entities
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';
import { validatePricing } from '../utils/validation.js';
import { academies } from '../data/academies.js';

/**
 * Seed academies with all related data
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedAcademies(prisma) {
  try {
    logSeedStart('Academies');

    // Clear existing data in correct order
    await prisma.academyTopic.deleteMany({});
    await prisma.academyTheme.deleteMany({});
    await prisma.academyFaq.deleteMany({});
    await prisma.academyTestimonial.deleteMany({});
    await prisma.academyInstructor.deleteMany({});
    await prisma.academyFeature.deleteMany({});
    await prisma.academyPricing.deleteMany({});
    await prisma.academy.deleteMany({});

    let pricingCount = 0;
    let featureCount = 0;
    let themeCount = 0;
    let topicCount = 0;
    let instructorCount = 0;
    let testimonialCount = 0;
    let faqCount = 0;

    // Create academies and related records
    for (const academyData of academies) {
      const { pricing, features, themes, instructors, testimonials, faqs, ...academyFields } = academyData;

      // Validate pricing
      for (const price of pricing) {
        if (!validatePricing(price.discount_price, price.original_price)) {
          throw new Error(
            `Invalid pricing for ${academyFields.title}: discount_price (${price.discount_price}) > original_price (${price.original_price})`,
          );
        }
      }

      // Create academy
      const academy = await prisma.academy.create({
        data: academyFields,
      });

      // Create pricing
      for (const price of pricing) {
        await prisma.academyPricing.create({
          data: {
            academy_id: academy.id,
            ...price,
          },
        });
        pricingCount++;
      }

      // Create features
      for (const feature of features) {
        await prisma.academyFeature.create({
          data: {
            academy_id: academy.id,
            ...feature,
          },
        });
        featureCount++;
      }

      // Create themes and topics
      for (const theme of themes) {
        const { topics: themeTopics, ...themeFields } = theme;

        const createdTheme = await prisma.academyTheme.create({
          data: {
            academy_id: academy.id,
            ...themeFields,
          },
        });
        themeCount++;

        // Create topics for this theme
        for (const topic of themeTopics) {
          await prisma.academyTopic.create({
            data: {
              academy_id: academy.id,
              theme_id: createdTheme.id,
              ...topic,
            },
          });
          topicCount++;
        }
      }

      // Create instructors
      for (const instructor of instructors) {
        await prisma.academyInstructor.create({
          data: {
            academy_id: academy.id,
            ...instructor,
          },
        });
        instructorCount++;
      }

      // Create testimonials
      for (const testimonial of testimonials) {
        await prisma.academyTestimonial.create({
          data: {
            academy_id: academy.id,
            ...testimonial,
          },
        });
        testimonialCount++;
      }

      // Create FAQs
      for (const faq of faqs) {
        await prisma.academyFaq.create({
          data: {
            academy_id: academy.id,
            ...faq,
          },
        });
        faqCount++;
      }
    }

    const stats = {
      academyCount: academies.length,
      pricingCount,
      featureCount,
      themeCount,
      topicCount,
      instructorCount,
      testimonialCount,
      faqCount,
    };

    logSeedSuccess('Academies', stats);
    return stats;
  } catch (error) {
    logSeedError('Academies', error);
    throw error;
  }
}
