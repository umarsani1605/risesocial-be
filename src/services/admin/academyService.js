import { adminAcademyRepository } from '../../repositories/admin/academyRepository.js';
import { academyRepository } from '../../repositories/shared/academyRepository.js';
import { fileUploadService } from '../shared/fileUploadService.js';

export class AdminAcademyService {
  constructor() {
    this.adminAcademyRepository = adminAcademyRepository;
    this.academyRepository = academyRepository;
    this.fileUploadService = fileUploadService;
  }


  async createAcademy(academyData) {
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
          throw new Error('Failed to upload academy image');
        }
        delete academyDataWithDefaults.imageFile;
      }

      const academy = await this.adminAcademyRepository.create(academyDataWithDefaults);
      return academy;
    } catch (error) {
      throw error;
    }
  }

  async updateAcademy(id, updateData) {
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
          throw new Error('Failed to upload academy image');
        }
        delete updateData.imageFile;
      }

      const academy = await this.adminAcademyRepository.update(id, updateData);
      return academy;
    } catch (error) {
      throw error;
    }
  }

  async deleteAcademy(id) {
    try {
      const academy = await this.academyRepository.findById(id);
      if (!academy) {
        const error = new Error('Academy tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      await this.adminAcademyRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  // ─── GET sub-resource methods ───────────────────────────────────────────────

  async getPricings(academyId) {
    try {
      return await this.adminAcademyRepository.findPricingsByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  async getFeatures(academyId) {
    try {
      return await this.adminAcademyRepository.findFeaturesByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  async getInstructors(academyId) {
    try {
      return await this.adminAcademyRepository.findInstructorsByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  async getTopics(academyId) {
    try {
      return await this.adminAcademyRepository.findTopicsByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  async getTestimonials(academyId) {
    try {
      return await this.adminAcademyRepository.findTestimonialsByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  async getFaqs(academyId) {
    try {
      return await this.adminAcademyRepository.findFaqsByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  // ─── Theme CRUD methods ──────────────────────────────────────────────────────

  async getThemes(academyId) {
    try {
      return await this.adminAcademyRepository.findThemesByAcademyId(academyId);
    } catch (error) {
      throw error;
    }
  }

  async createTheme(academyId, data) {
    try {
      const academy = await this.academyRepository.findById(academyId);
      if (!academy) {
        const err = new Error('Academy not found');
        err.statusCode = 404;
        throw err;
      }
      const theme = await this.adminAcademyRepository.createTheme(academyId, data);
      return theme;
    } catch (error) {
      throw error;
    }
  }

  async updateTheme(academyId, themeId, data) {
    try {
      const theme = await this.adminAcademyRepository.updateTheme(academyId, themeId, data);
      return theme;
    } catch (error) {
      throw error;
    }
  }

  async deleteTheme(academyId, themeId) {
    try {
      const result = await this.adminAcademyRepository.deleteTheme(academyId, themeId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createPricing(academyId, data) {
    try {
      if (data.discount_price !== undefined && data.original_price !== undefined && data.discount_price > data.original_price) {
        throw new Error('Discount price cannot be greater than original price');
      }

      const pricing = await this.adminAcademyRepository.createPricing(academyId, data);
      return pricing;
    } catch (error) {
      throw error;
    }
  }

  async updatePricing(academyId, pricingId, data) {
    try {
      if (data.discount_price !== undefined && data.original_price !== undefined && data.discount_price > data.original_price) {
        throw new Error('Discount price cannot be greater than original price');
      }

      const pricing = await this.adminAcademyRepository.updatePricing(academyId, pricingId, data);
      return pricing;
    } catch (error) {
      throw error;
    }
  }

  async deletePricing(academyId, pricingId) {
    try {
      const result = await this.adminAcademyRepository.deletePricing(academyId, pricingId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createFeature(academyId, data) {
    try {
      const feature = await this.adminAcademyRepository.createFeature(academyId, data);
      return feature;
    } catch (error) {
      throw error;
    }
  }

  async updateFeature(academyId, featureId, data) {
    try {
      const feature = await this.adminAcademyRepository.updateFeature(academyId, featureId, data);
      return feature;
    } catch (error) {
      throw error;
    }
  }

  async deleteFeature(academyId, featureId) {
    try {
      const result = await this.adminAcademyRepository.deleteFeature(academyId, featureId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createInstructor(academyId, data) {
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const instructor = await this.adminAcademyRepository.createInstructor(academyId, data);
      return instructor;
    } catch (error) {
      throw error;
    }
  }

  async updateInstructor(academyId, instructorId, data) {
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const instructor = await this.adminAcademyRepository.updateInstructor(academyId, instructorId, data);
      return instructor;
    } catch (error) {
      throw error;
    }
  }

  async deleteInstructor(academyId, instructorId) {
    try {
      const result = await this.adminAcademyRepository.deleteInstructor(academyId, instructorId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createTopic(academyId, data) {
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
      return topic;
    } catch (error) {
      throw error;
    }
  }

  async updateTopic(academyId, topicId, data) {
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
      return topic;
    } catch (error) {
      throw error;
    }
  }

  async deleteTopic(academyId, topicId) {
    try {
      const result = await this.adminAcademyRepository.deleteTopic(academyId, topicId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createTestimonial(academyId, data) {
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const testimonial = await this.adminAcademyRepository.createTestimonial(academyId, data);
      return testimonial;
    } catch (error) {
      throw error;
    }
  }

  async updateTestimonial(academyId, testimonialId, data) {
    try {
      if (data.avatarFile) {
        const uploaded = await this.fileUploadService.upload(data.avatarFile);
        data.avatar_url = uploaded.publicUrl;
        delete data.avatarFile;
      } else if (data.avatar_url === '') {
        data.avatar_url = null;
      }

      const testimonial = await this.adminAcademyRepository.updateTestimonial(academyId, testimonialId, data);
      return testimonial;
    } catch (error) {
      throw error;
    }
  }

  async deleteTestimonial(academyId, testimonialId) {
    try {
      const result = await this.adminAcademyRepository.deleteTestimonial(academyId, testimonialId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createFaq(academyId, data) {
    try {
      const faq = await this.adminAcademyRepository.createFaq(academyId, data);
      return faq;
    } catch (error) {
      throw error;
    }
  }

  async updateFaq(academyId, faqId, data) {
    try {
      const faq = await this.adminAcademyRepository.updateFaq(academyId, faqId, data);
      return faq;
    } catch (error) {
      throw error;
    }
  }

  async deleteFaq(academyId, faqId) {
    try {
      const result = await this.adminAcademyRepository.deleteFaq(academyId, faqId);
      return result;
    } catch (error) {
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
