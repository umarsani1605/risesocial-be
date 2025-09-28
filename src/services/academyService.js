import { academyRepository } from '../repositories/academyRepository.js';
import { fileUploadService } from './fileUploadService.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Consolidated Academy Service
 * Handles all academy-related business logic
 */
export class AcademyService {
  constructor() {
    this.academyRepository = academyRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  // MAIN ACADEMY METHODS

  /**
   * Get all academies with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated academies
   */
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

  /**
   * Get academy by slug
   * @param {string} slug - Academy slug
   * @returns {Promise<Object>} Academy details
   * @throws {Error} If academy not found
   */
  async getAcademyBySlug(slug) {
    this.logger.info({ slug }, '[academyService] getAcademyBySlug start');
    try {
      const academy = await this.academyRepository.findBySlug(slug);

      if (!academy) {
        const error = new Error(`Academy dengan slug '${slug}' tidak ditemukan`);
        error.statusCode = 404;
        throw error;
      }

      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] getAcademyBySlug error');
      throw error;
    }
  }

  /**
   * Create new academy
   * @param {Object} academyData - Academy data
   * @param {number} userId - Creator user ID
   * @returns {Promise<Object>} Created academy
   * @throws {Error} If validation fails
   */
  async createAcademy(academyData) {
    this.logger.info('[academyService] createAcademy start');
    try {
      // Validate academy data
      await this.validateAcademyData(academyData);

      if (!academyData.path_slug) {
        academyData.path_slug = await this.generateSlug(academyData.title);
      } else {
        const slugExists = await this.academyRepository.slugExists(academyData.path_slug);
        if (slugExists) {
          const error = new Error('Academy dengan slug ini sudah ada');
          error.statusCode = 400;
          throw error;
        }
      }

      const academyDataWithDefaults = {
        ...academyData,
        status: academyData.status || 'DRAFT',
        rating: 0,
        rating_count: 0,
        certificate: academyData.certificate || false,
        portfolio: academyData.portfolio || false,
        meta_title: academyData.meta_title || this.generateMetaTitle(academyData.title),
        meta_description: academyData.meta_description || this.generateMetaDescription(academyData.description || ''),
      };

      // Handle image file upload
      if (academyData.imageFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(academyData.imageFile);
          academyDataWithDefaults.image_url = publicUrl;
          this.logger.info({ imageUrl: publicUrl }, '[academyService] academy image uploaded');
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[academyService] academy image upload failed');
          throw new Error('Failed to upload academy image');
        }
        delete academyDataWithDefaults.imageFile; // Remove file from data that goes to Prisma
      }

      const academy = await this.academyRepository.create(academyDataWithDefaults);
      this.logger.info('[academyService] createAcademy success');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createAcademy error');
      throw error;
    }
  }

  /**
   * Update academy by ID
   * @param {number} id - Academy ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated academy
   * @throws {Error} If academy not found or validation fails
   */
  async updateAcademy(id, updateData) {
    this.logger.info({ id }, '[academyService] updateAcademy start');
    try {
      const existingAcademy = await this.academyRepository.findById(id);

      if (!existingAcademy) {
        const error = new Error('Academy tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      if (updateData.title || updateData.description) {
        await this.validateAcademyData(updateData, true);
      }

      if (updateData.path_slug && updateData.path_slug !== existingAcademy.path_slug) {
        const slugExists = await this.academyRepository.slugExists(updateData.path_slug, id);
        if (slugExists) {
          const error = new Error('Academy dengan slug ini sudah ada');
          error.statusCode = 400;
          throw error;
        }
      }

      if (updateData.title && !updateData.path_slug) {
        updateData.path_slug = this.generateSlug(updateData.title);
        const slugExists = await this.academyRepository.slugExists(updateData.path_slug, id);
        if (slugExists) {
          updateData.path_slug = `${updateData.path_slug}-${Date.now()}`;
        }
      }

      if (updateData.title && !updateData.meta_title) {
        updateData.meta_title = this.generateMetaTitle(updateData.title);
      }
      if (updateData.description && !updateData.meta_description) {
        updateData.meta_description = this.generateMetaDescription(updateData.description);
      }

      // Handle image file upload
      if (updateData.imageFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(updateData.imageFile);
          updateData.image_url = publicUrl;
          this.logger.info({ imageUrl: publicUrl }, '[academyService] academy image uploaded');
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[academyService] academy image upload failed');
          throw new Error('Failed to upload academy image');
        }
        delete updateData.imageFile; // Remove file from data that goes to Prisma
      }

      const academy = await this.academyRepository.update(id, updateData);

      this.logger.info('[academyService] updateAcademy success');
      return academy;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateAcademy error');
      throw error;
    }
  }

  /**
   * Delete academy by ID (Hard delete)
   * @param {number} id - Academy ID
   * @returns {Promise<void>}
   * @throws {Error} If academy not found
   */
  async deleteAcademy(id) {
    this.logger.info({ id }, '[academyService] deleteAcademy start');
    try {
      const academy = await this.academyRepository.findById(id);
      if (!academy) {
        const error = new Error('Academy tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Hard delete - permanently remove from database
      await this.academyRepository.delete(id);
      this.logger.info('[academyService] deleteAcademy success');
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteAcademy error');
      throw error;
    }
  }

  /**
   * Get academy categories
   * @returns {Promise<Array>} Available categories
   */
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

  /**
   * Get academy statistics
   * @returns {Promise<Object>} Academy statistics
   */
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

  // ==================== FAQ METHODS ====================

  /**
   * Get all FAQs for academy
   * @param {number} academyId - Academy ID
   * @returns {Promise<Array>} Enhanced FAQ array
   */
  async getAllFaqsByAcademyId(academyId) {
    const faqs = await this.academyRepository.findFaqsByAcademyId(academyId);
    return faqs;
  }

  // FEATURE METHODS

  /**
   * Get all features for academy
   * @param {number} academyId - Academy ID
   * @returns {Promise<Array>} Enhanced features array
   */
  async getAllFeaturesByAcademyId(academyId) {
    const features = await this.academyRepository.findFeaturesByAcademyId(academyId);
    return features;
  }

  // PRICING METHODS

  /**
   * Get all pricing tiers for academy
   * @param {number} academyId - Academy ID
   * @returns {Promise<Array>} Enhanced pricing array
   */
  async getAllPricingsByAcademyId(academyId) {
    const pricings = await this.academyRepository.findPricingsByAcademyId(academyId);
    return pricings;
  }

  // ==================== TOPIC METHODS ====================

  /**
   * Get all topics for academy
   * @param {number} academyId - Academy ID
   * @param {boolean} includeSessions - Include sessions in topic
   * @returns {Promise<Array>} Enhanced topics array
   */
  async getAllTopicsByAcademyId(academyId, includeSessions = false) {
    const topics = await this.academyRepository.findTopicsByAcademyId(academyId, includeSessions);
    return topics;
  }

  // ==================== SESSION METHODS ====================

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate academy data
   * @private
   * @param {Object} data - Academy data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @throws {Error} If validation fails
   */
  async validateAcademyData(data, isUpdate = false) {
    // Validation removed as requested
    return;
  }

  /**
   * Generate slug from title
   * @private
   * @param {string} title - Title to generate slug from
   * @returns {string} Generated slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate unique slug from title
   * @private
   * @param {string} title - Title to generate slug from
   * @returns {Promise<string>} Generated unique slug
   */
  async generateUniqueSlug(title) {
    let baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await this.academyRepository.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Generate meta title from title
   * @private
   * @param {string} title - Title to generate meta title from
   * @returns {string} Generated meta title
   */
  generateMetaTitle(title) {
    return title.trim();
  }

  /**
   * Generate meta description from description
   * @private
   * @param {string} description - Description to generate meta description from
   * @returns {string} Generated meta description
   */
  generateMetaDescription(description) {
    const cleanDescription = description.trim();
    // Limit to 160 characters for SEO
    return cleanDescription.length > 160 ? cleanDescription.substring(0, 157) + '...' : cleanDescription;
  }

  /**
   * Validate FAQ data
   * @private
   * @param {Object} data - FAQ data
   * @throws {Error} If validation fails
   */
  validateFaqData(data) {
    // Validation removed as requested
    return;
  }

  /**
   * Validate feature data
   * @private
   * @param {Object} data - Feature data
   * @throws {Error} If validation fails
   */
  validateFeatureData(data) {
    // Validation removed as requested
    return;
  }

  /**
   * Validate pricing data
   * @private
   * @param {Object} data - Pricing data
   * @throws {Error} If validation fails
   */
  validatePricingData(data) {
    if (data.original_price !== undefined && data.original_price <= 0) {
      throw new Error('Harga asli harus lebih dari 0');
    }

    if (data.discount_price !== undefined && data.original_price !== undefined) {
      if (data.discount_price > data.original_price) {
        throw new Error('Harga diskon tidak boleh lebih tinggi dari harga asli');
      }
    }

    if (data.order !== undefined && data.order <= 0) {
      throw new Error('Tier order harus lebih dari 0');
    }
  }

  /**
   * Validate topic data
   * @private
   * @param {Object} data - Topic data
   * @throws {Error} If validation fails
   */
  validateTopicData(data) {
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Title topic tidak boleh kosong');
    }

    if (data.title && data.title.length > 255) {
      throw new Error('Title topic maksimal 255 karakter');
    }

    if (data.topic_order !== undefined && data.topic_order <= 0) {
      throw new Error('Topic order harus lebih dari 0');
    }
  }

  /**
   * Validate session data
   * @private
   * @param {Object} data - Session data
   * @throws {Error} If validation fails
   */
  validateSessionData(data) {
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Title session tidak boleh kosong');
    }

    if (data.title && data.title.length > 255) {
      throw new Error('Title session maksimal 255 karakter');
    }

    if (data.session_order !== undefined && data.session_order <= 0) {
      throw new Error('Session order harus lebih dari 0');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate slug format
   * @private
   * @param {string} slug - Slug to validate
   * @throws {Error} If slug is invalid
   */
  validateSlug(slug) {
    // Validation removed as requested
    return;
  }

  // ==================== PRICING METHODS ====================

  /**
   * Create pricing for academy
   * @param {number} academyId - Academy ID
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Created pricing
   */
  async createPricing(academyId, data) {
    this.logger.info({ academyId, data }, '[academyService] createPricing start');

    try {
      const pricing = await this.academyRepository.createPricing(academyId, data);

      this.logger.info({ pricingId: pricing.id }, '[academyService] createPricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createPricing error');
      throw error;
    }
  }

  /**
   * Update pricing for academy
   * @param {number} academyId - Academy ID
   * @param {number} pricingId - Pricing ID
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Updated pricing
   */
  async updatePricing(academyId, pricingId, data) {
    this.logger.info({ academyId, pricingId, data }, '[academyService] updatePricing start');

    try {
      const pricing = await this.academyRepository.updatePricing(academyId, pricingId, data);

      this.logger.info({ pricingId: pricing.id }, '[academyService] updatePricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updatePricing error');
      throw error;
    }
  }

  /**
   * Delete pricing for academy
   * @param {number} academyId - Academy ID
   * @param {number} pricingId - Pricing ID
   * @returns {Promise<Object>} Success message
   */
  async deletePricing(academyId, pricingId) {
    this.logger.info({ academyId, pricingId }, '[academyService] deletePricing start');

    try {
      const result = await this.academyRepository.deletePricing(academyId, pricingId);

      this.logger.info({ pricingId }, '[academyService] deletePricing success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deletePricing error');
      throw error;
    }
  }

  // ==================== FEATURES METHODS ====================

  /**
   * Create feature for academy
   * @param {number} academyId - Academy ID
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Created feature
   */
  async createFeature(academyId, data) {
    this.logger.info({ academyId, data }, '[academyService] createFeature start');

    try {
      const feature = await this.academyRepository.createFeature(academyId, data);

      this.logger.info({ featureId: feature.id }, '[academyService] createFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createFeature error');
      throw error;
    }
  }

  /**
   * Update feature for academy
   * @param {number} academyId - Academy ID
   * @param {number} featureId - Feature ID
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeature(academyId, featureId, data) {
    this.logger.info({ academyId, featureId, data }, '[academyService] updateFeature start');

    try {
      const feature = await this.academyRepository.updateFeature(academyId, featureId, data);

      this.logger.info({ featureId: feature.id }, '[academyService] updateFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateFeature error');
      throw error;
    }
  }

  /**
   * Delete feature for academy
   * @param {number} academyId - Academy ID
   * @param {number} featureId - Feature ID
   * @returns {Promise<Object>} Success message
   */
  async deleteFeature(academyId, featureId) {
    this.logger.info({ academyId, featureId }, '[academyService] deleteFeature start');

    try {
      const result = await this.academyRepository.deleteFeature(academyId, featureId);

      this.logger.info({ featureId }, '[academyService] deleteFeature success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteFeature error');
      throw error;
    }
  }

  // ==================== INSTRUCTORS METHODS ====================

  /**
   * Create instructor for academy
   * @param {number} academyId - Academy ID
   * @param {Object} data - Instructor data
   * @returns {Promise<Object>} Created instructor
   */
  async createInstructor(academyId, data) {
    this.logger.info({ academyId, data }, '[academyService] createInstructor start');

    try {
      // Handle avatar file upload
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
          this.logger.info({ avatarUrl: publicUrl }, '[academyService] instructor avatar uploaded');
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[academyService] instructor avatar upload failed');
          throw new Error('Failed to upload instructor avatar');
        }
        delete data.avatarFile; // Remove file from data
      } else if (data.avatar_url === '') {
        // Remove avatar (empty string means remove)
        data.avatar_url = null;
        this.logger.info('[academyService] avatar removed');
      }

      const instructor = await this.academyRepository.createInstructor(academyId, data);

      this.logger.info({ instructorId: instructor.id }, '[academyService] createInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createInstructor error');
      throw error;
    }
  }

  /**
   * Update instructor for academy
   * @param {number} academyId - Academy ID
   * @param {number} instructorId - Instructor ID
   * @param {Object} data - Instructor data
   * @returns {Promise<Object>} Updated instructor
   */
  async updateInstructor(academyId, instructorId, data) {
    this.logger.info({ academyId, instructorId, data }, '[academyService] updateInstructor start');

    try {
      // Handle avatar file upload
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
          this.logger.info({ avatarUrl: publicUrl }, '[academyService] instructor avatar uploaded');
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[academyService] instructor avatar upload failed');
          throw new Error('Failed to upload instructor avatar');
        }
        delete data.avatarFile; // Remove file from data
      } else if (data.avatar_url === '') {
        // Remove avatar (empty string means remove)
        data.avatar_url = null;
        this.logger.info('[academyService] avatar removed');
      }

      const instructor = await this.academyRepository.updateInstructor(academyId, instructorId, data);

      this.logger.info({ instructorId: instructor.id }, '[academyService] updateInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateInstructor error');
      throw error;
    }
  }

  /**
   * Delete instructor from academy
   * @param {number} academyId - Academy ID
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<Object>} Success message
   */
  async deleteInstructor(academyId, instructorId) {
    this.logger.info({ academyId, instructorId }, '[academyService] deleteInstructor start');

    try {
      const result = await this.academyRepository.deleteInstructor(academyId, instructorId);

      this.logger.info({ instructorId }, '[academyService] deleteInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteInstructor error');
      throw error;
    }
  }

  // ==================== TOPICS METHODS ====================

  /**
   * Create topic for academy
   * @param {number} academyId - Academy ID
   * @param {Object} data - Topic data
   * @returns {Promise<Object>} Created topic
   */
  async createTopic(academyId, data) {
    this.logger.info({ academyId, data }, '[academyService] createTopic start');

    try {
      const topic = await this.academyRepository.createTopic(academyId, data);

      this.logger.info({ topicId: topic.id }, '[academyService] createTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createTopic error');
      throw error;
    }
  }

  /**
   * Update topic for academy
   * @param {number} academyId - Academy ID
   * @param {number} topicId - Topic ID
   * @param {Object} data - Topic data
   * @returns {Promise<Object>} Updated topic
   */
  async updateTopic(academyId, topicId, data) {
    this.logger.info({ academyId, topicId, data }, '[academyService] updateTopic start');

    try {
      const topic = await this.academyRepository.updateTopic(academyId, topicId, data);

      this.logger.info({ topicId: topic.id }, '[academyService] updateTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateTopic error');
      throw error;
    }
  }

  /**
   * Delete topic from academy
   * @param {number} academyId - Academy ID
   * @param {number} topicId - Topic ID
   * @returns {Promise<Object>} Success message
   */
  async deleteTopic(academyId, topicId) {
    this.logger.info({ academyId, topicId }, '[academyService] deleteTopic start');

    try {
      const result = await this.academyRepository.deleteTopic(academyId, topicId);

      this.logger.info({ topicId }, '[academyService] deleteTopic success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteTopic error');
      throw error;
    }
  }

  // ==================== TESTIMONIALS METHODS ====================

  /**
   * Create testimonial for academy
   * @param {number} academyId - Academy ID
   * @param {Object} data - Testimonial data
   * @returns {Promise<Object>} Created testimonial
   */
  async createTestimonial(academyId, data) {
    this.logger.info({ academyId, data }, '[academyService] createTestimonial start');

    try {
      // Handle avatar file upload
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
          this.logger.info({ avatarUrl: publicUrl }, '[academyService] testimonial avatar uploaded');
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[academyService] testimonial avatar upload failed');
          throw new Error('Failed to upload testimonial avatar');
        }
        delete data.avatarFile; // Remove file from data
      } else if (data.avatar_url === '') {
        // Remove avatar (empty string means remove)
        data.avatar_url = null;
        this.logger.info('[academyService] avatar removed');
      }

      const testimonial = await this.academyRepository.createTestimonial(academyId, data);

      this.logger.info({ testimonialId: testimonial.id }, '[academyService] createTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createTestimonial error');
      throw error;
    }
  }

  /**
   * Update testimonial for academy
   * @param {number} academyId - Academy ID
   * @param {number} testimonialId - Testimonial ID
   * @param {Object} data - Testimonial data
   * @returns {Promise<Object>} Updated testimonial
   */
  async updateTestimonial(academyId, testimonialId, data) {
    this.logger.info({ academyId, testimonialId, data }, '[academyService] updateTestimonial start');

    try {
      // Handle avatar file upload
      if (data.avatarFile) {
        try {
          const publicUrl = this.fileUploadService.generatePublicFileUrl(data.avatarFile);
          data.avatar_url = publicUrl;
          this.logger.info({ avatarUrl: publicUrl }, '[academyService] testimonial avatar uploaded');
        } catch (uploadError) {
          this.logger.error({ err: uploadError }, '[academyService] testimonial avatar upload failed');
          throw new Error('Failed to upload testimonial avatar');
        }
        delete data.avatarFile; // Remove file from data
      } else if (data.avatar_url === '') {
        // Remove avatar (empty string means remove)
        data.avatar_url = null;
        this.logger.info('[academyService] avatar removed');
      }

      const testimonial = await this.academyRepository.updateTestimonial(academyId, testimonialId, data);

      this.logger.info({ testimonialId: testimonial.id }, '[academyService] updateTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateTestimonial error');
      throw error;
    }
  }

  /**
   * Delete testimonial from academy
   * @param {number} academyId - Academy ID
   * @param {number} testimonialId - Testimonial ID
   * @returns {Promise<Object>} Success message
   */
  async deleteTestimonial(academyId, testimonialId) {
    this.logger.info({ academyId, testimonialId }, '[academyService] deleteTestimonial start');

    try {
      const result = await this.academyRepository.deleteTestimonial(academyId, testimonialId);

      this.logger.info({ testimonialId }, '[academyService] deleteTestimonial success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteTestimonial error');
      throw error;
    }
  }

  // ==================== FAQs METHODS ====================

  /**
   * Create FAQ for academy
   * @param {number} academyId - Academy ID
   * @param {Object} data - FAQ data
   * @returns {Promise<Object>} Created FAQ
   */
  async createFaq(academyId, data) {
    this.logger.info({ academyId, data }, '[academyService] createFaq start');

    try {
      const faq = await this.academyRepository.createFaq(academyId, data);

      this.logger.info({ faqId: faq.id }, '[academyService] createFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createFaq error');
      throw error;
    }
  }

  /**
   * Update FAQ for academy
   * @param {number} academyId - Academy ID
   * @param {number} faqId - FAQ ID
   * @param {Object} data - FAQ data
   * @returns {Promise<Object>} Updated FAQ
   */
  async updateFaq(academyId, faqId, data) {
    this.logger.info({ academyId, faqId, data }, '[academyService] updateFaq start');

    try {
      const faq = await this.academyRepository.updateFaq(academyId, faqId, data);

      this.logger.info({ faqId: faq.id }, '[academyService] updateFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateFaq error');
      throw error;
    }
  }

  /**
   * Delete FAQ from academy
   * @param {number} academyId - Academy ID
   * @param {number} faqId - FAQ ID
   * @returns {Promise<Object>} Success message
   */
  async deleteFaq(academyId, faqId) {
    this.logger.info({ academyId, faqId }, '[academyService] deleteFaq start');

    try {
      const result = await this.academyRepository.deleteFaq(academyId, faqId);

      this.logger.info({ faqId }, '[academyService] deleteFaq success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteFaq error');
      throw error;
    }
  }

  // ==================== SESSION METHODS ====================

  /**
   * Create session for topic
   */
  async createSession(academyId, topicId, data) {
    this.logger.info({ academyId, topicId, data }, '[academyService] createSession start');

    try {
      const session = await this.academyRepository.createSession(academyId, topicId, data);
      this.logger.info({ sessionId: session.id }, '[academyService] createSession success');
      return session;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] createSession error');
      throw error;
    }
  }

  /**
   * Update session
   */
  async updateSession(academyId, topicId, sessionId, data) {
    this.logger.info({ academyId, topicId, sessionId, data }, '[academyService] updateSession start');

    try {
      const session = await this.academyRepository.updateSession(academyId, topicId, sessionId, data);
      this.logger.info({ sessionId: session.id }, '[academyService] updateSession success');
      return session;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] updateSession error');
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(academyId, topicId, sessionId) {
    this.logger.info({ academyId, topicId, sessionId }, '[academyService] deleteSession start');

    try {
      const result = await this.academyRepository.deleteSession(academyId, topicId, sessionId);
      this.logger.info({ sessionId }, '[academyService] deleteSession success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[academyService] deleteSession error');
      throw error;
    }
  }
}

export const academyService = new AcademyService();
