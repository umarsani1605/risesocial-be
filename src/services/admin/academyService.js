import { adminAcademyRepository } from '../../repositories/admin/academyRepository.js';
import { academyRepository } from '../../repositories/shared/academyRepository.js';
import { fileUploadService } from '../shared/fileUploadService.js';
import { getLogger } from '../../utils/loggerContext.js';

export class AdminAcademyService {
  constructor() {
    this.adminAcademyRepository = adminAcademyRepository;
    this.academyRepository = academyRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  async createAcademy(academyData) {
    this.logger.info('[adminAcademyService] createAcademy start');
    try {
      await this.validateAcademyData(academyData);

      if (!academyData.slug) {
        academyData.slug = this.generateSlug(academyData.title);
        const slugExists = await this.academyRepository.slugExists(academyData.slug);
        if (slugExists) {
          academyData.slug = `${academyData.slug}-${Date.now()}`;
        }
      } else {
        const slugExists = await this.academyRepository.slugExists(academyData.slug);
        if (slugExists) {
          const err = new Error('Telah ada academy dengan nama yang sama');
          err.statusCode = 400;
          throw err;
        }
      }

      const academyDataWithDefaults = {
        ...academyData,
        status: academyData.status || 'DRAFT',
        certificate: academyData.certificate || false,
        portfolio: academyData.portfolio || false,
      };

      if (academyData.imageFile) {
        try {
          const uploaded = await this.fileUploadService.upload(academyData.imageFile);
          academyDataWithDefaults.image_url = uploaded.publicUrl;
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[adminAcademyService] image upload failed');
          throw new Error('Failed to upload academy image');
        }
        delete academyDataWithDefaults.imageFile;
      }

      const academy = await this.adminAcademyRepository.create(academyDataWithDefaults);
      this.logger.info('[adminAcademyService] createAcademy success');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createAcademy error');
      throw error;
    }
  }

  async updateAcademy(id, updateData) {
    this.logger.info('[adminAcademyService] updateAcademy start');
    try {
      const existingAcademy = await this.academyRepository.findById(id);
      if (!existingAcademy) throw new Error('Academy not found');

      if (updateData.slug && updateData.slug !== existingAcademy.slug) {
        const slugExists = await this.academyRepository.slugExists(updateData.slug, id);
        if (slugExists) throw new Error('Slug is already taken');
      }

      if (updateData.title && !updateData.slug) {
        updateData.slug = this.generateSlug(updateData.title);
        const slugExists = await this.academyRepository.slugExists(updateData.slug, id);
        if (slugExists) {
          updateData.slug = `${updateData.slug}-${Date.now()}`;
        }
      }

      if (updateData.imageFile) {
        try {
          const uploaded = await this.fileUploadService.upload(updateData.imageFile);
          updateData.image_url = uploaded.publicUrl;
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[adminAcademyService] image upload failed');
          throw new Error('Failed to upload academy image');
        }
        delete updateData.imageFile;
      }

      const academy = await this.adminAcademyRepository.update(id, updateData);
      this.logger.info('[adminAcademyService] updateAcademy success');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateAcademy error');
      throw error;
    }
  }

  async deleteAcademy(id) {
    this.logger.info('[adminAcademyService] deleteAcademy start');
    try {
      const academy = await this.academyRepository.findById(id);
      if (!academy) {
        const error = new Error('Academy tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      await this.adminAcademyRepository.delete(id);
      this.logger.info('[adminAcademyService] deleteAcademy success');
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteAcademy error');
      throw error;
    }
  }

  // ─── GET sub-resource methods ───────────────────────────────────────────────

  async getPricings(academyId) {
    this.logger.info('[adminAcademyService] getPricings start');
    try {
      return await this.adminAcademyRepository.findPricingsByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getPricings error');
      throw error;
    }
  }

  async getFeatures(academyId) {
    this.logger.info('[adminAcademyService] getFeatures start');
    try {
      return await this.adminAcademyRepository.findFeaturesByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getFeatures error');
      throw error;
    }
  }

  async getInstructors(academyId) {
    this.logger.info('[adminAcademyService] getInstructors start');
    try {
      return await this.adminAcademyRepository.findInstructorsByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getInstructors error');
      throw error;
    }
  }

  async getTopics(academyId) {
    this.logger.info('[adminAcademyService] getTopics start');
    try {
      return await this.adminAcademyRepository.findTopicsByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getTopics error');
      throw error;
    }
  }

  async getTestimonials(academyId) {
    this.logger.info('[adminAcademyService] getTestimonials start');
    try {
      return await this.adminAcademyRepository.findTestimonialsByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getTestimonials error');
      throw error;
    }
  }

  async getFaqs(academyId) {
    this.logger.info('[adminAcademyService] getFaqs start');
    try {
      return await this.adminAcademyRepository.findFaqsByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getFaqs error');
      throw error;
    }
  }

  // ─── Theme CRUD methods ──────────────────────────────────────────────────────

  async getThemes(academyId) {
    this.logger.info('[adminAcademyService] getThemes start');
    try {
      return await this.adminAcademyRepository.findThemesByAcademyId(academyId);
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] getThemes error');
      throw error;
    }
  }

  async createTheme(academyId, data) {
    this.logger.info('[adminAcademyService] createTheme start');
    try {
      const academy = await this.academyRepository.findById(academyId);
      if (!academy) {
        const err = new Error('Academy not found');
        err.statusCode = 404;
        throw err;
      }
      const theme = await this.adminAcademyRepository.createTheme(academyId, data);
      this.logger.info('[adminAcademyService] createTheme success');
      return theme;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createTheme error');
      throw error;
    }
  }

  async updateTheme(academyId, themeId, data) {
    this.logger.info('[adminAcademyService] updateTheme start');
    try {
      const theme = await this.adminAcademyRepository.updateTheme(academyId, themeId, data);
      this.logger.info('[adminAcademyService] updateTheme success');
      return theme;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateTheme error');
      throw error;
    }
  }

  async deleteTheme(academyId, themeId) {
    this.logger.info('[adminAcademyService] deleteTheme start');
    try {
      const result = await this.adminAcademyRepository.deleteTheme(academyId, themeId);
      this.logger.info('[adminAcademyService] deleteTheme success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteTheme error');
      throw error;
    }
  }

  async createPricing(academyId, data) {
    this.logger.info('[adminAcademyService] createPricing start');
    try {
      if (data.discount_price !== undefined && data.original_price !== undefined && data.discount_price > data.original_price) {
        throw new Error('Discount price cannot be greater than original price');
      }

      const pricing = await this.adminAcademyRepository.createPricing(academyId, data);
      this.logger.info('[adminAcademyService] createPricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createPricing error');
      throw error;
    }
  }

  async updatePricing(academyId, pricingId, data) {
    this.logger.info('[adminAcademyService] updatePricing start');
    try {
      if (data.discount_price !== undefined && data.original_price !== undefined && data.discount_price > data.original_price) {
        throw new Error('Discount price cannot be greater than original price');
      }

      const pricing = await this.adminAcademyRepository.updatePricing(academyId, pricingId, data);
      this.logger.info('[adminAcademyService] updatePricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updatePricing error');
      throw error;
    }
  }

  async deletePricing(academyId, pricingId) {
    this.logger.info('[adminAcademyService] deletePricing start');
    try {
      const result = await this.adminAcademyRepository.deletePricing(academyId, pricingId);
      this.logger.info('[adminAcademyService] deletePricing success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deletePricing error');
      throw error;
    }
  }

  async createFeature(academyId, data) {
    this.logger.info('[adminAcademyService] createFeature start');
    try {
      const feature = await this.adminAcademyRepository.createFeature(academyId, data);
      this.logger.info('[adminAcademyService] createFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createFeature error');
      throw error;
    }
  }

  async updateFeature(academyId, featureId, data) {
    this.logger.info('[adminAcademyService] updateFeature start');
    try {
      const feature = await this.adminAcademyRepository.updateFeature(academyId, featureId, data);
      this.logger.info('[adminAcademyService] updateFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateFeature error');
      throw error;
    }
  }

  async deleteFeature(academyId, featureId) {
    this.logger.info('[adminAcademyService] deleteFeature start');
    try {
      const result = await this.adminAcademyRepository.deleteFeature(academyId, featureId);
      this.logger.info('[adminAcademyService] deleteFeature success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteFeature error');
      throw error;
    }
  }

  async createInstructor(academyId, data) {
    this.logger.info('[adminAcademyService] createInstructor start');
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const instructor = await this.adminAcademyRepository.createInstructor(academyId, data);
      this.logger.info('[adminAcademyService] createInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createInstructor error');
      throw error;
    }
  }

  async updateInstructor(academyId, instructorId, data) {
    this.logger.info('[adminAcademyService] updateInstructor start');
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const instructor = await this.adminAcademyRepository.updateInstructor(academyId, instructorId, data);
      this.logger.info('[adminAcademyService] updateInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateInstructor error');
      throw error;
    }
  }

