import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * Consolidated Bootcamp Repository
 * Handles all bootcamp-related data access operations
 */
export class BootcampRepository extends BaseRepository {
  constructor() {
    super(prisma.bootcamp);
  }

  // ==================== MAIN BOOTCAMP METHODS ====================

  /**
   * Find bootcamp by slug
   * @param {string} slug - Bootcamp slug
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Bootcamp or null
   */
  async findBySlug(slug, options = {}) {
    const bootcamp = await this.model.findUnique({
      where: { path_slug: slug },
      include: {
        pricing: {
          orderBy: { tier_order: 'asc' },
        },
        features: {
          orderBy: { feature_order: 'asc' },
        },
        topics: {
          orderBy: { topic_order: 'asc' },
          include: {
            sessions: {
              orderBy: { session_order: 'asc' },
            },
          },
        },
        instructors: {
          orderBy: { instructor_order: 'asc' },
          include: {
            instructor: true,
          },
        },
        testimonials: {
          orderBy: { testimonial_order: 'asc' },
        },
        faqs: {
          orderBy: { faq_order: 'asc' },
        },
        ...options.include,
      },
      ...options,
    });

    // Transform instructors to flat structure for easier frontend usage
    if (bootcamp && bootcamp.instructors) {
      bootcamp.instructors = bootcamp.instructors.map((item) => ({
        bootcamp_id: item.bootcamp_id,
        instructor_id: item.instructor_id,
        instructor_order: item.instructor_order,
        name: item.instructor.name,
        job_title: item.instructor.job_title,
        avatar_url: item.instructor.avatar_url,
        description: item.instructor.description,
        created_at: item.instructor.created_at,
        updated_at: item.instructor.updated_at,
      }));
    }

    return bootcamp;
  }

  /**
   * Find bootcamps with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated result with data and meta
   */
  async findWithPagination(options = {}) {
    const { page = 1, limit = 10, category, search, status = 'ACTIVE', minRating, includeRelations = false } = options;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = { status };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    }

    if (minRating) {
      where.rating = { gte: Number(minRating) };
    }

