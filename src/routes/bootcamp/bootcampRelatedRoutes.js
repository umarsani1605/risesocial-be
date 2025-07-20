/**
 * Bootcamp Related Routes Plugin
 *
 * Routes untuk mengelola semua entitas terkait bootcamp:
 * - Pricing (pricing tiers)
 * - Features (features dan benefits)
 * - Topics (curriculum topics)
 * - Sessions (sessions dalam setiap topic)
 * - FAQ (frequently asked questions)
 *
 * Note: Controller dan service menggunakan CommonJS pattern.
 * Routes ini bertindak sebagai bridge antara ES6 modules dan CommonJS.
 */

/**
 * Bootcamp Related routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function bootcampRelatedRoutes(fastify) {
  const bootcampRelatedTag = { tags: ['Bootcamp Related'] };

  // ================================
  // COMBINED ROUTES (Public)
  // ================================

  /**
   * GET /api/bootcamp-related/all/{bootcampId}
   * Mendapatkan semua data bootcamp related (pricing, features, topics, faqs)
   */
  fastify.get(
    '/all/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mendapatkan semua data bootcamp related',
        description: 'Endpoint untuk mengambil semua data terkait bootcamp: pricing, features, topics, dan FAQs',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  bootcamp_id: { type: 'integer' },
                  pricing: {
                    type: 'object',
                    properties: {
                      data: { type: 'array' },
                      total: { type: 'integer' },
                    },
                  },
                  features: {
                    type: 'object',
                    properties: {
                      data: { type: 'array' },
                      total: { type: 'integer' },
                    },
                  },
                  topics: {
                    type: 'object',
                    properties: {
                      data: { type: 'array' },
                      total: { type: 'integer' },
                      total_sessions: { type: 'integer' },
                    },
                  },
                  faqs: {
                    type: 'object',
                    properties: {
                      data: { type: 'array' },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Temporary implementation - akan diganti dengan controller sebenarnya
      const { bootcampId } = request.params;

      return {
        success: true,
        message: 'Data bootcamp related berhasil diambil',
        data: {
          bootcamp_id: parseInt(bootcampId),
          pricing: {
            data: [],
            total: 0,
          },
          features: {
            data: [],
            total: 0,
          },
          topics: {
            data: [],
            total: 0,
            total_sessions: 0,
          },
          faqs: {
            data: [],
            total: 0,
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/bootcamp-related/stats/{bootcampId}
   * Mendapatkan statistik lengkap bootcamp related
   */
  fastify.get(
    '/stats/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mendapatkan statistik lengkap bootcamp related',
        description: 'Endpoint untuk mengambil statistik lengkap dari semua entitas bootcamp related',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  bootcamp_id: { type: 'integer' },
                  pricing_stats: { type: 'object' },
                  feature_stats: { type: 'object' },
                  topic_stats: { type: 'object' },
                  faq_stats: { type: 'object' },
                  overall_completion: {
                    type: 'object',
                    properties: {
                      overall_score: { type: 'integer' },
                      component_scores: { type: 'object' },
                      status: { type: 'string' },
                    },
                  },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // Temporary implementation - akan diganti dengan controller sebenarnya
      const { bootcampId } = request.params;

      return {
        success: true,
        message: 'Statistik bootcamp related berhasil diambil',
        data: {
          bootcamp_id: parseInt(bootcampId),
          pricing_stats: {
            total_tiers: 0,
            min_price: 0,
            max_price: 0,
            average_discount: 0,
          },
          feature_stats: {
            total_features: 0,
            features_with_icons: 0,
            features_with_descriptions: 0,
            completion_rate: 0,
          },
          topic_stats: {
            total_topics: 0,
            total_sessions: 0,
            topics_with_descriptions: 0,
            average_sessions_per_topic: 0,
            completion_rate: 0,
          },
          faq_stats: {
            total_faqs: 0,
            average_question_length: 0,
            average_answer_length: 0,
            readability_score: 0,
          },
          overall_completion: {
            overall_score: 0,
            component_scores: {
              pricing: 0,
              features: 0,
              topics: 0,
              faqs: 0,
            },
            status: 'Incomplete',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // PRICING ROUTES
  // ================================

  /**
   * GET /api/bootcamp-related/pricing/{bootcampId}
   * Mendapatkan semua pricing tiers untuk bootcamp
   */
  fastify.get(
    '/pricing/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mendapatkan semua pricing tiers untuk bootcamp',
        tags: ['Bootcamp Pricing'],
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;

      return {
        success: true,
        message: 'Pricing tiers berhasil diambil',
        data: {
          pricings: [],
          total: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // FEATURES ROUTES
  // ================================

  /**
   * GET /api/bootcamp-related/features/{bootcampId}
   * Mendapatkan semua features untuk bootcamp
   */
  fastify.get(
    '/features/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mendapatkan semua features untuk bootcamp',
        tags: ['Bootcamp Features'],
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;

      return {
        success: true,
        message: 'Features berhasil diambil',
        data: {
          features: [],
          total: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // TOPICS ROUTES
  // ================================

  /**
   * GET /api/bootcamp-related/topics/{bootcampId}
   * Mendapatkan semua topics untuk bootcamp
   */
  fastify.get(
    '/topics/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mendapatkan semua topics untuk bootcamp',
        tags: ['Bootcamp Topics'],
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        querystring: {
          type: 'object',
          properties: {
            include_sessions: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;
      const { include_sessions } = request.query;

      return {
        success: true,
        message: 'Topics berhasil diambil',
        data: {
          topics: [],
          total: 0,
          include_sessions: include_sessions || false,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // FAQ ROUTES
  // ================================

  /**
   * GET /api/bootcamp-related/faqs/{bootcampId}
   * Mendapatkan semua FAQ untuk bootcamp
   */
  fastify.get(
    '/faqs/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mendapatkan semua FAQ untuk bootcamp',
        tags: ['Bootcamp FAQs'],
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;

      return {
        success: true,
        message: 'FAQ berhasil diambil',
        data: {
          faqs: [],
          total: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/bootcamp-related/faqs/search/{bootcampId}
   * Mencari FAQ berdasarkan keyword
   */
  fastify.get(
    '/faqs/search/:bootcampId',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Mencari FAQ berdasarkan keyword',
        tags: ['Bootcamp FAQs'],
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        querystring: {
          type: 'object',
          properties: {
            keyword: { type: 'string', minLength: 1 },
          },
          required: ['keyword'],
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;
      const { keyword } = request.query;

      return {
        success: true,
        message: 'Pencarian FAQ berhasil',
        data: {
          faqs: [],
          total: 0,
          keyword,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // INFO ENDPOINT
  // ================================

  /**
   * GET /api/bootcamp-related/info
   * Mendapatkan informasi tentang bootcamp related endpoints
   */
  fastify.get(
    '/info',
    {
      schema: {
        ...bootcampRelatedTag,
        summary: 'Informasi tentang bootcamp related endpoints',
        description: 'Endpoint untuk mendapatkan daftar semua endpoints yang tersedia',
      },
    },
    async (request, reply) => {
      return {
        success: true,
        message: 'Informasi bootcamp related endpoints',
        data: {
          description: 'Modul untuk mengelola semua entitas terkait bootcamp',
          version: '1.0.0',
          entities: [
            'Pricing (pricing tiers)',
            'Features (features dan benefits)',
            'Topics (curriculum topics)',
            'Sessions (sessions dalam setiap topic)',
            'FAQ (frequently asked questions)',
          ],
          endpoints: {
            combined: ['GET /api/bootcamp-related/all/{bootcampId}', 'GET /api/bootcamp-related/stats/{bootcampId}'],
            pricing: ['GET /api/bootcamp-related/pricing/{bootcampId}'],
            features: ['GET /api/bootcamp-related/features/{bootcampId}'],
            topics: ['GET /api/bootcamp-related/topics/{bootcampId}'],
            faqs: ['GET /api/bootcamp-related/faqs/{bootcampId}', 'GET /api/bootcamp-related/faqs/search/{bootcampId}'],
          },
          implementation_status: 'Partial - Basic endpoints ready, full controller implementation pending',
        },
        timestamp: new Date().toISOString(),
      };
    }
  );
}