  async deleteInstructor(academyId, instructorId) {
    this.logger.info('[adminAcademyService] deleteInstructor start');
    try {
      const result = await this.adminAcademyRepository.deleteInstructor(academyId, instructorId);
      this.logger.info('[adminAcademyService] deleteInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteInstructor error');
      throw error;
    }
  }

  async createTopic(academyId, data) {
    this.logger.info('[adminAcademyService] createTopic start');
    try {
      if (data.theme_id) {
        const themes = await this.adminAcademyRepository.findThemesByAcademyId(academyId);
        const themeExists = themes.some((t) => t.id === data.theme_id);
        if (!themeExists) {
          const err = new Error('Theme not found or does not belong to this academy');
          err.statusCode = 404;
          throw err;
        }
      }
      const topic = await this.adminAcademyRepository.createTopic(academyId, data);
      this.logger.info('[adminAcademyService] createTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createTopic error');
      throw error;
    }
  }

  async updateTopic(academyId, topicId, data) {
    this.logger.info('[adminAcademyService] updateTopic start');
    try {
      if (data.theme_id) {
        const themes = await this.adminAcademyRepository.findThemesByAcademyId(academyId);
        const themeExists = themes.some((t) => t.id === data.theme_id);
        if (!themeExists) {
          const err = new Error('Theme not found or does not belong to this academy');
          err.statusCode = 404;
          throw err;
        }
      }
      const topic = await this.adminAcademyRepository.updateTopic(academyId, topicId, data);
      this.logger.info('[adminAcademyService] updateTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateTopic error');
      throw error;
    }
  }

