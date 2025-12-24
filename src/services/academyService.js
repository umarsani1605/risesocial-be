import { academyRepository } from '../repositories/academyRepository.js';
import { fileUploadService } from './fileUploadService.js';
import { getLogger } from '../lib/loggerContext.js';

export class AcademyService {
  constructor() {
    this.academyRepository = academyRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  async getAllAcademies(options = {}) {
    this.logger.info('[academyService] getAllAcademies start');
    try {
      const result = await this.academyRepository.findWithPagination(options);
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
      if (!academy) throw new Error('Academy not found');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAcademyBySlug error');
      throw error;
    }
  }

  async createAcademy(academyData) {
    this.logger.info('[academyService] createAcademy start');
    try {
      if (!academyData.path_slug) {
        academyData.path_slug = this.generateSlug(academyData.title);
      } else {
        const slugExists = await this.academyRepository.slugExists(academyData.path_slug);
        if (slugExists) throw new Error('Slug is already taken');
      }

      const academyDataWithDefaults = {
        ...academyData,
        status: academyData.status || 'DRAFT',
        rating: 0,
        rating_count: 0,
        certificate: academyData.certificate || false,
        portfolio: academyData.portfolio || false,
        meta_title: academyData.meta_title || academyData.title.trim(),
        meta_description: academyData.meta_description || this.generateMetaDescription(academyData.description || ''),
      };

      if (academyData.imageFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(academyData.imageFile);
          academyDataWithDefaults.image_url = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload academy image');
        }
        delete academyDataWithDefaults.imageFile;
      }

      const academy = await this.academyRepository.create(academyDataWithDefaults);
      this.logger.info('[academyService] createAcademy success');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createAcademy error');
      throw error;
    }
  }

