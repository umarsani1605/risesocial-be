import prisma from '../lib/prisma.js';
import { BaseRepository } from './base/BaseRepository.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Consolidated Bootcamp Repository
 * Handles all bootcamp-related data access operations
 */
export class BootcampRepository extends BaseRepository {
  constructor() {
    super(prisma.bootcamp);
  }

  get logger() {
    return getLogger();
  }

  // ==================== MAIN BOOTCAMP METHODS ====================

  /**
   * Find bootcamp by slug
   */
  async findBySlug(slug, options = {}) {
    this.logger.info({ slug }, '[bootcampRepository] findBySlug called');
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
   */
  async findWithPagination(options = {}) {
    this.logger.info({ options }, '[bootcampRepository] findWithPagination called');
    const { page = 1, limit = 10, category, search, status = 'ACTIVE', minRating, includeRelations = false } = options;

    const skip = (page - 1) * limit;

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
   */
  async getCategories() {
    this.logger.info('[bootcampRepository] getCategories called');
    const result = await this.model.findMany({
      where: { status: 'ACTIVE' },
      select: { category: true },
      distinct: ['category'],
    });
    return result.map((item) => item.category).filter(Boolean);
  }

  /**
   * Get featured bootcamps
   */
  async getFeatured(limit = 6) {
    this.logger.info({ limit }, '[bootcampRepository] getFeatured called');
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
   */
  async slugExists(slug, excludeId = null) {
    this.logger.info({ slug, excludeId }, '[bootcampRepository] slugExists called');
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

  /**
   * Create pricing for bootcamp
   */
  async createPricing(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampRepository] createPricing called');

    const { tier_order, ...rest } = data || {};

    const pricing = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(tier_order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampPricing.updateMany({
          where: { bootcamp_id: bootcampId, tier_order: { gte: desiredOrder } },
          data: { tier_order: { increment: 1 } },
        });
        this.logger.info({ bootcampId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] pricing shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.bootcampPricing.findFirst({
          where: { bootcamp_id: bootcampId },
          orderBy: { tier_order: 'desc' },
          select: { tier_order: true },
        });
        finalOrder = (maxRow?.tier_order || 0) + 1;
      }

      return tx.bootcampPricing.create({
        data: { bootcamp_id: bootcampId, ...rest, tier_order: finalOrder },
      });
    });

    this.logger.info({ pricingId: pricing.id }, '[bootcampRepository] createPricing success');
    return pricing;
  }

  /**
   * Update pricing for bootcamp
   */
  async updatePricing(bootcampId, pricingId, data) {
    this.logger.info({ bootcampId, pricingId, data }, '[bootcampRepository] updatePricing called');
    const { tier_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampPricing.findFirst({
        where: { id: pricingId, bootcamp_id: bootcampId },
        select: { tier_order: true },
      });

      if (typeof tier_order === 'number' && tier_order >= 1 && existing) {
        if (tier_order < existing.tier_order) {
          await tx.bootcampPricing.updateMany({
            where: { bootcamp_id: bootcampId, tier_order: { gte: tier_order, lt: existing.tier_order } },
            data: { tier_order: { increment: 1 } },
          });
        } else if (tier_order > existing.tier_order) {
          await tx.bootcampPricing.updateMany({
            where: { bootcamp_id: bootcampId, tier_order: { lte: tier_order, gt: existing.tier_order } },
            data: { tier_order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.bootcampPricing.update({
        where: { id: pricingId, bootcamp_id: bootcampId },
        data: { ...rest, ...(tier_order ? { tier_order } : {}) },
      });

      return updated;
    });

    this.logger.info({ pricingId: result.id }, '[bootcampRepository] updatePricing success');
    return result;
  }

  /**
   * Delete pricing for bootcamp
   */
  async deletePricing(bootcampId, pricingId) {
    this.logger.info({ bootcampId, pricingId }, '[bootcampRepository] deletePricing called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampPricing.findFirst({
        where: { id: pricingId, bootcamp_id: bootcampId },
        select: { tier_order: true },
      });

      await tx.bootcampPricing.delete({
        where: { id: pricingId, bootcamp_id: bootcampId },
      });

      if (existing?.tier_order) {
        const shiftResult = await tx.bootcampPricing.updateMany({
          where: { bootcamp_id: bootcampId, tier_order: { gt: existing.tier_order } },
          data: { tier_order: { decrement: 1 } },
        });
        this.logger.info(
          { bootcampId, deletedOrder: existing.tier_order, shifted: shiftResult.count },
          '[bootcampRepository] pricing shift-on-delete'
        );
      }
    });

    this.logger.info({ pricingId }, '[bootcampRepository] deletePricing success');
    return { message: 'Pricing deleted successfully' };
  }

  // ==================== FEATURES METHODS ====================

  /**
   * Create feature for bootcamp
   */
  async createFeature(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampRepository] createFeature called');

    const { feature_order, ...rest } = data || {};

    const feature = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(feature_order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampFeature.updateMany({
          where: { bootcamp_id: bootcampId, feature_order: { gte: desiredOrder } },
          data: { feature_order: { increment: 1 } },
        });
        this.logger.info({ bootcampId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] feature shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.bootcampFeature.findFirst({
          where: { bootcamp_id: bootcampId },
          orderBy: { feature_order: 'desc' },
          select: { feature_order: true },
        });
        finalOrder = (maxRow?.feature_order || 0) + 1;
      }

      return tx.bootcampFeature.create({
        data: { bootcamp_id: bootcampId, ...rest, feature_order: finalOrder },
      });
    });

    this.logger.info({ featureId: feature.id }, '[bootcampRepository] createFeature success');
    return feature;
  }

  /**
   * Update feature for bootcamp
   */
  async updateFeature(bootcampId, featureId, data) {
    this.logger.info({ bootcampId, featureId, data }, '[bootcampRepository] updateFeature called');
    const { feature_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampFeature.findFirst({
        where: { id: featureId, bootcamp_id: bootcampId },
        select: { feature_order: true },
      });

      if (typeof feature_order === 'number' && feature_order >= 1 && existing) {
        if (feature_order < existing.feature_order) {
          await tx.bootcampFeature.updateMany({
            where: { bootcamp_id: bootcampId, feature_order: { gte: feature_order, lt: existing.feature_order } },
            data: { feature_order: { increment: 1 } },
          });
        } else if (feature_order > existing.feature_order) {
          await tx.bootcampFeature.updateMany({
            where: { bootcamp_id: bootcampId, feature_order: { lte: feature_order, gt: existing.feature_order } },
            data: { feature_order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.bootcampFeature.update({
        where: { id: featureId, bootcamp_id: bootcampId },
        data: { ...rest, ...(feature_order ? { feature_order } : {}) },
      });

      return updated;
    });

    this.logger.info({ featureId: result.id }, '[bootcampRepository] updateFeature success');
    return result;
  }

  /**
   * Delete feature for bootcamp
   */
  async deleteFeature(bootcampId, featureId) {
    this.logger.info({ bootcampId, featureId }, '[bootcampRepository] deleteFeature called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampFeature.findFirst({
        where: { id: featureId, bootcamp_id: bootcampId },
        select: { feature_order: true },
      });

      await tx.bootcampFeature.delete({
        where: { id: featureId, bootcamp_id: bootcampId },
      });

      if (existing?.feature_order) {
        await tx.bootcampFeature.updateMany({
          where: { bootcamp_id: bootcampId, feature_order: { gt: existing.feature_order } },
          data: { feature_order: { decrement: 1 } },
        });
      }
    });

    this.logger.info({ featureId }, '[bootcampRepository] deleteFeature success');
    return { message: 'Feature deleted successfully' };
  }

  // ==================== INSTRUCTORS METHODS ====================

  /**
   * Create instructor for bootcamp
   */
  async createInstructor(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampRepository] createInstructor called');

    const { instructor_order, ...rest } = data || {};

    const instructor = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(instructor_order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampInstructor.updateMany({
          where: { bootcamp_id: bootcampId, instructor_order: { gte: desiredOrder } },
          data: { instructor_order: { increment: 1 } },
        });
        this.logger.info({ bootcampId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] instructor shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.bootcampInstructor.findFirst({
          where: { bootcamp_id: bootcampId },
          orderBy: { instructor_order: 'desc' },
          select: { instructor_order: true },
        });
        finalOrder = (maxRow?.instructor_order || 0) + 1;
      }

      return tx.bootcampInstructor.create({
        data: { bootcamp_id: bootcampId, ...rest, instructor_order: finalOrder },
        include: { instructor: true },
      });
    });

    this.logger.info({ instructorId: instructor.instructor_id }, '[bootcampRepository] createInstructor success');
    return instructor;
  }

