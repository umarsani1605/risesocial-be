import { validationResult } from 'express-validator';
import { bootcampService } from '../../services/bootcampService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

class BootcampRelatedController {
  constructor() {
    this.bootcampService = bootcampService;
  }

  // ========================
  // PRICING METHODS
  // ========================

  /**
   * Mendapatkan semua pricing untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllPricings(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const pricings = await this.bootcampService.getAllPricingsByBootcampId(parseInt(bootcampId));

      return reply.send(successResponse(pricings, 'Pricing berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Membuat pricing baru untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createPricing(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const pricingData = {
        ...request.body,
        bootcamp_id: parseInt(bootcampId),
      };

      const pricing = await this.bootcampService.createPricing(pricingData);

      return reply.status(201).send(successResponse(pricing, 'Pricing berhasil dibuat'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update pricing
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updatePricing(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const pricing = await this.bootcampService.updatePricing(parseInt(id), request.body);

      return reply.send(successResponse(pricing, 'Pricing berhasil diupdate'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghapus pricing
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deletePricing(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      await this.bootcampService.deletePricing(parseInt(id));

      return reply.send(successResponse(null, 'Pricing berhasil dihapus'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Reorder pricing tiers
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async reorderPricingTiers(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { orderData } = request.body;

      const updatedPricings = await this.bootcampService.reorderPricingTiers(parseInt(bootcampId), orderData);

      return reply.send(successResponse(updatedPricings, 'Pricing tiers berhasil direorder'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // FEATURES METHODS
  // ========================

  /**
   * Mendapatkan semua features untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllFeatures(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const features = await this.bootcampService.getAllFeaturesByBootcampId(parseInt(bootcampId));

      return reply.send(successResponse(features, 'Features berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Membuat feature baru untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createFeature(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const featureData = {
        ...request.body,
        bootcamp_id: parseInt(bootcampId),
      };

      const feature = await this.bootcampService.createFeature(featureData);

      return reply.status(201).send(successResponse(feature, 'Feature berhasil dibuat'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update feature
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateFeature(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const feature = await this.bootcampService.updateFeature(parseInt(id), request.body);

      return reply.send(successResponse(feature, 'Feature berhasil diupdate'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghapus feature
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteFeature(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      await this.bootcampService.deleteFeature(parseInt(id));

      return reply.send(successResponse(null, 'Feature berhasil dihapus'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Reorder features
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async reorderFeatures(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { orderData } = request.body;

      const updatedFeatures = await this.bootcampService.reorderFeatures(parseInt(bootcampId), orderData);

      return reply.send(successResponse(updatedFeatures, 'Features berhasil direorder'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // TOPICS METHODS
  // ========================

  /**
   * Mendapatkan semua topics untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllTopics(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { includeSessions } = request.query;

      const topics = await this.bootcampService.getAllTopicsByBootcampId(parseInt(bootcampId), includeSessions === 'true');

      return reply.send(successResponse(topics, 'Topics berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Membuat topic baru untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createTopic(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const topicData = {
        ...request.body,
        bootcamp_id: parseInt(bootcampId),
      };

      const topic = await this.bootcampService.createTopic(topicData);

      return reply.status(201).send(successResponse(topic, 'Topic berhasil dibuat'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update topic
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateTopic(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const topic = await this.bootcampService.updateTopic(parseInt(id), request.body);

      return reply.send(successResponse(topic, 'Topic berhasil diupdate'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghapus topic
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteTopic(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      await this.bootcampService.deleteTopic(parseInt(id));

      return reply.send(successResponse(null, 'Topic berhasil dihapus'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Reorder topics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async reorderTopics(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { orderData } = request.body;

      const updatedTopics = await this.bootcampService.reorderTopics(parseInt(bootcampId), orderData);

      return reply.send(successResponse(updatedTopics, 'Topics berhasil direorder'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // SESSIONS METHODS
  // ========================

  /**
   * Mendapatkan semua sessions untuk topic
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllSessions(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { topicId } = request.params;
      const sessions = await this.bootcampService.getAllSessionsByTopicId(parseInt(topicId));

      return reply.send(successResponse(sessions, 'Sessions berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Membuat session baru untuk topic
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createSession(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { topicId } = request.params;
      const sessionData = {
        ...request.body,
        topic_id: parseInt(topicId),
      };

      const session = await this.bootcampService.createSession(sessionData);

      return reply.status(201).send(successResponse(session, 'Session berhasil dibuat'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update session
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateSession(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const session = await this.bootcampService.updateSession(parseInt(id), request.body);

      return reply.send(successResponse(session, 'Session berhasil diupdate'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghapus session
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteSession(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      await this.bootcampService.deleteSession(parseInt(id));

      return reply.send(successResponse(null, 'Session berhasil dihapus'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Reorder sessions dalam topic
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async reorderSessions(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { topicId } = request.params;
      const { orderData } = request.body;

      const updatedSessions = await this.bootcampService.reorderSessions(parseInt(topicId), orderData);

      return reply.send(successResponse(updatedSessions, 'Sessions berhasil direorder'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // FAQ METHODS
  // ========================

  /**
   * Mendapatkan semua FAQ untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllFaqs(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const faqs = await this.bootcampService.getAllFaqsByBootcampId(parseInt(bootcampId));

      return reply.send(successResponse(faqs, 'FAQs berhasil diambil'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Membuat FAQ baru untuk bootcamp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createFaq(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const faqData = {
        ...request.body,
        bootcamp_id: parseInt(bootcampId),
      };

      const faq = await this.bootcampService.createFaq(faqData);

      return reply.status(201).send(successResponse(faq, 'FAQ berhasil dibuat'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Update FAQ
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateFaq(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      const faq = await this.bootcampService.updateFaq(parseInt(id), request.body);

      return reply.send(successResponse(faq, 'FAQ berhasil diupdate'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghapus FAQ
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteFaq(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { id } = request.params;
      await this.bootcampService.deleteFaq(parseInt(id));

      return reply.send(successResponse(null, 'FAQ berhasil dihapus'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mencari FAQ berdasarkan keyword
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async searchFaqs(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const { keyword } = request.query;

      const faqs = await this.bootcampService.searchFaqs(parseInt(bootcampId), keyword);

      return reply.send(successResponse(faqs, 'FAQs berhasil dicari'));
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  // ========================
  // COMBINED METHODS
  // ========================

  /**
   * Mendapatkan semua data bootcamp related (pricing, features, topics, faqs)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllBootcampRelatedData(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const bootcampIdInt = parseInt(bootcampId);

      // Ambil semua data secara parallel
      const [pricings, features, topics, faqs] = await Promise.all([
        this.bootcampService.getAllPricingsByBootcampId(bootcampIdInt),
        this.bootcampService.getAllFeaturesByBootcampId(bootcampIdInt),
        this.bootcampService.getAllTopicsByBootcampId(bootcampIdInt, true), // Include sessions
        this.bootcampService.getAllFaqsByBootcampId(bootcampIdInt),
      ]);

      return reply.send(
        successResponse(
          {
            bootcamp_id: bootcampIdInt,
            pricing: {
              data: pricings,
              total: pricings.length,
            },
            features: {
              data: features,
              total: features.length,
            },
            topics: {
              data: topics,
              total: topics.length,
              total_sessions: topics.reduce((sum, topic) => sum + topic.session_count, 0),
            },
            faqs: {
              data: faqs,
              total: faqs.length,
            },
          },
          'Data bootcamp related berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Mendapatkan statistik lengkap bootcamp related
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getBootcampRelatedStats(request, reply) {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return reply.send(errorResponse('Validation Error', 400, errors.array()));
      }

      const { bootcampId } = request.params;
      const bootcampIdInt = parseInt(bootcampId);

      // Ambil semua statistik secara parallel
      const [pricingStats, featureStats, topicStats, faqStats] = await Promise.all([
        this.bootcampService.getPricingStats(bootcampIdInt),
        this.bootcampService.getFeatureStats(bootcampIdInt),
        this.bootcampService.getTopicStats(bootcampIdInt),
        this.bootcampService.getFaqStats(bootcampIdInt),
      ]);

      return reply.send(
        successResponse(
          {
            bootcamp_id: bootcampIdInt,
            pricing_stats: pricingStats,
            feature_stats: featureStats,
            topic_stats: topicStats,
            faq_stats: faqStats,
            overall_completion: this.calculateOverallCompletion({
              pricing: pricingStats,
              features: featureStats,
              topics: topicStats,
              faqs: faqStats,
            }),
          },
          'Statistik bootcamp related berhasil diambil'
        )
      );
    } catch (error) {
      request.log.error('Error:', error);
      return reply.send(errorResponse('Internal server error', 500, error.message));
    }
  }

  /**
   * Menghitung overall completion score
   * @param {Object} stats - Combined stats
   * @returns {Object} Overall completion metrics
   */
  calculateOverallCompletion(stats) {
    const weights = {
      pricing: 0.25,
      features: 0.25,
      topics: 0.3,
      faqs: 0.2,
    };

    const scores = {
      pricing: Math.min(stats.pricing.total_tiers * 25, 100), // Max 100 for 4+ tiers
      features: Math.min(stats.features.total_features * 20, 100), // Max 100 for 5+ features
      topics: Math.min(stats.topics.total_topics * 15, 100), // Max 100 for 7+ topics
      faqs: Math.min(stats.faqs.total_faqs * 10, 100), // Max 100 for 10+ faqs
    };

    const overallScore = Object.keys(weights).reduce((total, key) => {
      return total + scores[key] * weights[key];
    }, 0);

    return {
      overall_score: Math.round(overallScore),
      individual_scores: scores,
      weights,
      completion_level: this.getCompletionLevel(overallScore),
    };
  }

  /**
   * Mendapatkan completion level berdasarkan score
   * @param {number} score - Overall score
   * @returns {string} Completion level
   */
  getCompletionLevel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Basic';
    return 'Incomplete';
  }
}

export default BootcampRelatedController;