    // Prepare include object
    const include = includeRelations
      ? {
          pricing: {
            orderBy: { tier_order: 'asc' },
          },
          features: {
            orderBy: { feature_order: 'asc' },
          },
          instructors: {
            orderBy: { instructor_order: 'asc' },
            include: { instructor: true },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        }
      : {
          _count: {
            select: {
              enrollments: true,
            },
          },
        };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: Number(limit),
        include,
        orderBy: [{ rating: 'desc' }, { created_at: 'desc' }],
      }),
      this.model.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get bootcamp categories
   * @returns {Promise<Array>} Array of unique categories
   */
  async getCategories() {
    const result = await this.model.findMany({
      where: { status: 'ACTIVE' },
      select: { category: true },
      distinct: ['category'],
    });
    return result.map((item) => item.category).filter(Boolean);
  }

  /**
   * Get featured bootcamps
   * @param {number} limit - Number of bootcamps to return
   * @returns {Promise<Array>} Featured bootcamps
   */
  async getFeatured(limit = 6) {
    return await this.model.findMany({
      where: {
        status: 'ACTIVE',
        rating: { gte: 4.0 },
      },
      take: Number(limit),
      include: {
        pricing: {
          orderBy: { tier_order: 'asc' },
        },
        instructors: {
          orderBy: { instructor_order: 'asc' },
          include: { instructor: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: [{ rating: 'desc' }, { rating_count: 'desc' }],
    });
  }

  /**
   * Check if slug exists
   * @param {string} slug - Bootcamp slug
   * @param {number} excludeId - ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async slugExists(slug, excludeId = null) {
    const where = { path_slug: slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return await this.exists(where);
  }

  /**
   * Update bootcamp rating
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} newRating - New average rating
   * @param {number} ratingCount - Total rating count
   * @returns {Promise<Object>} Updated bootcamp
   */
  async updateRating(bootcampId, newRating, ratingCount) {
    return await this.model.update({
      where: { id: bootcampId },
      data: {
        rating: newRating,
        rating_count: ratingCount,
      },
    });
  }

  /**
   * Get bootcamp statistics
   * @returns {Promise<Object>} Bootcamp statistics
   */
  async getBootcampStatistics() {
    const [total, active, byCategory] = await Promise.all([
      this.model.count(),
      this.model.count({ where: { status: 'ACTIVE' } }),
      this.model.groupBy({
        by: ['category'],
        where: { status: 'ACTIVE' },
        _count: { category: true },
      }),
    ]);

    return {
      total,
      active,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {}),
    };
  }

  // ==================== FAQ METHODS ====================

  /**
   * Get all FAQs for bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @returns {Promise<Array>} Array FAQ
   */
  async findFaqsByBootcampId(bootcampId) {
    return await prisma.bootcampFaq.findMany({
      where: { bootcamp_id: bootcampId },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Create FAQ for bootcamp
   * @param {Object} data - FAQ data
   * @returns {Promise<Object>} Created FAQ
   */
  async createFaq(data) {
    return await prisma.bootcampFaq.create({ data });
  }

  /**
   * Update FAQ
   * @param {number} id - FAQ ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated FAQ
   */
  async updateFaq(id, data) {
    return await prisma.bootcampFaq.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete FAQ
   * @param {number} id - FAQ ID
   * @returns {Promise<Object>} Deleted FAQ
   */
  async deleteFaq(id) {
    return await prisma.bootcampFaq.delete({
      where: { id },
    });
  }

  /**
   * Search FAQs by keyword
   * @param {number} bootcampId - Bootcamp ID
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Matching FAQs
   */
  async searchFaq(bootcampId, keyword) {
    return await prisma.bootcampFaq.findMany({
      where: {
        bootcamp_id: bootcampId,
        OR: [{ question: { contains: keyword, mode: 'insensitive' } }, { answer: { contains: keyword, mode: 'insensitive' } }],
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Get FAQ statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} FAQ statistics
   */
  async getFaqStats(bootcampId) {
    const faqs = await this.findFaqsByBootcampId(bootcampId);

    if (faqs.length === 0) {
      return {
        total_faqs: 0,
        average_question_length: 0,
        average_answer_length: 0,
        longest_question: null,
        longest_answer: null,
      };
    }

    const questionLengths = faqs.map((faq) => faq.question.length);
    const answerLengths = faqs.map((faq) => faq.answer.length);

    const avgQuestionLength = Math.round(questionLengths.reduce((sum, length) => sum + length, 0) / faqs.length);
    const avgAnswerLength = Math.round(answerLengths.reduce((sum, length) => sum + length, 0) / faqs.length);

    const longestQuestion = faqs.find((faq) => faq.question.length === Math.max(...questionLengths));
    const longestAnswer = faqs.find((faq) => faq.answer.length === Math.max(...answerLengths));

    return {
      total_faqs: faqs.length,
      average_question_length: avgQuestionLength,
      average_answer_length: avgAnswerLength,
      longest_question: longestQuestion ? longestQuestion.question : null,
      longest_answer: longestAnswer ? longestAnswer.answer : null,
    };
  }

  /**
   * Batch create FAQs for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} faqsData - Array of FAQ data
   * @returns {Promise<Array>} Created FAQs
   */
  async createBatchFaqs(bootcampId, faqsData) {
    const createPromises = faqsData.map((faqData) => {
      const data = {
        ...faqData,
        bootcamp_id: bootcampId,
      };
      return this.createFaq(data);
    });

    return Promise.all(createPromises);
  }

  // ==================== FEATURE METHODS ====================

  /**
   * Get all features for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Array features
   */
  async findFeaturesByBootcampId(bootcampId) {
    return await prisma.bootcampFeature.findMany({
      where: { bootcamp_id: bootcampId },
      orderBy: { feature_order: 'asc' },
    });
  }

  /**
   * Create feature for bootcamp
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Created feature
   */
  async createFeature(data) {
    // Auto-generate feature_order if not provided
    if (!data.feature_order) {
      const maxFeature = await prisma.bootcampFeature.findFirst({
        where: { bootcamp_id: data.bootcamp_id },
        orderBy: { feature_order: 'desc' },
      });
      data.feature_order = maxFeature ? maxFeature.feature_order + 1 : 1;
    }

    return await prisma.bootcampFeature.create({ data });
  }

  /**
   * Update feature
   * @param {number} id - Feature ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeature(id, data) {
    return await prisma.bootcampFeature.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete feature
   * @param {number} id - Feature ID
   * @returns {Promise<Object>} Deleted feature
   */
  async deleteFeature(id) {
    return await prisma.bootcampFeature.delete({
      where: { id },
    });
  }

  /**
   * Reorder features for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {id, feature_order}
   * @returns {Promise<Array>} Updated features
   */
  async reorderFeatures(bootcampId, orderData) {
    const updatePromises = orderData.map(({ id, feature_order }) => this.updateFeature(id, { feature_order }));
    return Promise.all(updatePromises);
  }

  /**
   * Get feature statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Feature statistics
   */
  async getFeatureStats(bootcampId) {
    const features = await this.findFeaturesByBootcampId(bootcampId);

    return {
      total_features: features.length,
      features_with_icons: features.filter((f) => f.icon).length,
      features_with_descriptions: features.filter((f) => f.description).length,
    };
  }

  // ==================== PRICING METHODS ====================

  /**
   * Get all pricing tiers for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Array pricing tiers
   */
  async findPricingsByBootcampId(bootcampId) {
    return await prisma.bootcampPricing.findMany({
      where: { bootcamp_id: bootcampId },
      orderBy: { tier_order: 'asc' },
    });
  }

  /**
   * Create pricing tier for bootcamp
   * @param {Object} data - Pricing data
   * @returns {Promise<Object>} Created pricing tier
   */
  async createPricing(data) {
    // Auto-generate tier_order if not provided
    if (!data.tier_order) {
      const maxTier = await prisma.bootcampPricing.findFirst({
        where: { bootcamp_id: data.bootcamp_id },
        orderBy: { tier_order: 'desc' },
      });
      data.tier_order = maxTier ? maxTier.tier_order + 1 : 1;
    }

    return await prisma.bootcampPricing.create({ data });
  }

  /**
   * Update pricing tier
   * @param {number} id - Pricing ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated pricing tier
   */
  async updatePricing(id, data) {
    return await prisma.bootcampPricing.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete pricing tier
   * @param {number} id - Pricing ID
   * @returns {Promise<Object>} Deleted pricing tier
   */
  async deletePricing(id) {
    return await prisma.bootcampPricing.delete({
      where: { id },
    });
  }

  /**
   * Reorder pricing tiers for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {id, tier_order}
   * @returns {Promise<Array>} Updated pricing tiers
   */
  async reorderPricingTiers(bootcampId, orderData) {
    const updatePromises = orderData.map(({ id, tier_order }) => this.updatePricing(id, { tier_order }));
    return Promise.all(updatePromises);
  }

  /**
   * Get pricing statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Pricing statistics
   */
  async getPricingStats(bootcampId) {
    const pricings = await this.findPricingsByBootcampId(bootcampId);

    if (pricings.length === 0) {
      return {
        total_tiers: 0,
        min_price: 0,
        max_price: 0,
        average_discount: 0,
      };
    }

    const minPrice = Math.min(...pricings.map((p) => p.discount_price || p.original_price));
    const maxPrice = Math.max(...pricings.map((p) => p.discount_price || p.original_price));
    const totalDiscount = pricings.reduce((sum, p) => {
      const discountPercent = p.discount_price ? ((p.original_price - p.discount_price) / p.original_price) * 100 : 0;
      return sum + discountPercent;
    }, 0);

    return {
      total_tiers: pricings.length,
      min_price: minPrice,
      max_price: maxPrice,
      average_discount: Math.round(totalDiscount / pricings.length),
    };
  }

  // ==================== TOPIC METHODS ====================

  /**
   * Get all topics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {boolean} includeSessions - Include sessions in topic
   * @returns {Promise<Array>} Array topics
   */
  async findTopicsByBootcampId(bootcampId, includeSessions = false) {
    const includeOption = includeSessions
      ? {
          include: {
            sessions: {
              orderBy: { session_order: 'asc' },
            },
          },
        }
      : {};

    return await prisma.bootcampTopic.findMany({
      where: { bootcamp_id: bootcampId },
      orderBy: { topic_order: 'asc' },
      ...includeOption,
    });
  }

  /**
   * Create topic for bootcamp
   * @param {Object} data - Topic data
   * @returns {Promise<Object>} Created topic
   */
  async createTopic(data) {
    // Auto-generate topic_order if not provided
    if (!data.topic_order) {
      const maxTopic = await prisma.bootcampTopic.findFirst({
        where: { bootcamp_id: data.bootcamp_id },
        orderBy: { topic_order: 'desc' },
      });
      data.topic_order = maxTopic ? maxTopic.topic_order + 1 : 1;
    }

    return await prisma.bootcampTopic.create({ data });
  }

  /**
   * Update topic
   * @param {number} id - Topic ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated topic
   */
  async updateTopic(id, data) {
    return await prisma.bootcampTopic.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete topic and all related sessions
   * @param {number} id - Topic ID
   * @returns {Promise<Object>} Deleted topic
   */
  async deleteTopic(id) {
    return await prisma.bootcampTopic.delete({
      where: { id },
    });
  }

  /**
   * Reorder topics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {id, topic_order}
   * @returns {Promise<Array>} Updated topics
   */
  async reorderTopics(bootcampId, orderData) {
    const updatePromises = orderData.map(({ id, topic_order }) => this.updateTopic(id, { topic_order }));
    return Promise.all(updatePromises);
  }

  /**
   * Get topic statistics for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Object>} Topic statistics
   */
  async getTopicStats(bootcampId) {
    const topics = await this.findTopicsByBootcampId(bootcampId, true);

    const totalSessions = topics.reduce((sum, topic) => sum + (topic.sessions ? topic.sessions.length : 0), 0);

    return {
      total_topics: topics.length,
      total_sessions: totalSessions,
      topics_with_descriptions: topics.filter((t) => t.description).length,
      average_sessions_per_topic: topics.length > 0 ? Math.round(totalSessions / topics.length) : 0,
    };
  }

  // ==================== SESSION METHODS ====================

  /**
   * Get all sessions for topic
   * @param {number} topicId - Topic ID
   * @returns {Promise<Array>} Array sessions
   */
  async findSessionsByTopicId(topicId) {
    return await prisma.bootcampSession.findMany({
      where: { topic_id: topicId },
      orderBy: { session_order: 'asc' },
    });
  }

  /**
   * Get all sessions for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Array sessions with topic info
   */
  async findSessionsByBootcampId(bootcampId) {
    return await prisma.bootcampSession.findMany({
      where: {
        topic: {
          bootcamp_id: bootcampId,
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            topic_order: true,
            bootcamp_id: true,
          },
        },
      },
      orderBy: [{ topic: { topic_order: 'asc' } }, { session_order: 'asc' }],
    });
  }

  /**
   * Create session for topic
   * @param {Object} data - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(data) {
    // Auto-generate session_order if not provided
    if (!data.session_order) {
      const maxSession = await prisma.bootcampSession.findFirst({
        where: { topic_id: data.topic_id },
        orderBy: { session_order: 'desc' },
      });
      data.session_order = maxSession ? maxSession.session_order + 1 : 1;
    }

    return await prisma.bootcampSession.create({ data });
  }

  /**
   * Update session
   * @param {number} id - Session ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated session
   */
  async updateSession(id, data) {
    return await prisma.bootcampSession.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete session
   * @param {number} id - Session ID
   * @returns {Promise<Object>} Deleted session
   */
  async deleteSession(id) {
    return await prisma.bootcampSession.delete({
      where: { id },
    });
  }

  /**
   * Reorder sessions for topic
   * @param {number} topicId - Topic ID
   * @param {Array} orderData - Array containing {id, session_order}
   * @returns {Promise<Array>} Updated sessions
   */
  async reorderSessions(topicId, orderData) {
    const updatePromises = orderData.map(({ id, session_order }) => this.updateSession(id, { session_order }));
    return Promise.all(updatePromises);
  }

  /**
   * Get session statistics for topic
   * @param {number} topicId - Topic ID
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats(topicId) {
    const sessions = await this.findSessionsByTopicId(topicId);

    return {
      total_sessions: sessions.length,
      first_session: sessions.length > 0 ? sessions[0].title : null,
      last_session: sessions.length > 0 ? sessions[sessions.length - 1].title : null,
    };
  }

  /**
   * Batch create sessions for topic
   * @param {number} topicId - Topic ID
   * @param {Array} sessionsData - Array of session data
   * @returns {Promise<Array>} Created sessions
   */
  async createBatchSessions(topicId, sessionsData) {
    const createPromises = sessionsData.map((sessionData, index) => {
      const data = {
        ...sessionData,
        topic_id: topicId,
        session_order: sessionData.session_order || index + 1,
      };
      return this.createSession(data);
    });

    return Promise.all(createPromises);
  }

  // ==================== INSTRUCTOR ASSIGNMENT METHODS ====================

  /**
   * Add instructor to bootcamp
   * @param {Object} data - Bootcamp instructor data
   * @returns {Promise<Object>} Created bootcamp instructor
   */
  async addInstructorToBootcamp(data) {
    const { bootcamp_id, instructor_id, instructor_order } = data;

    // Check if assignment already exists
    const existingAssignment = await prisma.bootcampInstructor.findFirst({
      where: {
        bootcamp_id,
        instructor_id,
      },
    });

    if (existingAssignment) {
      throw new Error('Instructor sudah di-assign ke bootcamp ini');
    }

    // Auto-generate instructor_order if not provided
    let finalOrder = instructor_order;
    if (!finalOrder) {
      const maxOrder = await prisma.bootcampInstructor.findFirst({
        where: { bootcamp_id },
        orderBy: { instructor_order: 'desc' },
      });
      finalOrder = maxOrder ? maxOrder.instructor_order + 1 : 1;
    }

    return await prisma.bootcampInstructor.create({
      data: {
        bootcamp_id,
        instructor_id,
        instructor_order: finalOrder,
      },
    });
  }

  /**
   * Remove instructor from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<Object>} Deleted bootcamp instructor
   */
  async removeInstructorFromBootcamp(bootcampId, instructorId) {
    const assignment = await prisma.bootcampInstructor.findFirst({
      where: {
        bootcamp_id: bootcampId,
        instructor_id: instructorId,
      },
    });

    if (!assignment) {
      throw new Error('Assignment instructor tidak ditemukan');
    }

    // Delete assignment
    await prisma.bootcampInstructor.delete({
      where: {
        bootcamp_id_instructor_id: {
          bootcamp_id: bootcampId,
          instructor_id: instructorId,
        },
      },
    });

    return assignment;
  }

  /**
   * Get all instructors for bootcamp with details
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<Array>} Array instructor with details
   */
  async findInstructorsByBootcampId(bootcampId) {
    return await prisma.bootcampInstructor.findMany({
      where: { bootcamp_id: bootcampId },
      include: {
        instructor: true,
        bootcamp: {
          select: {
            id: true,
            title: true,
            path_slug: true,
          },
        },
      },
      orderBy: { instructor_order: 'asc' },
    });
  }

  /**
   * Get all bootcamps for instructor with details
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<Array>} Array bootcamp with details
   */
  async findBootcampsByInstructorId(instructorId) {
    return await prisma.bootcampInstructor.findMany({
      where: { instructor_id: instructorId },
      include: {
        bootcamp: true,
        instructor: {
          select: {
            id: true,
            name: true,
            job_title: true,
          },
        },
      },
      orderBy: { instructor_order: 'asc' },
    });
  }

  /**
   * Check if instructor is assigned to bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<boolean>} True if assigned
   */
  async isInstructorAssignedToBootcamp(bootcampId, instructorId) {
    const assignment = await prisma.bootcampInstructor.findFirst({
      where: {
        bootcamp_id: bootcampId,
        instructor_id: instructorId,
      },
    });

    return !!assignment;
  }

  /**
   * Count instructors for bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @returns {Promise<number>} Instructor count
   */
  async countInstructorsByBootcamp(bootcampId) {
    return await prisma.bootcampInstructor.count({
      where: { bootcamp_id: bootcampId },
    });
  }

  /**
   * Count bootcamps for instructor
   * @param {number} instructorId - Instructor ID
   * @returns {Promise<number>} Bootcamp count
   */
  async countBootcampsByInstructor(instructorId) {
    return await prisma.bootcampInstructor.count({
      where: { instructor_id: instructorId },
    });
  }

  /**
   * Batch assign instructors to bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} instructorIds - Array of instructor IDs
   * @returns {Promise<Array>} Array of created bootcamp instructors
   */
  async batchAssignInstructors(bootcampId, instructorIds) {
    // Check existing assignments
    const existingAssignments = await prisma.bootcampInstructor.findMany({
      where: {
        bootcamp_id: bootcampId,
        instructor_id: { in: instructorIds },
      },
    });

    const existingInstructorIds = existingAssignments.map((a) => a.instructor_id);
    const newInstructorIds = instructorIds.filter((id) => !existingInstructorIds.includes(id));

    if (newInstructorIds.length === 0) {
      throw new Error('Semua instructor sudah di-assign ke bootcamp ini');
    }

    // Get starting order
    const maxOrder = await prisma.bootcampInstructor.findFirst({
      where: { bootcamp_id: bootcampId },
      orderBy: { instructor_order: 'desc' },
    });

    const startingOrder = maxOrder ? maxOrder.instructor_order + 1 : 1;

    // Create assignments
    const assignments = newInstructorIds.map((instructor_id, index) => ({
      bootcamp_id: bootcampId,
      instructor_id,
      instructor_order: startingOrder + index,
    }));

    const createPromises = assignments.map((assignment) => prisma.bootcampInstructor.create({ data: assignment }));
    return Promise.all(createPromises);
  }

  /**
   * Batch remove instructors from bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} instructorIds - Array of instructor IDs
   * @returns {Promise<number>} Number of deleted assignments
   */
  async batchRemoveInstructors(bootcampId, instructorIds) {
    const result = await prisma.bootcampInstructor.deleteMany({
      where: {
        bootcamp_id: bootcampId,
        instructor_id: { in: instructorIds },
      },
    });

    return result.count;
  }

  /**
   * Reorder instructors in bootcamp
   * @param {number} bootcampId - Bootcamp ID
   * @param {Array} orderData - Array containing {instructor_id, instructor_order}
   * @returns {Promise<Array>} Updated bootcamp instructors
   */
  async reorderInstructors(bootcampId, orderData) {
    const updatePromises = orderData.map(({ instructor_id, instructor_order }) =>
      prisma.bootcampInstructor.update({
        where: {
          bootcamp_id_instructor_id: {
            bootcamp_id: bootcampId,
            instructor_id: instructor_id,
          },
        },
        data: { instructor_order },
      })
    );

    return Promise.all(updatePromises);
  }

  /**
   * Get assignment statistics
   * @returns {Promise<Object>} Assignment statistics
   */
  async getInstructorAssignmentStats() {
    const [totalAssignments, uniqueBootcamps, uniqueInstructors, avgInstructorsPerBootcamp, avgBootcampsPerInstructor] = await Promise.all([
      prisma.bootcampInstructor.count(),
      prisma.bootcampInstructor
        .groupBy({
          by: ['bootcamp_id'],
          _count: true,
        })
        .then((results) => results.length),
      prisma.bootcampInstructor
        .groupBy({
          by: ['instructor_id'],
          _count: true,
        })
        .then((results) => results.length),
      prisma.bootcampInstructor
        .groupBy({
          by: ['bootcamp_id'],
          _count: { instructor_id: true },
        })
        .then((results) => {
          const total = results.reduce((sum, group) => sum + group._count.instructor_id, 0);
          return results.length > 0 ? Math.round((total / results.length) * 100) / 100 : 0;
        }),
      prisma.bootcampInstructor
        .groupBy({
          by: ['instructor_id'],
          _count: { bootcamp_id: true },
        })
        .then((results) => {
          const total = results.reduce((sum, group) => sum + group._count.bootcamp_id, 0);
          return results.length > 0 ? Math.round((total / results.length) * 100) / 100 : 0;
        }),
    ]);

    return {
      total_assignments: totalAssignments,
      unique_bootcamps_with_instructors: uniqueBootcamps,
      unique_instructors_with_bootcamps: uniqueInstructors,
      average_instructors_per_bootcamp: avgInstructorsPerBootcamp,
      average_bootcamps_per_instructor: avgBootcampsPerInstructor,
    };
  }
}

// Export instance
export const bootcampRepository = new BootcampRepository();