  /**
   * Update instructor for bootcamp
   */
  async updateInstructor(bootcampId, instructorId, data) {
    this.logger.info({ bootcampId, instructorId, data }, '[bootcampRepository] updateInstructor called');
    const { instructor_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampInstructor.findFirst({
        where: { instructor_id: instructorId, bootcamp_id: bootcampId },
        select: { instructor_order: true },
      });

      if (typeof instructor_order === 'number' && instructor_order >= 1 && existing) {
        if (instructor_order < existing.instructor_order) {
          await tx.bootcampInstructor.updateMany({
            where: { bootcamp_id: bootcampId, instructor_order: { gte: instructor_order, lt: existing.instructor_order } },
            data: { instructor_order: { increment: 1 } },
          });
        } else if (instructor_order > existing.instructor_order) {
          await tx.bootcampInstructor.updateMany({
            where: { bootcamp_id: bootcampId, instructor_order: { lte: instructor_order, gt: existing.instructor_order } },
            data: { instructor_order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.bootcampInstructor.update({
        where: { instructor_id: instructorId, bootcamp_id: bootcampId },
        data: { ...rest, ...(instructor_order ? { instructor_order } : {}) },
        include: { instructor: true },
      });

      return updated;
    });

    this.logger.info({ instructorId: result.instructor_id }, '[bootcampRepository] updateInstructor success');
    return result;
  }

  /**
   * Delete instructor from bootcamp
   */
  async deleteInstructor(bootcampId, instructorId) {
    this.logger.info({ bootcampId, instructorId }, '[bootcampRepository] deleteInstructor called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampInstructor.findFirst({
        where: { instructor_id: instructorId, bootcamp_id: bootcampId },
        select: { instructor_order: true },
      });

      await tx.bootcampInstructor.delete({
        where: { instructor_id: instructorId, bootcamp_id: bootcampId },
      });

      if (existing?.instructor_order) {
        await tx.bootcampInstructor.updateMany({
          where: { bootcamp_id: bootcampId, instructor_order: { gt: existing.instructor_order } },
          data: { instructor_order: { decrement: 1 } },
        });
      }
    });

    this.logger.info({ instructorId }, '[bootcampRepository] deleteInstructor success');
    return { message: 'Instructor removed successfully' };
  }

  // ==================== TOPICS METHODS ====================

  /**
   * Create topic for bootcamp
   */
  async createTopic(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampRepository] createTopic called');

    const { topic_order, ...rest } = data || {};

    const topic = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(topic_order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampTopic.updateMany({
          where: { bootcamp_id: bootcampId, topic_order: { gte: desiredOrder } },
          data: { topic_order: { increment: 1 } },
        });
        this.logger.info({ bootcampId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] topic shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.bootcampTopic.findFirst({
          where: { bootcamp_id: bootcampId },
          orderBy: { topic_order: 'desc' },
          select: { topic_order: true },
        });
        finalOrder = (maxRow?.topic_order || 0) + 1;
      }

      return tx.bootcampTopic.create({
        data: { bootcamp_id: bootcampId, ...rest, topic_order: finalOrder },
        include: { sessions: true },
      });
    });

