/**
 * Testimonial and Program seeder
 */

import { PrismaClient } from '@prisma/client';
import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';

/**
 * Seed testimonials and programs
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Object>} Statistics object
 */
export async function seedTestimonials(prisma) {
  try {
    logSeedStart('Testimonials & Programs');

    // Clear existing data
    await prisma.testimonial.deleteMany({});
    await prisma.program.deleteMany({});

    // Create testimonials
    const testimonials = [
      {
        name: 'Sarah Johnson',
        country: 'Indonesia',
        text: 'Rise Social transformed my career! The academy programs are world-class and the instructors genuinely care about your success. I landed my dream job within 3 months of graduation.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      },
      {
        name: 'Ahmad Hidayat',
        country: 'Indonesia',
        text: 'The ESG Academy gave me the knowledge and confidence to lead sustainability initiatives at my company. The curriculum is comprehensive and highly practical.',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      },
      {
        name: 'Maria Santos',
        country: 'Philippines',
        text: 'Best investment in my professional development. The Full Stack Bootcamp is intensive but incredibly rewarding. The career support team helped me negotiate a 40% salary increase!',
        rating: 5,
        status: 'ACTIVE',
        featured: true,
      },
      {
        name: 'David Chen',
        country: 'Singapore',
        text: 'The Data Science program exceeded my expectations. The instructors are industry experts and the projects are challenging and relevant. Highly recommend!',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      },
      {
        name: 'Putri Maharani',
        country: 'Indonesia',
        text: 'I appreciate the flexible learning format and lifetime access to materials. The community is supportive and the networking opportunities are valuable.',
        rating: 5,
        status: 'ACTIVE',
        featured: false,
      },
      {
        name: 'James Wilson',
        country: 'United States',
        text: 'The quality of instruction and curriculum design is outstanding. I have taken courses from other platforms, but Rise Social stands out for its practical approach.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      },
      {
        name: 'Rina Kusuma',
        country: 'Indonesia',
        text: 'The mentorship and personalized feedback made all the difference. I felt supported throughout my learning journey and gained skills that directly apply to my work.',
        rating: 5,
        status: 'ACTIVE',
        featured: false,
      },
      {
        name: 'Michael Tan',
        country: 'Malaysia',
        text: 'Great value for money! The comprehensive curriculum, expert instructors, and career support justify the investment. I have already recommended it to colleagues.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      },
      {
        name: 'Aisha Rahman',
        country: 'Indonesia',
        text: 'The hands-on projects and real-world case studies helped me build a strong portfolio. Employers were impressed with the quality of work I could demonstrate.',
        rating: 5,
        status: 'ACTIVE',
        featured: false,
      },
      {
        name: 'Thomas Anderson',
        country: 'Australia',
        text: 'The alumni network is fantastic! I have made valuable connections and continue to learn from fellow graduates. The community aspect adds tremendous value.',
        rating: 4,
        status: 'ACTIVE',
        featured: false,
      },
    ];

    for (const testimonial of testimonials) {
      await prisma.testimonial.create({
        data: testimonial,
      });
    }

    // Create programs
    const programs = [
      {
        title: 'Professional Development Program',
        slug: 'professional-development',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
        description: 'Comprehensive professional development program covering leadership, communication, and career advancement skills.',
        status: 'ACTIVE',
      },
      {
        title: 'Tech Career Accelerator',
        slug: 'tech-career-accelerator',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998',
        description: 'Fast-track your technology career with intensive training, mentorship, and job placement support.',
        status: 'ACTIVE',
      },
      {
        title: 'Sustainability Leadership Program',
        slug: 'sustainability-leadership',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09',
        description: 'Develop expertise in ESG, sustainability strategy, and corporate social responsibility to lead positive change.',
        status: 'ACTIVE',
      },
    ];

    for (const program of programs) {
      await prisma.program.create({
        data: program,
      });
    }

    const stats = {
      testimonialCount: testimonials.length,
      programCount: programs.length,
    };

    logSeedSuccess('Testimonials & Programs', stats);
    return stats;
  } catch (error) {
    logSeedError('Testimonials & Programs', error);
    throw error;
  }
}
