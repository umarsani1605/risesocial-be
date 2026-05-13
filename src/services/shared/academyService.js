import { academyRepository } from '../../repositories/shared/academyRepository.js';
import prisma from '../../config/database.js';

export class AcademyService {
  constructor() {
    this.academyRepository = academyRepository;
  }


  async getAllAcademies(options = {}) {
    try {
      const result = await this.academyRepository.findAll(options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAcademyBySlug(slug) {
    try {
      const academy = await this.academyRepository.findBySlug(slug);
      if (!academy) {
        const error = new Error('Academy not found');
        error.statusCode = 404;
        throw error;
      }
      return academy;
    } catch (error) {
      throw error;
    }
  }

  async getCategories() {
    try {
      const categories = await this.academyRepository.getCategories();
      return categories;
    } catch (error) {
      throw error;
    }
  }

  // Get all methods for sub-tables (read-only)
  async getAllPricing(academyId = null) {
    try {
      if (academyId) {
        return await this.academyRepository.findPricingsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { pricing: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.pricing);
    } catch (error) {
      throw error;
    }
  }

  async getAllFeatures(academyId = null) {
    try {
      if (academyId) {
        return await this.academyRepository.findFeaturesByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { features: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.features);
    } catch (error) {
      throw error;
    }
  }

  async getAllInstructors(academyId = null) {
    try {
      if (academyId) {
        return await this.academyRepository.findInstructorsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { instructors: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.instructors);
    } catch (error) {
      throw error;
    }
  }

  async getAllThemes(academyId = null, includeTopics = false) {
    try {
      const includeOption = includeTopics
        ? {
            topics: { orderBy: { order: 'asc' } },
          }
        : undefined;

      if (academyId) {
        const academy = await this.academyRepository.findById(parseInt(academyId), {
          include: {
            themes: {
              orderBy: { order: 'asc' },
              include: includeOption,
            },
          },
        });
        return academy?.themes || [];
      }

      const academies = await this.academyRepository.model.findMany({
        include: {
          themes: {
            orderBy: { order: 'asc' },
            include: includeOption,
          },
        },
      });
      return academies.flatMap((a) => a.themes);
    } catch (error) {
      throw error;
    }
  }

  async getAllTopics(academyId = null, themeId = null) {
    try {
      if (themeId) {
        return await prisma.academyTopic.findMany({
          where: { theme_id: parseInt(themeId) },
          orderBy: { order: 'asc' },
        });
      }

      if (academyId) {
        return await prisma.academyTopic.findMany({
          where: { academy_id: parseInt(academyId) },
          orderBy: { order: 'asc' },
        });
      }

      return await prisma.academyTopic.findMany({
        orderBy: [{ academy_id: 'asc' }, { order: 'asc' }],
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllTestimonials(academyId = null) {
    try {
      if (academyId) {
        return await this.academyRepository.findTestimonialsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { testimonials: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.testimonials);
    } catch (error) {
      throw error;
    }
  }

  async getAllFaqs(academyId = null) {
    try {
      if (academyId) {
        return await this.academyRepository.findFaqsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { faqs: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.faqs);
    } catch (error) {
      throw error;
    }
  }
}

export const academyService = new AcademyService();