    this.logger.info({ topicId: topic.id }, '[bootcampRepository] createTopic success');
    return topic;
  }

  /**
   * Update topic for bootcamp
   */
  async updateTopic(bootcampId, topicId, data) {
    this.logger.info({ bootcampId, topicId, data }, '[bootcampRepository] updateTopic called');
    const { topic_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampTopic.findFirst({
        where: { id: topicId, bootcamp_id: bootcampId },
        select: { topic_order: true },
      });

      if (typeof topic_order === 'number' && topic_order >= 1 && existing) {
        if (topic_order < existing.topic_order) {
          await tx.bootcampTopic.updateMany({
            where: { bootcamp_id: bootcampId, topic_order: { gte: topic_order, lt: existing.topic_order } },
            data: { topic_order: { increment: 1 } },
          });
        } else if (topic_order > existing.topic_order) {
          await tx.bootcampTopic.updateMany({
            where: { bootcamp_id: bootcampId, topic_order: { lte: topic_order, gt: existing.topic_order } },
            data: { topic_order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.bootcampTopic.update({
        where: { id: topicId, bootcamp_id: bootcampId },
        data: { ...rest, ...(topic_order ? { topic_order } : {}) },
        include: { sessions: true },
      });

      return updated;
    });

    this.logger.info({ topicId: result.id }, '[bootcampRepository] updateTopic success');
    return result;
  }

  /**
   * Delete topic from bootcamp
   */
  async deleteTopic(bootcampId, topicId) {
    this.logger.info({ bootcampId, topicId }, '[bootcampRepository] deleteTopic called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampTopic.findFirst({
        where: { id: topicId, bootcamp_id: bootcampId },
        select: { topic_order: true },
      });

      await tx.bootcampTopic.delete({
        where: { id: topicId, bootcamp_id: bootcampId },
      });

      if (existing?.topic_order) {
        await tx.bootcampTopic.updateMany({
          where: { bootcamp_id: bootcampId, topic_order: { gt: existing.topic_order } },
          data: { topic_order: { decrement: 1 } },
        });
      }
    });

    this.logger.info({ topicId }, '[bootcampRepository] deleteTopic success');
    return { message: 'Topic deleted successfully' };
  }

  // ==================== TESTIMONIALS METHODS ====================

  /**
   * Create testimonial for bootcamp
   */
  async createTestimonial(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampRepository] createTestimonial called');

    const { testimonial_order, ...rest } = data || {};

    const testimonial = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(testimonial_order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampTestimonial.updateMany({
          where: { bootcamp_id: bootcampId, testimonial_order: { gte: desiredOrder } },
          data: { testimonial_order: { increment: 1 } },
        });
        this.logger.info({ bootcampId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] testimonial shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.bootcampTestimonial.findFirst({
          where: { bootcamp_id: bootcampId },
          orderBy: { testimonial_order: 'desc' },
          select: { testimonial_order: true },
        });
        finalOrder = (maxRow?.testimonial_order || 0) + 1;
      }

      return tx.bootcampTestimonial.create({
        data: { bootcamp_id: bootcampId, ...rest, testimonial_order: finalOrder },
      });
    });

    this.logger.info({ testimonialId: testimonial.id }, '[bootcampRepository] createTestimonial success');
    return testimonial;
  }

  /**
   * Update testimonial for bootcamp
   */
  async updateTestimonial(bootcampId, testimonialId, data) {
    this.logger.info({ bootcampId, testimonialId, data }, '[bootcampRepository] updateTestimonial called');
    const { testimonial_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampTestimonial.findFirst({
        where: { id: testimonialId, bootcamp_id: bootcampId },
        select: { testimonial_order: true },
      });

      if (typeof testimonial_order === 'number' && testimonial_order >= 1 && existing) {
        if (testimonial_order < existing.testimonial_order) {
          await tx.bootcampTestimonial.updateMany({
            where: { bootcamp_id: bootcampId, testimonial_order: { gte: testimonial_order, lt: existing.testimonial_order } },
            data: { testimonial_order: { increment: 1 } },
          });
        } else if (testimonial_order > existing.testimonial_order) {
          await tx.bootcampTestimonial.updateMany({
            where: { bootcamp_id: bootcampId, testimonial_order: { lte: testimonial_order, gt: existing.testimonial_order } },
            data: { testimonial_order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.bootcampTestimonial.update({
        where: { id: testimonialId, bootcamp_id: bootcampId },
        data: { ...rest, ...(testimonial_order ? { testimonial_order } : {}) },
      });

      return updated;
    });

    this.logger.info({ testimonialId: result.id }, '[bootcampRepository] updateTestimonial success');
    return result;
  }

  /**
   * Delete testimonial from bootcamp
   */
  async deleteTestimonial(bootcampId, testimonialId) {
    this.logger.info({ bootcampId, testimonialId }, '[bootcampRepository] deleteTestimonial called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampTestimonial.findFirst({
        where: { id: testimonialId, bootcamp_id: bootcampId },
        select: { testimonial_order: true },
      });

      await tx.bootcampTestimonial.delete({
        where: { id: testimonialId, bootcamp_id: bootcampId },
      });

      if (existing?.testimonial_order) {
        await tx.bootcampTestimonial.updateMany({
          where: { bootcamp_id: bootcampId, testimonial_order: { gt: existing.testimonial_order } },
          data: { testimonial_order: { decrement: 1 } },
        });
      }
    });

    this.logger.info({ testimonialId }, '[bootcampRepository] deleteTestimonial success');
    return { message: 'Testimonial deleted successfully' };
  }

  // ==================== FAQs METHODS ====================

  /**
   * Create FAQ for bootcamp
   */
  async createFaq(bootcampId, data) {
    this.logger.info({ bootcampId, data }, '[bootcampRepository] createFaq called');

    const { faq_order, ...rest } = data || {};

    const faq = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(faq_order);
      let finalOrder = desiredOrder;
      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampFaq.updateMany({
          where: { bootcamp_id: bootcampId, faq_order: { gte: desiredOrder } },
          data: { faq_order: { increment: 1 } },
        });
        this.logger.info({ bootcampId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] faq shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxRow = await tx.bootcampFaq.findFirst({
          where: { bootcamp_id: bootcampId },
          orderBy: { faq_order: 'desc' },
          select: { faq_order: true },
        });
        finalOrder = (maxRow?.faq_order || 0) + 1;
      }

      return tx.bootcampFaq.create({
        data: { bootcamp_id: bootcampId, ...rest, faq_order: finalOrder },
      });
    });

    this.logger.info({ faqId: faq.id }, '[bootcampRepository] createFaq success');
    return faq;
  }

  /**
   * Update FAQ for bootcamp
   */
  async updateFaq(bootcampId, faqId, data) {
    this.logger.info({ bootcampId, faqId, data }, '[bootcampRepository] updateFaq called');
    const { faq_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampFaq.findFirst({
        where: { id: faqId, bootcamp_id: bootcampId },
        select: { faq_order: true },
      });

      if (typeof faq_order === 'number' && faq_order >= 1 && existing) {
        if (faq_order < existing.faq_order) {
          await tx.bootcampFaq.updateMany({
            where: { bootcamp_id: bootcampId, faq_order: { gte: faq_order, lt: existing.faq_order } },
            data: { faq_order: { increment: 1 } },
          });
        } else if (faq_order > existing.faq_order) {
          await tx.bootcampFaq.updateMany({
            where: { bootcamp_id: bootcampId, faq_order: { lte: faq_order, gt: existing.faq_order } },
            data: { faq_order: { decrement: 1 } },
          });
        }
      }

      const updated = await tx.bootcampFaq.update({
        where: { id: faqId, bootcamp_id: bootcampId },
        data: { ...rest, ...(faq_order ? { faq_order } : {}) },
      });

      return updated;
    });

    this.logger.info({ faqId: result.id }, '[bootcampRepository] updateFaq success');
    return result;
  }

  /**
   * Delete FAQ from bootcamp
   */
  async deleteFaq(bootcampId, faqId) {
    this.logger.info({ bootcampId, faqId }, '[bootcampRepository] deleteFaq called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampFaq.findFirst({
        where: { id: faqId, bootcamp_id: bootcampId },
        select: { faq_order: true },
      });

      await tx.bootcampFaq.delete({
        where: { id: faqId, bootcamp_id: bootcampId },
      });

      if (existing?.faq_order) {
        await tx.bootcampFaq.updateMany({
          where: { bootcamp_id: bootcampId, faq_order: { gt: existing.faq_order } },
          data: { faq_order: { decrement: 1 } },
        });
      }
    });

    this.logger.info({ faqId }, '[bootcampRepository] deleteFaq success');
    return { message: 'FAQ deleted successfully' };
  }

  // ==================== SESSION METHODS WITH RE-ORDERING ====================

  /**
   * Find topic by ID
   */
  async findTopicById(topicId) {
    this.logger.info({ topicId }, '[bootcampRepository] findTopicById called');
    return await prisma.bootcampTopic.findUnique({
      where: { id: topicId },
    });
  }

  /**
   * Find session by ID
   */
  async findSessionById(sessionId) {
    this.logger.info({ sessionId }, '[bootcampRepository] findSessionById called');
    return await prisma.bootcampSession.findUnique({
      where: { id: sessionId },
    });
  }

  /**
   * Create session for topic with re-ordering
   */
  async createSession(bootcampId, topicId, data) {
    this.logger.info({ bootcampId, topicId, data }, '[bootcampRepository] createSession called');

    const { session_order, ...rest } = data || {};

    const session = await prisma.$transaction(async (tx) => {
      const desiredOrder = Number(session_order);
      let finalOrder = desiredOrder;

      if (Number.isFinite(desiredOrder) && desiredOrder >= 1) {
        const shiftResult = await tx.bootcampSession.updateMany({
          where: { topic_id: topicId, session_order: { gte: desiredOrder } },
          data: { session_order: { increment: 1 } },
        });
        this.logger.info({ topicId, desiredOrder, shifted: shiftResult.count }, '[bootcampRepository] session shift-on-create');
        finalOrder = desiredOrder;
      } else {
        const maxSession = await tx.bootcampSession.findFirst({
          where: { topic_id: topicId },
          orderBy: { session_order: 'desc' },
          select: { session_order: true },
        });
        finalOrder = maxSession ? maxSession.session_order + 1 : 1;
      }

      return await tx.bootcampSession.create({
        data: {
          topic_id: topicId,
          session_order: finalOrder,
          ...rest,
        },
      });
    });

    this.logger.info({ sessionId: session.id }, '[bootcampRepository] createSession success');
    return session;
  }

  /**
   * Update session with re-ordering
   */
  async updateSession(bootcampId, topicId, sessionId, data) {
    this.logger.info({ bootcampId, topicId, sessionId, data }, '[bootcampRepository] updateSession called');
    const { session_order, ...rest } = data || {};

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampSession.findFirst({
        where: { id: sessionId, topic_id: topicId },
        select: { session_order: true },
      });

      if (typeof session_order === 'number' && session_order >= 1 && existing) {
        if (session_order < existing.session_order) {
          // Moving up: shift items between new position and old position down
          const shiftResult = await tx.bootcampSession.updateMany({
            where: {
              topic_id: topicId,
              session_order: { gte: session_order, lt: existing.session_order },
            },
            data: { session_order: { increment: 1 } },
          });
          this.logger.info({ topicId, sessionId, session_order, shifted: shiftResult.count }, '[bootcampRepository] session shift-up');
        } else if (session_order > existing.session_order) {
          // Moving down: shift items between old position and new position up
          const shiftResult = await tx.bootcampSession.updateMany({
            where: {
              topic_id: topicId,
              session_order: { gt: existing.session_order, lte: session_order },
            },
            data: { session_order: { decrement: 1 } },
          });
          this.logger.info({ topicId, sessionId, session_order, shifted: shiftResult.count }, '[bootcampRepository] session shift-down');
        }
      }

      return await tx.bootcampSession.update({
        where: { id: sessionId, topic_id: topicId },
        data: { session_order, ...rest },
      });
    });

    this.logger.info({ sessionId: result.id }, '[bootcampRepository] updateSession success');
    return result;
  }

  /**
   * Delete session with re-ordering
   */
  async deleteSession(bootcampId, topicId, sessionId) {
    this.logger.info({ bootcampId, topicId, sessionId }, '[bootcampRepository] deleteSession called');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.bootcampSession.findFirst({
        where: { id: sessionId, topic_id: topicId },
        select: { session_order: true },
      });

      await tx.bootcampSession.delete({
        where: { id: sessionId, topic_id: topicId },
      });

      if (existing?.session_order) {
        const shiftResult = await tx.bootcampSession.updateMany({
          where: {
            topic_id: topicId,
            session_order: { gt: existing.session_order },
          },
          data: { session_order: { decrement: 1 } },
        });
        this.logger.info(
          { topicId, deletedOrder: existing.session_order, shifted: shiftResult.count },
          '[bootcampRepository] session shift-on-delete'
        );
      }
    });

    this.logger.info({ sessionId }, '[bootcampRepository] deleteSession success');
    return { message: 'Session deleted successfully' };
  }
}

// Export instance
export const bootcampRepository = new BootcampRepository();
