import { bootcampRepository } from '../repositories/bootcampRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Consolidated Bootcamp Service
 * Handles all bootcamp-related business logic
 */
export class BootcampService {
  constructor() {
    this.bootcampRepository = bootcampRepository;
  }

  get logger() {
    return getLogger();
  }

  // ==================== MAIN BOOTCAMP METHODS ====================

  /**
   * Get all bootcamps with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated bootcamps
   */
  async getAllBootcamps(options = {}) {
    this.logger.info('[bootcampService] getAllBootcamps start');
    try {
      // Add some business logic for default includes
      const enhancedOptions = {
        ...options,
        includeRelations: true, // Always include basic relations for listing
      };

      const result = await this.bootcampRepository.findWithPagination(enhancedOptions);

      // Add computed fields to each bootcamp
      result.data = result.data.map((bootcamp) => this.enhanceBootcamp(bootcamp));

      this.logger.info('[bootcampService] getAllBootcamps success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] getAllBootcamps error');
      throw error;
    }
  }

  /**
   * Get bootcamp by slug
   * @param {string} slug - Bootcamp slug
   * @returns {Promise<Object>} Bootcamp details
   * @throws {Error} If bootcamp not found
   */
  async getBootcampBySlug(slug) {
    this.logger.info({ slug }, '[bootcampService] getBootcampBySlug start');
    try {
      const bootcamp = await this.bootcampRepository.findBySlug(slug);

      if (!bootcamp) {
        const error = new Error(`Bootcamp dengan slug '${slug}' tidak ditemukan`);
        error.statusCode = 404;
        throw error;
      }

      // Add computed fields and business logic
      const result = this.enhanceBootcampDetails(bootcamp);
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] getBootcampBySlug error');
      throw error;
    }
  }

  /**
   * Get featured bootcamps
   * @param {number} limit - Number of bootcamps to return
   * @returns {Promise<Array>} Featured bootcamps
   */
  async getFeaturedBootcamps(limit = 6) {
    this.logger.info({ limit }, '[bootcampService] getFeaturedBootcamps start');
    try {
      const bootcamps = await this.bootcampRepository.getFeatured(limit);
      const result = bootcamps.map((bootcamp) => this.enhanceBootcamp(bootcamp));
      this.logger.info('[bootcampService] getFeaturedBootcamps success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] getFeaturedBootcamps error');
      throw error;
    }
  }

  /**
   * Create new bootcamp
   * @param {Object} bootcampData - Bootcamp data
   * @param {number} userId - Creator user ID
   * @returns {Promise<Object>} Created bootcamp
   * @throws {Error} If validation fails
   */
  async createBootcamp(bootcampData, userId) {
    this.logger.info('[bootcampService] createBootcamp start');
    try {
      // Validate bootcamp data
      await this.validateBootcampData(bootcampData);

      // Generate slug if not provided
      if (!bootcampData.path_slug) {
        bootcampData.path_slug = await this.generateUniqueSlug(bootcampData.title);
      } else {
        // Validate slug format and uniqueness
        this.validateSlug(bootcampData.path_slug);
        const slugExists = await this.bootcampRepository.slugExists(bootcampData.path_slug);
        if (slugExists) {
          const error = new Error('Bootcamp dengan slug ini sudah ada');
          error.statusCode = 400;
          throw error;
        }
      }

      // Set defaults and metadata
      const bootcampDataWithDefaults = {
        ...bootcampData,
        status: bootcampData.status || 'DRAFT',
        rating: 0,
        rating_count: 0,
        certificate: bootcampData.certificate || false,
        portfolio: bootcampData.portfolio || false,
        created_by: userId,
        // Auto-generate meta fields
        meta_title: bootcampData.meta_title || this.generateMetaTitle(bootcampData.title),
        meta_description: bootcampData.meta_description || this.generateMetaDescription(bootcampData.description || ''),
      };

      const bootcamp = await this.bootcampRepository.create(bootcampDataWithDefaults);
      const result = this.enhanceBootcamp(bootcamp);
      this.logger.info('[bootcampService] createBootcamp success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createBootcamp error');
      throw error;
    }
  }

  /**
   * Update bootcamp by ID
   * @param {number} id - Bootcamp ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated bootcamp
   * @throws {Error} If bootcamp not found or validation fails
   */
  async updateBootcamp(id, updateData) {
    this.logger.info({ id }, '[bootcampService] updateBootcamp start');
    try {
      // Check if bootcamp exists
      const existingBootcamp = await this.bootcampRepository.findById(id);
      if (!existingBootcamp) {
        const error = new Error('Bootcamp tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Validate update data
      if (updateData.title || updateData.description) {
        await this.validateBootcampData(updateData, true);
      }

      // Handle slug update
      if (updateData.path_slug && updateData.path_slug !== existingBootcamp.path_slug) {
        this.validateSlug(updateData.path_slug);
        const slugExists = await this.bootcampRepository.slugExists(updateData.path_slug, id);
        if (slugExists) {
          const error = new Error('Bootcamp dengan slug ini sudah ada');
          error.statusCode = 400;
          throw error;
        }
      }

      // Auto-generate slug if title is updated
      if (updateData.title && !updateData.path_slug) {
        updateData.path_slug = this.generateSlug(updateData.title);
        // Check if generated slug is unique
        const slugExists = await this.bootcampRepository.slugExists(updateData.path_slug, id);
        if (slugExists) {
          // Add timestamp to make it unique
          updateData.path_slug = `${updateData.path_slug}-${Date.now()}`;
        }
      }

      // Auto-generate meta fields if title or description is updated
      if (updateData.title && !updateData.meta_title) {
        updateData.meta_title = this.generateMetaTitle(updateData.title);
      }
      if (updateData.description && !updateData.meta_description) {
        updateData.meta_description = this.generateMetaDescription(updateData.description);
      }

      const bootcamp = await this.bootcampRepository.update(id, updateData);
      const result = this.enhanceBootcamp(bootcamp);
      this.logger.info('[bootcampService] updateBootcamp success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateBootcamp error');
      throw error;
    }
  }

  /**
   * Delete bootcamp by ID
   * @param {number} id - Bootcamp ID
   * @returns {Promise<void>}
   * @throws {Error} If bootcamp not found
   */
  async deleteBootcamp(id) {
    this.logger.info({ id }, '[bootcampService] deleteBootcamp start');
    try {
      const bootcamp = await this.bootcampRepository.findById(id);
      if (!bootcamp) {
        const error = new Error('Bootcamp tidak ditemukan');
        error.statusCode = 404;
        throw error;
      }

      // Soft delete by setting status to ARCHIVED
      await this.bootcampRepository.update(id, { status: 'ARCHIVED' });
      this.logger.info('[bootcampService] deleteBootcamp success');
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteBootcamp error');
      throw error;
    }
  }

  /**
   * Get bootcamp categories
   * @returns {Promise<Array>} Available categories
   */
  async getCategories() {
    this.logger.info('[bootcampService] getCategories start');
    try {
      const categories = await this.bootcampRepository.getCategories();
      this.logger.info('[bootcampService] getCategories success');
      return categories;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] getCategories error');
      throw error;
    }
  }

  /**
   * Get bootcamp statistics
   * @returns {Promise<Object>} Bootcamp statistics
   */
  async getStatistics() {
    this.logger.info('[bootcampService] getStatistics start');
    try {
      const stats = await this.bootcampRepository.getBootcampStatistics();
      this.logger.info('[bootcampService] getStatistics success');
      return stats;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] getStatistics error');
      throw error;
    }
  }

  // ==================== FAQ METHODS ====================

  /**
   * Get all FAQs for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Enhanced FAQ array
   */
  async getAllFaqsByBootcampId(bootcampId) {
    const faqs = await this.bootcampRepository.findFaqsByBootcampId(bootcampId);
    return faqs.map((faq) => this.enhanceFaqObject(faq));
  }

  /**
   * Create FAQ for bootcamp
   * @param {Object} data - FAQ data
   * @returns {Promise<Object>} Created FAQ
   */
  async createFaq(data) {
    // Validate FAQ data
    this.validateFaqData(data);

    const faq = await this.bootcampRepository.createFaq(data);
    return this.enhanceFaqObject(faq);
  }

  /**
   * Update FAQ
   * @param {number} id - FAQ ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated FAQ
   */
  async updateFaq(id, data) {
    // Validate data if provided
    if (data.question || data.answer) {
      this.validateFaqData(data);
    }

    const faq = await this.bootcampRepository.updateFaq(id, data);
    return this.enhanceFaqObject(faq);
  }

  /**
   * Delete FAQ
   * @param {number} id - FAQ ID
   * @returns {Promise<Object>} Deleted FAQ
   */
  async deleteFaq(id) {
    return await this.bootcampRepository.deleteFaq(id);
  }

  /**
   * Search FAQs by keyword
   * @param {number} bootcampId - Bootcamp ID
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Matching FAQs
   */
  async searchFaqs(bootcampId, keyword) {
    const faqs = await this.bootcampRepository.searchFaq(bootcampId, keyword);
    return faqs.map((faq) => this.enhanceFaqObject(faq));
  }

  /**
   * Get FAQ statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Enhanced FAQ statistics
   */
  async getFaqStats(bootcampId) {
    const stats = await this.bootcampRepository.getFaqStats(bootcampId);

    return {
      ...stats,
      readability_score: this.calculateReadabilityScore(stats),
      content_quality: this.assessContentQuality(stats),
      coverage_areas: await this.analyzeCoverageAreas(bootcampId),
      user_friendliness: this.assessUserFriendliness(stats),
    };
  }

  /**
   * Get frequently asked FAQs
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} limit - Limit results
   * @returns {Promise<Array>} Frequently asked FAQs
   */
  async getFrequentlyAskedFaqs(bootcampId, limit = 5) {
    const faqs = await this.bootcampRepository.findFaqsByBootcampId(bootcampId);

    // Priority based on common keywords
    const commonKeywords = ['biaya', 'harga', 'jadwal', 'waktu', 'sertifikat', 'syarat', 'cara'];

    const scoredFaqs = faqs.map((faq) => {
      let score = 0;
      const lowerQuestion = faq.question.toLowerCase();

      commonKeywords.forEach((keyword) => {
        if (lowerQuestion.includes(keyword)) score++;
      });

      return { ...faq, relevance_score: score };
    });

    return scoredFaqs
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit)
      .map((faq) => this.enhanceFaqObject(faq));
  }

  // ==================== FEATURE METHODS ====================

  /**
   * Get all features for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Enhanced features array
   */
  async getAllFeaturesByBootcampId(bootcampId) {
    const features = await this.bootcampRepository.findFeaturesByBootcampId(bootcampId);
    return features.map((feature) => this.enhanceFeatureObject(feature));
  }

  /**
   * Create feature for bootcamp
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Created feature
   */
  async createFeature(data) {
    // Validate feature data
    this.validateFeatureData(data);

    const feature = await this.bootcampRepository.createFeature(data);
    return this.enhanceFeatureObject(feature);
  }

  /**
   * Update feature
   * @param {number} id - Feature ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeature(id, data) {
    // Validate data if provided
    if (data.title || data.description) {
      this.validateFeatureData(data);
    }

    const feature = await this.bootcampRepository.updateFeature(id, data);
    return this.enhanceFeatureObject(feature);
  }

  /**
   * Delete feature
   * @param {number} id - Feature ID
   * @returns {Promise<Object>} Deleted feature
   */
  async deleteFeature(id) {
    return await this.bootcampRepository.deleteFeature(id);
  }

  /**
   * Reorder features
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {id, feature_order}
   * @returns {Promise<Array>} Updated features
   */
  async reorderFeatures(bootcampId, orderData) {
    const updatedFeatures = await this.bootcampRepository.reorderFeatures(bootcampId, orderData);
    return updatedFeatures.map((feature) => this.enhanceFeatureObject(feature));
  }

  /**
   * Get feature statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Enhanced feature statistics
   */
  async getFeatureStats(bootcampId) {
    const stats = await this.bootcampRepository.getFeatureStats(bootcampId);

    return {
      ...stats,
      completion_rate: stats.total_features > 0 ? Math.round((stats.features_with_descriptions / stats.total_features) * 100) : 0,
      icon_coverage: stats.total_features > 0 ? Math.round((stats.features_with_icons / stats.total_features) * 100) : 0,
      quality_score: this.calculateFeatureQualityScore(stats),
    };
  }

  // ==================== PRICING METHODS ====================

  /**
   * Get all pricing tiers for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Enhanced pricing array
   */
  async getAllPricingsByBootcampId(bootcampId) {
    const pricings = await this.bootcampRepository.findPricingsByBootcampId(bootcampId);
    return pricings.map((pricing) => this.enhancePricingObject(pricing));
  }

  /**
   * Create pricing tier for bootcamp
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Created pricing tier
   */
  async createPricing(data) {
    // Validate pricing data
    this.validatePricingData(data);

    const pricing = await this.bootcampRepository.createPricing(data);
    return this.enhancePricingObject(pricing);
  }

  /**
   * Update pricing tier
   * @param {number} id - Pricing ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated pricing tier
   */
  async updatePricing(id, data) {
    // Validate data if provided
    if (data.original_price || data.discount_price) {
      this.validatePricingData(data);
    }

    const pricing = await this.bootcampRepository.updatePricing(id, data);
    return this.enhancePricingObject(pricing);
  }

  /**
   * Delete pricing tier
   * @param {number} id - Pricing ID
   * @returns {Promise<Object>} Deleted pricing tier
   */
  async deletePricing(id) {
    return await this.bootcampRepository.deletePricing(id);
  }

  /**
   * Reorder pricing tiers
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {id, tier_order}
   * @returns {Promise<Array>} Updated pricing tiers
   */
  async reorderPricingTiers(bootcampId, orderData) {
    const updatedPricings = await this.bootcampRepository.reorderPricingTiers(bootcampId, orderData);
    return updatedPricings.map((pricing) => this.enhancePricingObject(pricing));
  }

  /**
   * Get pricing statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Enhanced pricing statistics
   */
  async getPricingStats(bootcampId) {
    const stats = await this.bootcampRepository.getPricingStats(bootcampId);

    return {
      ...stats,
      min_price_formatted: this.formatPrice(stats.min_price),
      max_price_formatted: this.formatPrice(stats.max_price),
      price_range:
        stats.min_price === stats.max_price
          ? this.formatPrice(stats.min_price)
          : `${this.formatPrice(stats.min_price)} - ${this.formatPrice(stats.max_price)}`,
      has_discount: stats.average_discount > 0,
    };
  }

  // ==================== TOPIC METHODS ====================

  /**
   * Get all topics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {boolean} includeSessions - Include sessions in topic
   * @returns {Promise<Array>} Enhanced topics array
   */
  async getAllTopicsByBootcampId(bootcampId, includeSessions = false) {
    const topics = await this.bootcampRepository.findTopicsByBootcampId(bootcampId, includeSessions);
    return topics.map((topic) => this.enhanceTopicObject(topic));
  }

  /**
   * Create topic for bootcamp
   * @param {Object} data - Topic data
   * @returns {Promise<Object>} Created topic
   */
  async createTopic(data) {
    // Validate topic data
    this.validateTopicData(data);

    const topic = await this.bootcampRepository.createTopic(data);
    return this.enhanceTopicObject(topic);
  }

  /**
   * Update topic
   * @param {number} id - Topic ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated topic
   */
  async updateTopic(id, data) {
    // Validate data if provided
    if (data.title || data.description) {
      this.validateTopicData(data);
    }

    const topic = await this.bootcampRepository.updateTopic(id, data);
    return this.enhanceTopicObject(topic);
  }

  /**
   * Delete topic
   * @param {number} id - Topic ID
   * @returns {Promise<Object>} Deleted topic
   */
  async deleteTopic(id) {
    return await this.bootcampRepository.deleteTopic(id);
  }

  /**
   * Reorder topics
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {id, topic_order}
   * @returns {Promise<Array>} Updated topics
   */
  async reorderTopics(bootcampId, orderData) {
    const updatedTopics = await this.bootcampRepository.reorderTopics(bootcampId, orderData);
    return updatedTopics.map((topic) => this.enhanceTopicObject(topic));
  }

  /**
   * Get topic statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Enhanced topic statistics
   */
  async getTopicStats(bootcampId) {
    const stats = await this.bootcampRepository.getTopicStats(bootcampId);

    return {
      ...stats,
      completion_rate: stats.total_topics > 0 ? Math.round((stats.topics_with_descriptions / stats.total_topics) * 100) : 0,
      session_distribution: this.getSessionDistribution(stats),
      curriculum_depth: this.getCurriculumDepth(stats),
      learning_hours: this.estimateLearningHours(stats.total_sessions),
    };
  }

  // ==================== SESSION METHODS ====================

  /**
   * Get all sessions for topic
   * @param {number} topicId - Topic ID
   * @returns {Promise<Array>} Enhanced sessions array
   */
  async getAllSessionsByTopicId(topicId) {
    const sessions = await this.bootcampRepository.findSessionsByTopicId(topicId);
    return sessions.map((session) => this.enhanceSessionObject(session));
  }

  /**
   * Get all sessions for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Enhanced sessions array
   */
  async getAllSessionsByBootcampId(bootcampId) {
    const sessions = await this.bootcampRepository.findSessionsByBootcampId(bootcampId);
    return sessions.map((session) => this.enhanceSessionObject(session));
  }

  /**
   * Create session for topic
   * @param {Object} data - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(data) {
    // Validate session data
    this.validateSessionData(data);

    const session = await this.bootcampRepository.createSession(data);
    return this.enhanceSessionObject(session);
  }

  /**
   * Update session
   * @param {number} id - Session ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated session
   */
  async updateSession(id, data) {
    // Validate data if provided
    if (data.title) {
      this.validateSessionData(data);
    }

    const session = await this.bootcampRepository.updateSession(id, data);
    return this.enhanceSessionObject(session);
  }

  /**
   * Delete session
   * @param {number} id - Session ID
   * @returns {Promise<Object>} Deleted session
   */
  async deleteSession(id) {
    return await this.bootcampRepository.deleteSession(id);
  }

  /**
   * Reorder sessions in topic
   * @param {number} topicId - Topic ID
   * @param {Array} orderData - Array containing {id, session_order}
   * @returns {Promise<Array>} Updated sessions
   */
  async reorderSessions(topicId, orderData) {
    const updatedSessions = await this.bootcampRepository.reorderSessions(topicId, orderData);
    return updatedSessions.map((session) => this.enhanceSessionObject(session));
  }

  /**
   * Get session statistics for topic
   * @param {number} topicId - Topic ID
   * @returns {Promise<Object>} Enhanced session statistics
   */
  async getSessionStats(topicId) {
    const stats = await this.bootcampRepository.getSessionStats(topicId);
    const sessions = await this.bootcampRepository.findSessionsByTopicId(topicId);

    return {
      ...stats,
      estimated_total_hours: this.estimateTotalHours(stats.total_sessions),
      completion_timeline: this.getCompletionTimeline(stats.total_sessions),
      session_types: this.analyzeSessionTypes(sessions),
      learning_progression: this.getLearningProgression(stats.total_sessions),
    };
  }

  // ==================== INSTRUCTOR ASSIGNMENT METHODS ====================

  /**
   * Add instructor to bootcamp
   * @param {Object} data - Bootcamp instructor data
   * @returns {Promise<Object>} Created bootcamp instructor
   */
  async addInstructorToBootcamp(data) {
    return await this.bootcampRepository.addInstructorToBootcamp(data);
  }

  /**
   * Remove instructor from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<Object>} Deleted bootcamp instructor
   */
  async removeInstructorFromBootcamp(bootcampId, instructorId) {
    return await this.bootcampRepository.removeInstructorFromBootcamp(bootcampId, instructorId);
  }

  /**
   * Get all instructors for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Array instructor with details
   */
  async getInstructorsByBootcampId(bootcampId) {
    return await this.bootcampRepository.findInstructorsByBootcampId(bootcampId);
  }

  /**
   * Get all bootcamps for instructor
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<Array>} Array bootcamp with details
   */
  async getBootcampsByInstructorId(instructorId) {
    return await this.bootcampRepository.findBootcampsByInstructorId(instructorId);
  }

  /**
   * Batch assign instructors to bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} instructorIds - Array of instructor IDs
   * @returns {Promise<Array>} Array of created bootcamp instructors
   */
  async batchAssignInstructors(bootcampId, instructorIds) {
    return await this.bootcampRepository.batchAssignInstructors(bootcampId, instructorIds);
  }

  /**
   * Batch remove instructors from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} instructorIds - Array of instructor IDs
   * @returns {Promise<number>} Number of deleted assignments
   */
  async batchRemoveInstructors(bootcampId, instructorIds) {
    return await this.bootcampRepository.batchRemoveInstructors(bootcampId, instructorIds);
  }

  /**
   * Reorder instructors in bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {instructor_id, instructor_order}
   * @returns {Promise<Array>} Updated bootcamp instructors
   */
  async reorderInstructors(bootcampId, orderData) {
    return await this.bootcampRepository.reorderInstructors(bootcampId, orderData);
  }

  // ==================== ENHANCEMENT METHODS ====================

  /**
   * Enhance bootcamp object with computed fields
   * @private
   * @param {Object} bootcamp - Raw bootcamp data
   * @returns {Object} Enhanced bootcamp
   */
  enhanceBootcamp(bootcamp) {
    return {
      ...bootcamp,
      // Add computed fields
      isPopular: bootcamp.rating >= 4.5 && bootcamp.rating_count >= 10,
      isPremium: bootcamp.pricing?.some((p) => p.original_price > 1000000), // 1M IDR
      enrollmentCount: bootcamp._count?.enrollments || 0,
      formattedPricing: bootcamp.pricing?.map((p) => ({
        ...p,
        discount_percentage: p.original_price > 0 ? Math.round(((p.original_price - p.discount_price) / p.original_price) * 100) : 0,
        formatted_original_price: this.formatCurrency(p.original_price),
        formatted_discount_price: this.formatCurrency(p.discount_price),
      })),
      instructorCount: bootcamp.instructors?.length || 0,
      topicCount: bootcamp.topics?.length || 0,
      sessionCount: bootcamp.topics?.reduce((sum, topic) => sum + (topic.sessions?.length || 0), 0) || 0,
    };
  }

  /**
   * Enhance bootcamp details with additional computed fields
   * @private
   * @param {Object} bootcamp - Raw bootcamp data
   * @returns {Object} Enhanced bootcamp details
   */
  enhanceBootcampDetails(bootcamp) {
    const enhanced = this.enhanceBootcamp(bootcamp);

    return {
      ...enhanced,
      // Additional detail-specific enhancements
      estimatedDuration: this.calculateEstimatedDuration(bootcamp.topics),
      difficultyLevel: this.calculateDifficultyLevel(bootcamp),
      averageRating: bootcamp.rating || 0,
      completionRate: this.calculateCompletionRate(bootcamp.enrollments),
    };
  }

  /**
   * Enhance FAQ object with computed fields
   * @private
   * @param {Object} faq - Raw FAQ object
   * @returns {Object} Enhanced FAQ object
   */
  enhanceFaqObject(faq) {
    return {
      ...faq,
      question_length: faq.question.length,
      answer_length: faq.answer.length,
      question_words: faq.question.split(' ').length,
      answer_words: faq.answer.split(' ').length,
      reading_time: this.calculateReadingTime(faq.answer),
      faq_category: this.categorizeFaq(faq.question),
      priority_level: this.getFaqPriorityLevel(faq.question),
      short_answer: this.getShortAnswer(faq.answer),
      question_type: this.getQuestionType(faq.question),
      difficulty_level: this.getFaqDifficultyLevel(faq.answer),
      helpful_indicators: this.getHelpfulIndicators(faq),
      created_at_formatted: this.formatDate(faq.created_at),
      search_keywords: this.extractSearchKeywords(faq.question, faq.answer),
    };
  }

  /**
   * Enhance feature object with computed fields
   * @private
   * @param {Object} feature - Raw feature object
   * @returns {Object} Enhanced feature object
   */
  enhanceFeatureObject(feature) {
    return {
      ...feature,
      has_icon: Boolean(feature.icon),
      has_description: Boolean(feature.description),
      description_length: feature.description ? feature.description.length : 0,
      icon_display: feature.icon ? `<i class="${feature.icon}"></i>` : '📋',
      feature_type: this.getFeatureType(feature.title),
      completeness: this.calculateFeatureCompleteness(feature),
      display_order: `#${feature.feature_order}`,
      short_description: this.getShortDescription(feature.description),
    };
  }

  /**
   * Enhance pricing object with computed fields
   * @private
   * @param {Object} pricing - Raw pricing object
   * @returns {Object} Enhanced pricing object
   */
  enhancePricingObject(pricing) {
    const finalPrice = pricing.discount_price || pricing.original_price;
    const hasDiscount = pricing.discount_price && pricing.discount_price < pricing.original_price;

    return {
      ...pricing,
      final_price: finalPrice,
      has_discount: hasDiscount,
      discount_amount: hasDiscount ? pricing.original_price - pricing.discount_price : 0,
      discount_percentage: hasDiscount ? Math.round(((pricing.original_price - pricing.discount_price) / pricing.original_price) * 100) : 0,
      original_price_formatted: this.formatPrice(pricing.original_price),
      discount_price_formatted: pricing.discount_price ? this.formatPrice(pricing.discount_price) : null,
      final_price_formatted: this.formatPrice(finalPrice),
      discount_amount_formatted: hasDiscount ? this.formatPrice(pricing.original_price - pricing.discount_price) : null,
      tier_badge: this.getTierBadge(pricing.tier_order),
      price_display: hasDiscount
        ? `${this.formatPrice(pricing.discount_price)} ${this.formatPrice(pricing.original_price)}`
        : this.formatPrice(pricing.original_price),
    };
  }

  /**
   * Enhance topic object with computed fields
   * @private
   * @param {Object} topic - Raw topic object
   * @returns {Object} Enhanced topic object
   */
  enhanceTopicObject(topic) {
    const sessionCount = topic.sessions ? topic.sessions.length : 0;

    return {
      ...topic,
      has_description: Boolean(topic.description),
      description_length: topic.description ? topic.description.length : 0,
      session_count: sessionCount,
      estimated_hours: this.estimateTopicHours(sessionCount),
      completeness: this.calculateTopicCompleteness(topic),
      display_order: `Topic ${topic.topic_order}`,
      short_description: this.getShortDescription(topic.description),
      topic_type: this.getTopicType(topic.title),
      difficulty_level: this.getTopicDifficultyLevel(topic.topic_order),
      progress_indicator: this.getProgressIndicator(topic.topic_order),
      sessions: topic.sessions
        ? topic.sessions.map((session) => ({
            ...session,
            display_order: `${topic.topic_order}.${session.session_order}`,
            session_type: this.getSessionType(session.title),
          }))
        : [],
    };
  }

  /**
   * Enhance session object with computed fields
   * @private
   * @param {Object} session - Raw session object
   * @returns {Object} Enhanced session object
   */
  enhanceSessionObject(session) {
    return {
      ...session,
      display_order: `Session ${session.session_order}`,
      estimated_duration: this.estimateSessionDuration(session.title),
      session_type: this.getSessionType(session.title),
      difficulty_level: this.getSessionDifficultyLevel(session.session_order),
      learning_objective: this.generateLearningObjective(session.title),
      progress_indicator: this.getProgressIndicator(session.session_order),
      session_icon: this.getSessionIcon(session.title),
      title_length: session.title.length,
      topic_info: session.topic
        ? {
            id: session.topic.id,
            title: session.topic.title,
            topic_order: session.topic.topic_order,
            full_path: `Topic ${session.topic.topic_order}.${session.session_order}`,
          }
        : null,
    };
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate bootcamp data
   * @private
   * @param {Object} data - Bootcamp data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @throws {Error} If validation fails
   */
  async validateBootcampData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.title) {
      errors.push('Title wajib diisi');
    }

    if (data.title && data.title.length < 3) {
      errors.push('Title minimal 3 karakter');
    }

    if (data.title && data.title.length > 255) {
      errors.push('Title maksimal 255 karakter');
    }

    if (data.description && data.description.length < 10) {
      errors.push('Deskripsi minimal 10 karakter');
    }

    if (data.path_slug) {
      this.validateSlug(data.path_slug);
    }

    // Validate status
    if (data.status && !['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(data.status)) {
      errors.push('Status harus DRAFT, ACTIVE, atau ARCHIVED');
    }

    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.statusCode = 400;
      throw error;
    }
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
    if (data.question !== undefined && !data.question.trim()) {
      throw new Error('Pertanyaan FAQ tidak boleh kosong');
    }

    if (data.answer !== undefined && !data.answer.trim()) {
      throw new Error('Jawaban FAQ tidak boleh kosong');
    }

    if (data.question && data.question.length > 500) {
      throw new Error('Pertanyaan FAQ maksimal 500 karakter');
    }

    if (data.answer && data.answer.length > 2000) {
      throw new Error('Jawaban FAQ maksimal 2000 karakter');
    }
  }

  /**
   * Validate feature data
   * @private
   * @param {Object} data - Feature data
   * @throws {Error} If validation fails
   */
  validateFeatureData(data) {
    if (data.title !== undefined && !data.title.trim()) {
      throw new Error('Title feature tidak boleh kosong');
    }

    if (data.title && data.title.length > 255) {
      throw new Error('Title feature maksimal 255 karakter');
    }

    if (data.feature_order !== undefined && data.feature_order <= 0) {
      throw new Error('Feature order harus lebih dari 0');
    }
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

    if (data.tier_order !== undefined && data.tier_order <= 0) {
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
   * Generate unique slug from title
   * @private
   * @param {string} title - Bootcamp title
   * @returns {Promise<string>} Unique slug
   */
  async generateUniqueSlug(title) {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let slug = baseSlug;
    let counter = 1;

    while (await this.bootcampRepository.slugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Validate slug format
   * @private
   * @param {string} slug - Slug to validate
   * @throws {Error} If slug is invalid
   */
  validateSlug(slug) {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      const error = new Error('Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung');
      error.statusCode = 400;
      throw error;
    }

    if (slug.length < 3 || slug.length > 100) {
      const error = new Error('Slug harus antara 3-100 karakter');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Format currency to IDR
   * @private
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format price to IDR
   * @private
   * @param {number} price - Price in integer
   * @returns {string} Formatted price
   */
  formatPrice(price) {
    if (!price) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Format date to Indonesian
   * @private
   * @param {Date} date - Date object
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calculate estimated duration from topics and sessions
   * @private
   * @param {Array} topics - Bootcamp topics
   * @returns {string} Estimated duration
   */
  calculateEstimatedDuration(topics) {
    if (!topics || topics.length === 0) return '0 jam';

    const totalSessions = topics.reduce((sum, topic) => sum + (topic.sessions?.length || 0), 0);
    const hours = totalSessions * 2; // Assuming 2 hours per session

    if (hours >= 40) {
      const weeks = Math.ceil(hours / 40);
      return `${weeks} ${weeks === 1 ? 'minggu' : 'minggu'}`;
    }

    return `${hours} jam`;
  }

  /**
   * Calculate difficulty level based on topics and duration
   * @private
   * @param {Object} bootcamp - Bootcamp data
   * @returns {string} Difficulty level
   */
  calculateDifficultyLevel(bootcamp) {
    const topicCount = bootcamp.topics?.length || 0;
    const sessionCount = bootcamp.topics?.reduce((sum, topic) => sum + (topic.sessions?.length || 0), 0) || 0;

    if (sessionCount < 10) return 'Pemula';
    if (sessionCount < 25) return 'Menengah';
    return 'Lanjutan';
  }

  /**
   * Calculate completion rate
   * @private
   * @param {Array} enrollments - Bootcamp enrollments
   * @returns {number} Completion rate percentage
   */
  calculateCompletionRate(enrollments) {
    if (!enrollments || enrollments.length === 0) return 0;

    const completed = enrollments.filter((e) => e.enrollment_status === 'COMPLETED').length;
    return Math.round((completed / enrollments.length) * 100);
  }

  /**
   * Calculate reading time
   * @private
   * @param {string} text - Text to be read
   * @returns {number} Reading time in minutes
   */
  calculateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Categorize FAQ based on question
   * @private
   * @param {string} question - FAQ question
   * @returns {string} FAQ category
   */
  categorizeFaq(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('biaya') || lowerQuestion.includes('harga') || lowerQuestion.includes('gratis')) {
      return 'Biaya & Pembayaran';
    } else if (lowerQuestion.includes('jadwal') || lowerQuestion.includes('waktu') || lowerQuestion.includes('kapan')) {
      return 'Jadwal & Waktu';
    } else if (lowerQuestion.includes('sertifikat') || lowerQuestion.includes('certificate')) {
      return 'Sertifikat';
    } else if (lowerQuestion.includes('syarat') || lowerQuestion.includes('requirement')) {
      return 'Persyaratan';
    } else if (lowerQuestion.includes('materi') || lowerQuestion.includes('kurikulum')) {
      return 'Materi & Kurikulum';
    } else if (lowerQuestion.includes('mentor') || lowerQuestion.includes('instructor')) {
      return 'Mentor & Instruktur';
    } else if (lowerQuestion.includes('cara') || lowerQuestion.includes('bagaimana')) {
      return 'Cara & Panduan';
    } else if (lowerQuestion.includes('online') || lowerQuestion.includes('platform')) {
      return 'Platform & Akses';
    } else {
      return 'Umum';
    }
  }

  /**
   * Get FAQ priority level
   * @private
   * @param {string} question - FAQ question
   * @returns {string} Priority level
   */
  getFaqPriorityLevel(question) {
    const highPriorityKeywords = ['biaya', 'harga', 'jadwal', 'sertifikat', 'syarat'];
    const mediumPriorityKeywords = ['cara', 'bagaimana', 'kapan', 'dimana'];

    const lowerQuestion = question.toLowerCase();

    if (highPriorityKeywords.some((keyword) => lowerQuestion.includes(keyword))) {
      return 'Tinggi';
    } else if (mediumPriorityKeywords.some((keyword) => lowerQuestion.includes(keyword))) {
      return 'Sedang';
    } else {
      return 'Rendah';
    }
  }

  /**
   * Get question type
   * @private
   * @param {string} question - FAQ question
   * @returns {string} Question type
   */
  getQuestionType(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.startsWith('apa') || lowerQuestion.includes('apa itu')) {
      return 'Definisi';
    } else if (lowerQuestion.startsWith('bagaimana') || lowerQuestion.includes('cara')) {
      return 'Panduan';
    } else if (lowerQuestion.startsWith('kapan') || lowerQuestion.includes('waktu')) {
      return 'Waktu';
    } else if (lowerQuestion.startsWith('dimana') || lowerQuestion.includes('tempat')) {
      return 'Lokasi';
    } else if (lowerQuestion.startsWith('berapa') || lowerQuestion.includes('jumlah')) {
      return 'Kuantitas';
    } else if (lowerQuestion.startsWith('mengapa') || lowerQuestion.includes('kenapa')) {
      return 'Alasan';
    } else {
      return 'Informasi';
    }
  }

  /**
   * Get FAQ difficulty level
   * @private
   * @param {string} answer - FAQ answer
   * @returns {string} Difficulty level
   */
  getFaqDifficultyLevel(answer) {
    const wordCount = answer.split(' ').length;

    if (wordCount <= 20) return 'Mudah';
    if (wordCount <= 50) return 'Sedang';
    return 'Kompleks';
  }

  /**
   * Get short answer
   * @private
   * @param {string} answer - Full answer
   * @returns {string} Short answer
   */
  getShortAnswer(answer) {
    return answer.length > 100 ? answer.substring(0, 100) + '...' : answer;
  }

  /**
   * Get short description
   * @private
   * @param {string} description - Full description
   * @returns {string} Short description
   */
  getShortDescription(description) {
    if (!description) return '';
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }

  /**
   * Get helpful indicators
   * @private
   * @param {Object} faq - FAQ object
   * @returns {Object} Helpful indicators
   */
  getHelpfulIndicators(faq) {
    return {
      has_examples: faq.answer.toLowerCase().includes('contoh'),
      has_links: faq.answer.includes('http'),
      has_steps: faq.answer.includes('1.') || faq.answer.includes('langkah'),
      is_detailed: faq.answer.split(' ').length > 30,
    };
  }

  /**
   * Extract search keywords
   * @private
   * @param {string} question - Question text
   * @param {string} answer - Answer text
   * @returns {Array} Search keywords
   */
  extractSearchKeywords(question, answer) {
    const text = `${question} ${answer}`.toLowerCase();
    const stopWords = ['dan', 'atau', 'yang', 'untuk', 'dengan', 'dari', 'ke', 'pada', 'di', 'dalam'];

    return text
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Get feature type based on title
   * @private
   * @param {string} title - Feature title
   * @returns {string} Feature type
   */
  getFeatureType(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('sertifikat') || lowerTitle.includes('certificate')) {
      return 'Sertifikat';
    } else if (lowerTitle.includes('mentor') || lowerTitle.includes('bimbingan')) {
      return 'Mentoring';
    } else if (lowerTitle.includes('project') || lowerTitle.includes('portfolio')) {
      return 'Project';
    } else if (lowerTitle.includes('live') || lowerTitle.includes('session')) {
      return 'Live Session';
    } else if (lowerTitle.includes('akses') || lowerTitle.includes('access')) {
      return 'Akses';
    } else if (lowerTitle.includes('materi') || lowerTitle.includes('content')) {
      return 'Materi';
    } else {
      return 'Umum';
    }
  }

  /**
   * Calculate feature completeness score
   * @private
   * @param {Object} feature - Feature object
   * @returns {number} Completeness score (0-100)
   */
  calculateFeatureCompleteness(feature) {
    let score = 0;

    if (feature.title) score += 30;
    if (feature.description) score += 50;
    if (feature.icon) score += 20;

    return score;
  }

  /**
   * Get tier badge
   * @private
   * @param {number} tierOrder - Tier order
   * @returns {string} Tier badge
   */
  getTierBadge(tierOrder) {
    const badges = {
      1: 'Basic',
      2: 'Standard',
      3: 'Premium',
      4: 'Ultimate',
    };
    return badges[tierOrder] || `Tier ${tierOrder}`;
  }

  /**
   * Get topic type based on title
   * @private
   * @param {string} title - Topic title
   * @returns {string} Topic type
   */
  getTopicType(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('pengenalan') || lowerTitle.includes('introduction')) {
      return 'Pengenalan';
    } else if (lowerTitle.includes('dasar') || lowerTitle.includes('basic')) {
      return 'Dasar';
    } else if (lowerTitle.includes('lanjutan') || lowerTitle.includes('advanced')) {
      return 'Lanjutan';
    } else if (lowerTitle.includes('project') || lowerTitle.includes('praktek')) {
      return 'Praktik';
    } else if (lowerTitle.includes('studi kasus') || lowerTitle.includes('case study')) {
      return 'Studi Kasus';
    } else {
      return 'Materi';
    }
  }

  /**
   * Get topic difficulty level based on order
   * @private
   * @param {number} topicOrder - Topic order
   * @returns {string} Difficulty level
   */
  getTopicDifficultyLevel(topicOrder) {
    if (topicOrder <= 2) return 'Pemula';
    if (topicOrder <= 5) return 'Menengah';
    return 'Lanjutan';
  }

  /**
   * Calculate topic completeness score
   * @private
   * @param {Object} topic - Topic object
   * @returns {number} Completeness score (0-100)
   */
  calculateTopicCompleteness(topic) {
    let score = 0;

    if (topic.title) score += 40;
    if (topic.description) score += 40;
    if (topic.sessions && topic.sessions.length > 0) score += 20;

    return score;
  }

  /**
   * Estimate topic hours
   * @private
   * @param {number} sessionCount - Session count
   * @returns {number} Estimated hours
   */
  estimateTopicHours(sessionCount) {
    return sessionCount * 1.5; // 1.5 hours per session
  }

  /**
   * Get session type based on title
   * @private
   * @param {string} title - Session title
   * @returns {string} Session type
   */
  getSessionType(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('pengenalan') || lowerTitle.includes('intro')) {
      return 'Pengenalan';
    } else if (lowerTitle.includes('teori') || lowerTitle.includes('konsep')) {
      return 'Teori';
    } else if (lowerTitle.includes('praktek') || lowerTitle.includes('latihan')) {
      return 'Praktik';
    } else if (lowerTitle.includes('studi kasus') || lowerTitle.includes('case study')) {
      return 'Studi Kasus';
    } else if (lowerTitle.includes('project') || lowerTitle.includes('tugas')) {
      return 'Project';
    } else if (lowerTitle.includes('quiz') || lowerTitle.includes('evaluasi')) {
      return 'Evaluasi';
    } else if (lowerTitle.includes('diskusi') || lowerTitle.includes('sharing')) {
      return 'Diskusi';
    } else {
      return 'Materi';
    }
  }

  /**
   * Get session difficulty level based on order
   * @private
   * @param {number} sessionOrder - Session order
   * @returns {string} Difficulty level
   */
  getSessionDifficultyLevel(sessionOrder) {
    if (sessionOrder <= 2) return 'Pemula';
    if (sessionOrder <= 5) return 'Menengah';
    return 'Lanjutan';
  }

  /**
   * Estimate session duration
   * @private
   * @param {string} title - Session title
   * @returns {number} Estimated duration in minutes
   */
  estimateSessionDuration(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('pengenalan') || lowerTitle.includes('intro')) {
      return 45;
    } else if (lowerTitle.includes('teori') || lowerTitle.includes('konsep')) {
      return 60;
    } else if (lowerTitle.includes('praktek') || lowerTitle.includes('latihan')) {
      return 90;
    } else if (lowerTitle.includes('project') || lowerTitle.includes('tugas')) {
      return 120;
    } else if (lowerTitle.includes('quiz') || lowerTitle.includes('evaluasi')) {
      return 30;
    } else {
      return 60;
    }
  }

  /**
   * Generate learning objective
   * @private
   * @param {string} title - Session title
   * @returns {string} Learning objective
   */
  generateLearningObjective(title) {
    const type = this.getSessionType(title);

    const objectives = {
      Pengenalan: `Memahami konsep dasar dari ${title}`,
      Teori: `Menguasai teori dan konsep ${title}`,
      Praktik: `Mampu mengimplementasikan ${title}`,
      'Studi Kasus': `Menganalisis dan menyelesaikan kasus ${title}`,
      Project: `Membuat project terkait ${title}`,
      Evaluasi: `Mengevaluasi pemahaman tentang ${title}`,
      Diskusi: `Berdiskusi dan berbagi pengalaman tentang ${title}`,
      Materi: `Mempelajari materi ${title}`,
    };

    return objectives[type] || `Mempelajari ${title}`;
  }

  /**
   * Get progress indicator
   * @private
   * @param {number} order - Order number
   * @returns {string} Progress indicator
   */
  getProgressIndicator(order) {
    const indicators = ['🟢', '🔵', '🟡', '🟠', '🔴', '🟣'];
    const index = Math.min(order - 1, indicators.length - 1);
    return indicators[index];
  }

  /**
   * Get session icon
   * @private
   * @param {string} title - Session title
   * @returns {string} Session icon
   */
  getSessionIcon(title) {
    const type = this.getSessionType(title);

    const icons = {
      Pengenalan: '👋',
      Teori: '📚',
      Praktik: '💻',
      'Studi Kasus': '🔍',
      Project: '🚀',
      Evaluasi: '✅',
      Diskusi: '💬',
      Materi: '📖',
    };

    return icons[type] || '📋';
  }

  /**
   * Calculate readability score
   * @private
   * @param {Object} stats - FAQ statistics
   * @returns {number} Readability score
   */
  calculateReadabilityScore(stats) {
    if (stats.total_faqs === 0) return 0;

    const avgQuestionLength = stats.average_question_length;
    const avgAnswerLength = stats.average_answer_length;

    // Ideal lengths: question 50-100 chars, answer 100-300 chars
    const questionScore = avgQuestionLength >= 50 && avgQuestionLength <= 100 ? 50 : 25;
    const answerScore = avgAnswerLength >= 100 && avgAnswerLength <= 300 ? 50 : 25;

    return questionScore + answerScore;
  }

  /**
   * Assess content quality
   * @private
   * @param {Object} stats - FAQ statistics
   * @returns {string} Content quality
   */
  assessContentQuality(stats) {
    const readabilityScore = this.calculateReadabilityScore(stats);

    if (readabilityScore >= 80) return 'Excellent';
    if (readabilityScore >= 60) return 'Good';
    if (readabilityScore >= 40) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Analyze coverage areas
   * @private
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Coverage areas
   */
  async analyzeCoverageAreas(bootcampId) {
    const faqs = await this.bootcampRepository.findFaqsByBootcampId(bootcampId);
    const categories = {};

    faqs.forEach((faq) => {
      const category = this.categorizeFaq(faq.question);
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Assess user friendliness
   * @private
   * @param {Object} stats - FAQ statistics
   * @returns {string} User friendliness
   */
  assessUserFriendliness(stats) {
    if (stats.total_faqs >= 10) return 'Comprehensive';
    if (stats.total_faqs >= 5) return 'Adequate';
    if (stats.total_faqs >= 1) return 'Basic';
    return 'Incomplete';
  }

  /**
   * Calculate feature quality score
   * @private
   * @param {Object} stats - Feature statistics
   * @returns {number} Quality score (0-100)
   */
  calculateFeatureQualityScore(stats) {
    if (stats.total_features === 0) return 0;

    const descriptionScore = (stats.features_with_descriptions / stats.total_features) * 70;
    const iconScore = (stats.features_with_icons / stats.total_features) * 30;

    return Math.round(descriptionScore + iconScore);
  }

  /**
   * Get session distribution
   * @private
   * @param {Object} stats - Topic statistics
   * @returns {string} Session distribution
   */
  getSessionDistribution(stats) {
    if (stats.total_topics === 0) return 'Tidak ada data';

    const avg = stats.average_sessions_per_topic;
    if (avg < 3) return 'Ringan';
    if (avg < 6) return 'Sedang';
    return 'Intensif';
  }

  /**
   * Get curriculum depth
   * @private
   * @param {Object} stats - Topic statistics
   * @returns {string} Curriculum depth
   */
  getCurriculumDepth(stats) {
    if (stats.total_topics <= 3) return 'Dasar';
    if (stats.total_topics <= 6) return 'Menengah';
    return 'Komprehensif';
  }

  /**
   * Estimate learning hours
   * @private
   * @param {number} totalSessions - Total sessions
   * @returns {number} Estimated learning hours
   */
  estimateLearningHours(totalSessions) {
    return totalSessions * 1.5;
  }

  /**
   * Estimate total hours
   * @private
   * @param {number} sessionCount - Session count
   * @returns {number} Total hours
   */
  estimateTotalHours(sessionCount) {
    return Math.round(((sessionCount * 60) / 60) * 100) / 100; // Convert minutes to hours
  }

  /**
   * Get completion timeline
   * @private
   * @param {number} sessionCount - Session count
   * @returns {string} Timeline completion
   */
  getCompletionTimeline(sessionCount) {
    const days = Math.ceil(sessionCount / 2); // 2 sessions per day
    return `${days} hari`;
  }

  /**
   * Analyze session types
   * @private
   * @param {Array} sessions - Sessions array
   * @returns {Object} Session types analysis
   */
  analyzeSessionTypes(sessions) {
    const types = {};
    sessions.forEach((session) => {
      const type = this.getSessionType(session.title);
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  /**
   * Get learning progression
   * @private
   * @param {number} sessionCount - Session count
   * @returns {string} Learning progression
   */
  getLearningProgression(sessionCount) {
    if (sessionCount <= 3) return 'Dasar';
    if (sessionCount <= 6) return 'Menengah';
    if (sessionCount <= 10) return 'Lanjutan';
    return 'Komprehensif';
  }

  // ==================== PRICING METHODS ====================

  /**
   * Create pricing for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Created pricing
   */
  async createPricing(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampService] createPricing start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const pricing = await this.bootcampRepository.createPricing(bootcampId, data);

      this.logger.info({ pricingId: pricing.id }, '[bootcampService] createPricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createPricing error');
      throw error;
    }
  }

  /**
   * Update pricing for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} pricingId - Pricing ID
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Updated pricing
   */
  async updatePricing(bootcampId, pricingId, data) {
    this.logger.info({ bootcampId, pricingId, data }, '[bootcampService] updatePricing start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const pricing = await this.bootcampRepository.updatePricing(bootcampId, pricingId, data);

      this.logger.info({ pricingId: pricing.id }, '[bootcampService] updatePricing success');
      return pricing;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updatePricing error');
      throw error;
    }
  }

  /**
   * Delete pricing for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} pricingId - Pricing ID
   * @returns {Promise<Object>} Success message
   */
  async deletePricing(bootcampId, pricingId) {
    this.logger.info({ bootcampId, pricingId }, '[bootcampService] deletePricing start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await this.bootcampRepository.deletePricing(bootcampId, pricingId);

      this.logger.info({ pricingId }, '[bootcampService] deletePricing success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deletePricing error');
      throw error;
    }
  }

  // ==================== FEATURES METHODS ====================

  /**
   * Create feature for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Created feature
   */
  async createFeature(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampService] createFeature start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const feature = await this.bootcampRepository.createFeature(bootcampId, data);

      this.logger.info({ featureId: feature.id }, '[bootcampService] createFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createFeature error');
      throw error;
    }
  }

  /**
   * Update feature for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} featureId - Feature ID
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeature(bootcampId, featureId, data) {
    this.logger.info({ bootcampId, featureId, data }, '[bootcampService] updateFeature start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const feature = await this.bootcampRepository.updateFeature(bootcampId, featureId, data);

      this.logger.info({ featureId: feature.id }, '[bootcampService] updateFeature success');
      return feature;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateFeature error');
      throw error;
    }
  }

  /**
   * Delete feature for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} featureId - Feature ID
   * @returns {Promise<Object>} Success message
   */
  async deleteFeature(bootcampId, featureId) {
    this.logger.info({ bootcampId, featureId }, '[bootcampService] deleteFeature start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await this.bootcampRepository.deleteFeature(bootcampId, featureId);

      this.logger.info({ featureId }, '[bootcampService] deleteFeature success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteFeature error');
      throw error;
    }
  }

  // ==================== INSTRUCTORS METHODS ====================

  /**
   * Create instructor for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Object} data - Instructor data
   * @returns {Promise<Object>} Created instructor
   */
  async createInstructor(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampService] createInstructor start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const instructor = await this.bootcampRepository.createInstructor(bootcampId, data);

      this.logger.info({ instructorId: instructor.instructor_id }, '[bootcampService] createInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createInstructor error');
      throw error;
    }
  }

  /**
   * Update instructor for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} instructorId - Instructor ID
   * @param {Object} data - Instructor data
   * @returns {Promise<Object>} Updated instructor
   */
  async updateInstructor(bootcampId, instructorId, data) {
    this.logger.info({ bootcampId, instructorId, data }, '[bootcampService] updateInstructor start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const instructor = await this.bootcampRepository.updateInstructor(bootcampId, instructorId, data);

      this.logger.info({ instructorId: instructor.instructor_id }, '[bootcampService] updateInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateInstructor error');
      throw error;
    }
  }

  /**
   * Delete instructor from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<Object>} Success message
   */
  async deleteInstructor(bootcampId, instructorId) {
    this.logger.info({ bootcampId, instructorId }, '[bootcampService] deleteInstructor start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await this.bootcampRepository.deleteInstructor(bootcampId, instructorId);

      this.logger.info({ instructorId }, '[bootcampService] deleteInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteInstructor error');
      throw error;
    }
  }

  // ==================== TOPICS METHODS ====================

  /**
   * Create topic for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Object} data - Topic data
   * @returns {Promise<Object>} Created topic
   */
  async createTopic(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampService] createTopic start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const topic = await this.bootcampRepository.createTopic(bootcampId, data);

      this.logger.info({ topicId: topic.id }, '[bootcampService] createTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createTopic error');
      throw error;
    }
  }

  /**
   * Update topic for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} topicId - Topic ID
   * @param {Object} data - Topic data
   * @returns {Promise<Object>} Updated topic
   */
  async updateTopic(bootcampId, topicId, data) {
    this.logger.info({ bootcampId, topicId, data }, '[bootcampService] updateTopic start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const topic = await this.bootcampRepository.updateTopic(bootcampId, topicId, data);

      this.logger.info({ topicId: topic.id }, '[bootcampService] updateTopic success');
      return topic;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateTopic error');
      throw error;
    }
  }

  /**
   * Delete topic from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} topicId - Topic ID
   * @returns {Promise<Object>} Success message
   */
  async deleteTopic(bootcampId, topicId) {
    this.logger.info({ bootcampId, topicId }, '[bootcampService] deleteTopic start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await this.bootcampRepository.deleteTopic(bootcampId, topicId);

      this.logger.info({ topicId }, '[bootcampService] deleteTopic success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteTopic error');
      throw error;
    }
  }

  // ==================== TESTIMONIALS METHODS ====================

  /**
   * Create testimonial for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Object} data - Testimonial data
   * @returns {Promise<Object>} Created testimonial
   */
  async createTestimonial(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampService] createTestimonial start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const testimonial = await this.bootcampRepository.createTestimonial(bootcampId, data);

      this.logger.info({ testimonialId: testimonial.id }, '[bootcampService] createTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createTestimonial error');
      throw error;
    }
  }

  /**
   * Update testimonial for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} testimonialId - Testimonial ID
   * @param {Object} data - Testimonial data
   * @returns {Promise<Object>} Updated testimonial
   */
  async updateTestimonial(bootcampId, testimonialId, data) {
    this.logger.info({ bootcampId, testimonialId, data }, '[bootcampService] updateTestimonial start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const testimonial = await this.bootcampRepository.updateTestimonial(bootcampId, testimonialId, data);

      this.logger.info({ testimonialId: testimonial.id }, '[bootcampService] updateTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateTestimonial error');
      throw error;
    }
  }

  /**
   * Delete testimonial from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} testimonialId - Testimonial ID
   * @returns {Promise<Object>} Success message
   */
  async deleteTestimonial(bootcampId, testimonialId) {
    this.logger.info({ bootcampId, testimonialId }, '[bootcampService] deleteTestimonial start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await this.bootcampRepository.deleteTestimonial(bootcampId, testimonialId);

      this.logger.info({ testimonialId }, '[bootcampService] deleteTestimonial success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteTestimonial error');
      throw error;
    }
  }

  // ==================== FAQs METHODS ====================

  /**
   * Create FAQ for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Object} data - FAQ data
   * @returns {Promise<Object>} Created FAQ
   */
  async createFaq(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampService] createFaq start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const faq = await this.bootcampRepository.createFaq(bootcampId, data);

      this.logger.info({ faqId: faq.id }, '[bootcampService] createFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createFaq error');
      throw error;
    }
  }

  /**
   * Update FAQ for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} faqId - FAQ ID
   * @param {Object} data - FAQ data
   * @returns {Promise<Object>} Updated FAQ
   */
  async updateFaq(bootcampId, faqId, data) {
    this.logger.info({ bootcampId, faqId, data }, '[bootcampService] updateFaq start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const faq = await this.bootcampRepository.updateFaq(bootcampId, faqId, data);

      this.logger.info({ faqId: faq.id }, '[bootcampService] updateFaq success');
      return faq;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateFaq error');
      throw error;
    }
  }

  /**
   * Delete FAQ from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} faqId - FAQ ID
   * @returns {Promise<Object>} Success message
   */
  async deleteFaq(bootcampId, faqId) {
    this.logger.info({ bootcampId, faqId }, '[bootcampService] deleteFaq start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        const error = new Error('Bootcamp not found');
        error.statusCode = 404;
        throw error;
      }

      const result = await this.bootcampRepository.deleteFaq(bootcampId, faqId);

      this.logger.info({ faqId }, '[bootcampService] deleteFaq success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteFaq error');
      throw error;
    }
  }

  // ==================== SESSION METHODS ====================

  /**
   * Create session for topic
   */
  async createSession(bootcampId, topicId, data) {
    this.logger.info({ bootcampId, topicId, data }, '[bootcampService] createSession start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        throw new Error('Bootcamp not found');
      }

      // Validate topic exists and belongs to bootcamp
      const topic = await this.bootcampRepository.findTopicById(topicId);
      if (!topic || topic.bootcamp_id !== bootcampId) {
        throw new Error('Topic not found or does not belong to bootcamp');
      }

      const session = await this.bootcampRepository.createSession(bootcampId, topicId, data);
      this.logger.info({ sessionId: session.id }, '[bootcampService] createSession success');
      return session;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] createSession error');
      throw error;
    }
  }

  /**
   * Update session
   */
  async updateSession(bootcampId, topicId, sessionId, data) {
    this.logger.info({ bootcampId, topicId, sessionId, data }, '[bootcampService] updateSession start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        throw new Error('Bootcamp not found');
      }

      // Validate topic exists and belongs to bootcamp
      const topic = await this.bootcampRepository.findTopicById(topicId);
      if (!topic || topic.bootcamp_id !== bootcampId) {
        throw new Error('Topic not found or does not belong to bootcamp');
      }

      // Validate session exists and belongs to topic
      const existingSession = await this.bootcampRepository.findSessionById(sessionId);
      if (!existingSession || existingSession.topic_id !== topicId) {
        throw new Error('Session not found or does not belong to topic');
      }

      const session = await this.bootcampRepository.updateSession(bootcampId, topicId, sessionId, data);
      this.logger.info({ sessionId: session.id }, '[bootcampService] updateSession success');
      return session;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] updateSession error');
      throw error;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(bootcampId, topicId, sessionId) {
    this.logger.info({ bootcampId, topicId, sessionId }, '[bootcampService] deleteSession start');

    try {
      // Validate bootcamp exists
      const bootcamp = await this.bootcampRepository.findById(bootcampId);
      if (!bootcamp) {
        throw new Error('Bootcamp not found');
      }

      // Validate topic exists and belongs to bootcamp
      const topic = await this.bootcampRepository.findTopicById(topicId);
      if (!topic || topic.bootcamp_id !== bootcampId) {
        throw new Error('Topic not found or does not belong to bootcamp');
      }

      // Validate session exists and belongs to topic
      const existingSession = await this.bootcampRepository.findSessionById(sessionId);
      if (!existingSession || existingSession.topic_id !== topicId) {
        throw new Error('Session not found or does not belong to topic');
      }

      const result = await this.bootcampRepository.deleteSession(bootcampId, topicId, sessionId);
      this.logger.info({ sessionId }, '[bootcampService] deleteSession success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[bootcampService] deleteSession error');
      throw error;
    }
  }
}

// Export instance
export const bootcampService = new BootcampService();