  async deleteTopic(academyId, topicId) {
    this.logger.info('[adminAcademyService] deleteTopic start');
    try {
      const result = await this.adminAcademyRepository.deleteTopic(academyId, topicId);
      this.logger.info('[adminAcademyService] deleteTopic success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteTopic error');
      throw error;
    }
  }

  async createTestimonial(academyId, data) {
    this.logger.info('[adminAcademyService] createTestimonial start');
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const testimonial = await this.adminAcademyRepository.createTestimonial(academyId, data);
      this.logger.info('[adminAcademyService] createTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createTestimonial error');
      throw error;
    }
  }

  async updateTestimonial(academyId, testimonialId, data) {
    this.logger.info('[adminAcademyService] updateTestimonial start');
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const testimonial = await this.adminAcademyRepository.updateTestimonial(academyId, testimonialId, data);
      this.logger.info('[adminAcademyService] updateTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateTestimonial error');
      throw error;
    }
  }

  async deleteTestimonial(academyId, testimonialId) {
    this.logger.info('[adminAcademyService] deleteTestimonial start');
    try {
      const result = await this.adminAcademyRepository.deleteTestimonial(academyId, testimonialId);
      this.logger.info('[adminAcademyService] deleteTestimonial success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteTestimonial error');
      throw error;
    }
  }

  async createFaq(academyId, data) {
    this.logger.info('[adminAcademyService] createFaq start');
    try {
      const faq = await this.adminAcademyRepository.createFaq(academyId, data);
      this.logger.info('[adminAcademyService] createFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] createFaq error');
      throw error;
    }
  }

  async updateFaq(academyId, faqId, data) {
    this.logger.info('[adminAcademyService] updateFaq start');
    try {
      const faq = await this.adminAcademyRepository.updateFaq(academyId, faqId, data);
      this.logger.info('[adminAcademyService] updateFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] updateFaq error');
      throw error;
    }
  }

  async deleteFaq(academyId, faqId) {
    this.logger.info('[adminAcademyService] deleteFaq start');
    try {
      const result = await this.adminAcademyRepository.deleteFaq(academyId, faqId);
      this.logger.info('[adminAcademyService] deleteFaq success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[adminAcademyService] deleteFaq error');
      throw error;
    }
  }

  // Helper methods
  async validateAcademyData(data) {
    return;
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export const adminAcademyService = new AdminAcademyService();
