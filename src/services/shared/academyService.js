import { academyRepository } from '../../repositories/shared/academyRepository.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';

export class AcademyService {
  constructor() {
    this.academyRepository = academyRepository;
  }

  get logger() {
    return getLogger();
  }

  async getAllAcademies(options = {}) {
    this.logger.info('[academyService] getAllAcademies start');
    try {
      const result = await this.academyRepository.findAll(options);
      this.logger.info('[academyService] getAllAcademies success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAllAcademies error');
      throw error;
    }
  }

  async getAcademyBySlug(slug) {
    this.logger.info('[academyService] getAcademyBySlug start');
    try {
      const academy = await this.academyRepository.findBySlug(slug);
      if (!academy) {
        const error = new Error('Academy not found');
        error.statusCode = 404;
        throw error;
      }
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAcademyBySlug error');
      throw error;
    }
  }

  async getCategories() {
    this.logger.info('[academyService] getCategories start');
    try {
      const categories = await this.academyRepository.getCategories();
      this.logger.info('[academyService] getCategories success');
      return categories;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getCategories error');
      throw error;
    }
  }

  // Get all methods for sub-tables (read-only)
  async getAllPricing(academyId = null) {
    this.logger.info({ academyId }, '[academyService] getAllPricing start');
    try {
      if (academyId) {
        return await this.academyRepository.findPricingsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { pricing: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.pricing);
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAllPricing error');
      throw error;
    }
  }

  async getAllFeatures(academyId = null) {
    this.logger.info({ academyId }, '[academyService] getAllFeatures start');
    try {
      if (academyId) {
        return await this.academyRepository.findFeaturesByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { features: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.features);
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAllFeatures error');
      throw error;
    }
  }

  async getAllInstructors(academyId = null) {
    this.logger.info({ academyId }, '[academyService] getAllInstructors start');
    try {
      if (academyId) {
        return await this.academyRepository.findInstructorsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { instructors: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.instructors);
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAllInstructors error');
      throw error;
    }
  }

  async getAllThemes(academyId = null, includeTopics = false) {
    this.logger.info({ academyId, includeTopics }, '[academyService] getAllThemes start');
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
      this.logger.error({ err: error }, '[academyService] getAllThemes error');
      throw error;
    }
  }

  async getAllTopics(academyId = null, themeId = null) {
    this.logger.info({ academyId, themeId }, '[academyService] getAllTopics start');
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
      this.logger.error({ err: error }, '[academyService] getAllTopics error');
      throw error;
    }
  }

  async getAllTestimonials(academyId = null) {
    this.logger.info({ academyId }, '[academyService] getAllTestimonials start');
    try {
      if (academyId) {
        return await this.academyRepository.findTestimonialsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { testimonials: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.testimonials);
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAllTestimonials error');
      throw error;
    }
  }

  async getAllFaqs(academyId = null) {
    this.logger.info({ academyId }, '[academyService] getAllFaqs start');
    try {
      if (academyId) {
        return await this.academyRepository.findFaqsByAcademyId(parseInt(academyId));
      }

      const academies = await this.academyRepository.model.findMany({
        include: { faqs: { orderBy: { order: 'asc' } } },
      });
      return academies.flatMap((a) => a.faqs);
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAllFaqs error');
      throw error;
    }
  }
}

export const academyService = new AcademyService();