  async updateAcademy(id, updateData) {
    this.logger.info('[academyService] updateAcademy start');
    try {
      const existingAcademy = await this.academyRepository.findById(id);
      if (!existingAcademy) throw new Error('Academy not found');

      if (updateData.path_slug && updateData.path_slug !== existingAcademy.path_slug) {
        const slugExists = await this.academyRepository.slugExists(updateData.path_slug, id);
        if (slugExists) throw new Error('Slug is already taken');
      }

      if (updateData.title && !updateData.path_slug) {
        updateData.path_slug = this.generateSlug(updateData.title);
        const slugExists = await this.academyRepository.slugExists(updateData.path_slug, id);
        if (slugExists) {
          updateData.path_slug = `${updateData.path_slug}-${Date.now()}`;
        }
      }

      if (updateData.title && !updateData.meta_title) {
        updateData.meta_title = updateData.title.trim();
      }
      if (updateData.description && !updateData.meta_description) {
        updateData.meta_description = this.generateMetaDescription(updateData.description);
      }

      if (updateData.imageFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(updateData.imageFile);
          updateData.image_url = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload academy image');
        }
        delete updateData.imageFile;
      }

      const academy = await this.academyRepository.update(id, updateData);
      this.logger.info('[academyService] updateAcademy success');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateAcademy error');
      throw error;
    }
  }

  async deleteAcademy(id) {
    this.logger.info('[academyService] deleteAcademy start');
    try {
      const academy = await this.academyRepository.findById(id);
      if (!academy) throw new Error('Academy not found');
      await this.academyRepository.delete(id);
      this.logger.info('[academyService] deleteAcademy success');
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteAcademy error');
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

  async getStatistics() {
    this.logger.info('[academyService] getStatistics start');
    try {
      const stats = await this.academyRepository.getAcademyStatistics();
      this.logger.info('[academyService] getStatistics success');
      return stats;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getStatistics error');
      throw error;
    }
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

  generateMetaDescription(description) {
    const cleanDescription = description.trim();
    return cleanDescription.length > 160 ? cleanDescription.substring(0, 157) + '...' : cleanDescription;
  }

  async createPricing(academyId, data) {
    this.logger.info('[academyService] createPricing start');
    try {
      if (data.discount_price !== undefined && data.original_price !== undefined && data.discount_price > data.original_price) {
        throw new Error('Discount price cannot be greater than original price');
      }

      const pricing = await this.academyRepository.createPricing(academyId, data);
      this.logger.info('[academyService] createPricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createPricing error');
      throw error;
    }
  }

  async updatePricing(academyId, pricingId, data) {
    this.logger.info('[academyService] updatePricing start');
    try {
      if (data.discount_price !== undefined && data.original_price !== undefined && data.discount_price > data.original_price) {
        throw new Error('Discount price cannot be greater than original price');
      }

      const pricing = await this.academyRepository.updatePricing(academyId, pricingId, data);
      this.logger.info('[academyService] updatePricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updatePricing error');
      throw error;
    }
  }

  async deletePricing(academyId, pricingId) {
    this.logger.info('[academyService] deletePricing start');
    try {
      const result = await this.academyRepository.deletePricing(academyId, pricingId);
      this.logger.info('[academyService] deletePricing success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deletePricing error');
      throw error;
    }
  }

  async createFeature(academyId, data) {
    this.logger.info('[academyService] createFeature start');
    try {
      const feature = await this.academyRepository.createFeature(academyId, data);
      this.logger.info('[academyService] createFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createFeature error');
      throw error;
    }
  }

  async updateFeature(academyId, featureId, data) {
    this.logger.info('[academyService] updateFeature start');
    try {
      const feature = await this.academyRepository.updateFeature(academyId, featureId, data);
      this.logger.info('[academyService] updateFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateFeature error');
      throw error;
    }
  }

  async deleteFeature(academyId, featureId) {
    this.logger.info('[academyService] deleteFeature start');
    try {
      const result = await this.academyRepository.deleteFeature(academyId, featureId);
      this.logger.info('[academyService] deleteFeature success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteFeature error');
      throw error;
    }
  }

  async createInstructor(academyId, data) {
    this.logger.info('[academyService] createInstructor start');
    try {
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload instructor avatar');
        }
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const instructor = await this.academyRepository.createInstructor(academyId, data);
      this.logger.info('[academyService] createInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createInstructor error');
      throw error;
    }
  }

  async updateInstructor(academyId, instructorId, data) {
    this.logger.info('[academyService] updateInstructor start');
    try {
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload instructor avatar');
        }
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const instructor = await this.academyRepository.updateInstructor(academyId, instructorId, data);
      this.logger.info('[academyService] updateInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateInstructor error');
      throw error;
    }
  }

  async deleteInstructor(academyId, instructorId) {
    this.logger.info('[academyService] deleteInstructor start');
    try {
      const result = await this.academyRepository.deleteInstructor(academyId, instructorId);
      this.logger.info('[academyService] deleteInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteInstructor error');
      throw error;
    }
  }

  async createTopic(academyId, data) {
    this.logger.info('[academyService] createTopic start');
    try {
      const topic = await this.academyRepository.createTopic(academyId, data);
      this.logger.info('[academyService] createTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createTopic error');
      throw error;
    }
  }

  async updateTopic(academyId, topicId, data) {
    this.logger.info('[academyService] updateTopic start');
    try {
      const topic = await this.academyRepository.updateTopic(academyId, topicId, data);
      this.logger.info('[academyService] updateTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateTopic error');
      throw error;
    }
  }

  async deleteTopic(academyId, topicId) {
    this.logger.info('[academyService] deleteTopic start');
    try {
      const result = await this.academyRepository.deleteTopic(academyId, topicId);
      this.logger.info('[academyService] deleteTopic success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteTopic error');
      throw error;
    }
  }

  async createTestimonial(academyId, data) {
    this.logger.info('[academyService] createTestimonial start');
    try {
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload testimonial avatar');
        }
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const testimonial = await this.academyRepository.createTestimonial(academyId, data);
      this.logger.info('[academyService] createTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createTestimonial error');
      throw error;
    }
  }

  async updateTestimonial(academyId, testimonialId, data) {
    this.logger.info('[academyService] updateTestimonial start');
    try {
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
        } catch (uploadError) {
          throw new Error('Failed to upload testimonial avatar');
        }
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const testimonial = await this.academyRepository.updateTestimonial(academyId, testimonialId, data);
      this.logger.info('[academyService] updateTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateTestimonial error');
      throw error;
    }
  }

  async deleteTestimonial(academyId, testimonialId) {
    this.logger.info('[academyService] deleteTestimonial start');
    try {
      const result = await this.academyRepository.deleteTestimonial(academyId, testimonialId);
      this.logger.info('[academyService] deleteTestimonial success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteTestimonial error');
      throw error;
    }
  }

  async createFaq(academyId, data) {
    this.logger.info('[academyService] createFaq start');
    try {
      const faq = await this.academyRepository.createFaq(academyId, data);
      this.logger.info('[academyService] createFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createFaq error');
      throw error;
    }
  }

  async updateFaq(academyId, faqId, data) {
    this.logger.info('[academyService] updateFaq start');
    try {
      const faq = await this.academyRepository.updateFaq(academyId, faqId, data);
      this.logger.info('[academyService] updateFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateFaq error');
      throw error;
    }
  }

  async deleteFaq(academyId, faqId) {
    this.logger.info('[academyService] deleteFaq start');
    try {
      const result = await this.academyRepository.deleteFaq(academyId, faqId);
      this.logger.info('[academyService] deleteFaq success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteFaq error');
      throw error;
    }
  }

  async createSession(academyId, topicId, data) {
    this.logger.info('[academyService] createSession start');
    try {
      const session = await this.academyRepository.createSession(academyId, topicId, data);
      this.logger.info('[academyService] createSession success');
      return session;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createSession error');
      throw error;
    }
  }

  async updateSession(academyId, topicId, sessionId, data) {
    this.logger.info('[academyService] updateSession start');
    try {
      const session = await this.academyRepository.updateSession(academyId, topicId, sessionId, data);
      this.logger.info('[academyService] updateSession success');
      return session;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateSession error');
      throw error;
    }
  }

  async deleteSession(academyId, topicId, sessionId) {
    this.logger.info('[academyService] deleteSession start');
    try {
      const result = await this.academyRepository.deleteSession(academyId, topicId, sessionId);
      this.logger.info('[academyService] deleteSession success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteSession error');
      throw error;
    }
  }
}

export const academyService = new AcademyService();
