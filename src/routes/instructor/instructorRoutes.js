/**
 * Instructor Routes Plugin
 *
 * Routes untuk mengelola instructor dan hubungan dengan bootcamp:
 * - CRUD instructor
 * - Assignment instructor ke bootcamp
 * - Management instructor-bootcamp relationships
 * - Statistics dan overview
 *
 * Note: Controller dan service menggunakan CommonJS pattern.
 * Routes ini bertindak sebagai bridge antara ES6 modules dan CommonJS.
 */

/**
 * Instructor routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function instructorRoutes(fastify) {
  const instructorTag = { tags: ['Instructors'] };
  const assignmentTag = { tags: ['Instructor Assignments'] };

  // Note: Karena controller menggunakan CommonJS, kita perlu temporary implementation
  // atau convert ke ES6 modules. Untuk sekarang, kita buat temporary handlers.

  // ================================
  // INSTRUCTOR CRUD ROUTES
  // ================================

  /**
   * GET /api/instructors
   * Mendapatkan semua instructor dengan pagination
   */
  fastify.get(
    '/',
    {
      schema: {
        ...instructorTag,
        summary: 'Mendapatkan semua instructor dengan pagination',
        description: 'Endpoint untuk mengambil daftar instructor dengan pagination dan filtering',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string', minLength: 1, maxLength: 100 },
            include_bootcamps: { type: 'boolean', default: false },
          },
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
                  data: { type: 'array' },
                  meta: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' },
                      hasNext: { type: 'boolean' },
                      hasPrev: { type: 'boolean' },
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
      const { page = 1, limit = 10, search, include_bootcamps = false } = request.query;

      return {
        success: true,
        message: 'Instructor berhasil diambil',
        data: {
          data: [],
          meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/instructors/{id}
   * Mendapatkan instructor berdasarkan ID
   */
  fastify.get(
    '/:id',
    {
      schema: {
        ...instructorTag,
        summary: 'Mendapatkan instructor berdasarkan ID',
        description: 'Endpoint untuk mengambil detail instructor berdasarkan ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        querystring: {
          type: 'object',
          properties: {
            include_bootcamps: { type: 'boolean', default: false },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      return {
        success: true,
        message: 'Instructor berhasil diambil',
        data: {
          id: parseInt(id),
          name: `Instructor ${id}`,
          job_title: null,
          avatar_url: null,
          description: null,
          profile_completeness: 25,
          experience_level: 'Unknown',
          instructor_type: 'General',
          bootcamp_count: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * POST /api/instructors
   * Membuat instructor baru
   */
  fastify.post(
    '/',
    {
      schema: {
        ...instructorTag,
        summary: 'Membuat instructor baru',
        description: 'Endpoint untuk membuat instructor baru',
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 255 },
            job_title: { type: 'string', maxLength: 255 },
            avatar_url: { type: 'string', format: 'uri', maxLength: 500 },
            description: { type: 'string', maxLength: 2000 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      reply.code(201);
      return {
        success: true,
        message: 'Instructor berhasil dibuat',
        data: {
          id: Math.floor(Math.random() * 1000),
          ...request.body,
          profile_completeness: 25,
          experience_level: 'Unknown',
          instructor_type: 'General',
          bootcamp_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * PUT /api/instructors/{id}
   * Update instructor
   */
  fastify.put(
    '/:id',
    {
      schema: {
        ...instructorTag,
        summary: 'Update instructor',
        description: 'Endpoint untuk mengupdate data instructor',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 255 },
            job_title: { type: 'string', maxLength: 255 },
            avatar_url: { type: 'string', format: 'uri', maxLength: 500 },
            description: { type: 'string', maxLength: 2000 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      return {
        success: true,
        message: 'Instructor berhasil diupdate',
        data: {
          id: parseInt(id),
          ...request.body,
          updated_at: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * DELETE /api/instructors/{id}
   * Menghapus instructor
   */
  fastify.delete(
    '/:id',
    {
      schema: {
        ...instructorTag,
        summary: 'Menghapus instructor',
        description: 'Endpoint untuk menghapus instructor',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return {
        success: true,
        message: 'Instructor berhasil dihapus',
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // SEARCH & FILTER ROUTES
  // ================================

  /**
   * GET /api/instructors/search
   * Mencari instructor berdasarkan nama
   */
  fastify.get(
    '/search',
    {
      schema: {
        ...instructorTag,
        summary: 'Mencari instructor berdasarkan nama',
        description: 'Endpoint untuk mencari instructor berdasarkan nama',
        querystring: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
          },
        },
      },
    },
    async (request, reply) => {
      const { name } = request.query;

      return {
        success: true,
        message: 'Pencarian instructor berhasil',
        data: {
          instructors: [],
          total: 0,
          search_query: name,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/instructors/popular
   * Mendapatkan instructor terpopuler
   */
  fastify.get(
    '/popular',
    {
      schema: {
        ...instructorTag,
        summary: 'Mendapatkan instructor terpopuler',
        description: 'Endpoint untuk mengambil instructor terpopuler berdasarkan jumlah bootcamp',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    async (request, reply) => {
      const { limit = 10 } = request.query;

      return {
        success: true,
        message: 'Instructor terpopuler berhasil diambil',
        data: {
          instructors: [],
          total: 0,
          limit: parseInt(limit),
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // BOOTCAMP ASSOCIATION ROUTES
  // ================================

  /**
   * GET /api/instructors/bootcamp/{bootcampId}
   * Mendapatkan instructor untuk bootcamp tertentu
   */
  fastify.get(
    '/bootcamp/:bootcampId',
    {
      schema: {
        ...assignmentTag,
        summary: 'Mendapatkan instructor untuk bootcamp tertentu',
        description: 'Endpoint untuk mengambil daftar instructor yang di-assign ke bootcamp',
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
        message: 'Instructor bootcamp berhasil diambil',
        data: {
          instructors: [],
          total: 0,
          bootcamp_id: parseInt(bootcampId),
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/instructors/{instructorId}/bootcamps
   * Mendapatkan bootcamp yang diajar oleh instructor
   */
  fastify.get(
    '/:instructorId/bootcamps',
    {
      schema: {
        ...assignmentTag,
        summary: 'Mendapatkan bootcamp yang diajar oleh instructor',
        description: 'Endpoint untuk mengambil daftar bootcamp yang diajar oleh instructor',
        params: {
          type: 'object',
          properties: {
            instructorId: { type: 'integer', minimum: 1 },
          },
          required: ['instructorId'],
        },
      },
    },
    async (request, reply) => {
      const { instructorId } = request.params;

      return {
        success: true,
        message: 'Bootcamp instructor berhasil diambil',
        data: {
          bootcamps: [],
          total: 0,
          instructor_id: parseInt(instructorId),
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/instructors/available/{bootcampId}
   * Mendapatkan instructor yang tersedia untuk bootcamp
   */
  fastify.get(
    '/available/:bootcampId',
    {
      schema: {
        ...assignmentTag,
        summary: 'Mendapatkan instructor yang tersedia untuk bootcamp',
        description: 'Endpoint untuk mengambil daftar instructor yang belum di-assign ke bootcamp',
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
        message: 'Instructor tersedia berhasil diambil',
        data: {
          instructors: [],
          total: 0,
          bootcamp_id: parseInt(bootcampId),
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // ASSIGNMENT MANAGEMENT ROUTES
  // ================================

  /**
   * POST /api/instructors/assign/{bootcampId}
   * Assign instructor ke bootcamp
   */
  fastify.post(
    '/assign/:bootcampId',
    {
      schema: {
        ...assignmentTag,
        summary: 'Assign instructor ke bootcamp',
        description: 'Endpoint untuk meng-assign instructor ke bootcamp',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        body: {
          type: 'object',
          required: ['instructor_id'],
          properties: {
            instructor_id: { type: 'integer', minimum: 1 },
            instructor_order: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;
      const { instructor_id, instructor_order } = request.body;

      reply.code(201);
      return {
        success: true,
        message: 'Instructor berhasil di-assign ke bootcamp',
        data: {
          bootcamp_id: parseInt(bootcampId),
          instructor_id,
          instructor_order: instructor_order || 1,
          assignment_type: 'Primary Instructor',
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * DELETE /api/instructors/remove/{bootcampId}/{instructorId}
   * Remove instructor dari bootcamp
   */
  fastify.delete(
    '/remove/:bootcampId/:instructorId',
    {
      schema: {
        ...assignmentTag,
        summary: 'Remove instructor dari bootcamp',
        description: 'Endpoint untuk meng-remove instructor dari bootcamp',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
            instructorId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId', 'instructorId'],
        },
      },
    },
    async (request, reply) => {
      return {
        success: true,
        message: 'Instructor berhasil di-remove dari bootcamp',
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * POST /api/instructors/reorder/{bootcampId}
   * Reorder instructor dalam bootcamp
   */
  fastify.post(
    '/reorder/:bootcampId',
    {
      schema: {
        ...assignmentTag,
        summary: 'Reorder instructor dalam bootcamp',
        description: 'Endpoint untuk mengubah urutan instructor dalam bootcamp',
        params: {
          type: 'object',
          properties: {
            bootcampId: { type: 'integer', minimum: 1 },
          },
          required: ['bootcampId'],
        },
        body: {
          type: 'object',
          required: ['order_data'],
          properties: {
            order_data: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['instructor_id', 'instructor_order'],
                properties: {
                  instructor_id: { type: 'integer', minimum: 1 },
                  instructor_order: { type: 'integer', minimum: 1 },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { bootcampId } = request.params;
      const { order_data } = request.body;

      return {
        success: true,
        message: 'Instructor berhasil diurutkan ulang',
        data: order_data.map((item) => ({
          ...item,
          bootcamp_id: parseInt(bootcampId),
        })),
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // STATISTICS & OVERVIEW ROUTES
  // ================================

  /**
   * GET /api/instructors/stats
   * Mendapatkan statistik instructor
   */
  fastify.get(
    '/stats',
    {
      schema: {
        ...instructorTag,
        summary: 'Mendapatkan statistik instructor',
        description: 'Endpoint untuk mengambil statistik lengkap instructor dan assignments',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  total_instructors: { type: 'integer' },
                  instructors_with_avatar: { type: 'integer' },
                  instructors_with_description: { type: 'integer' },
                  instructors_with_job_title: { type: 'integer' },
                  total_bootcamp_associations: { type: 'integer' },
                  profile_completion_rate: { type: 'integer' },
                  engagement_score: { type: 'integer' },
                },
              },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return {
        success: true,
        message: 'Statistik instructor berhasil diambil',
        data: {
          total_instructors: 0,
          instructors_with_avatar: 0,
          instructors_with_description: 0,
          instructors_with_job_title: 0,
          total_bootcamp_associations: 0,
          profile_completion_rate: 0,
          engagement_score: 0,
          most_active_instructor: null,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  /**
   * GET /api/instructors/overview/{instructorId}
   * Overview instructor dengan bootcamp
   */
  fastify.get(
    '/overview/:instructorId',
    {
      schema: {
        ...instructorTag,
        summary: 'Overview instructor dengan bootcamp',
        description: 'Endpoint untuk mengambil overview lengkap instructor dan bootcamp yang diajar',
        params: {
          type: 'object',
          properties: {
            instructorId: { type: 'integer', minimum: 1 },
          },
          required: ['instructorId'],
        },
        querystring: {
          type: 'object',
          properties: {
            include_details: { type: 'boolean', default: false },
          },
        },
      },
    },
    async (request, reply) => {
      const { instructorId } = request.params;

      return {
        success: true,
        message: 'Overview instructor-bootcamp berhasil diambil',
        data: {
          instructor: {
            id: parseInt(instructorId),
            name: `Instructor ${instructorId}`,
            profile_completeness: 25,
            experience_level: 'Unknown',
            instructor_type: 'General',
          },
          bootcamps: {
            data: [],
            total: 0,
            active_count: 0,
            categories: [],
          },
          summary: {
            total_bootcamps: 0,
            profile_completeness: 25,
            experience_level: 'Unknown',
            instructor_type: 'General',
            expertise_areas: [],
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ================================
  // INFO ENDPOINT
  // ================================

  /**
   * GET /api/instructors/info
   * Informasi tentang instructor endpoints
   */
  fastify.get(
    '/info',
    {
      schema: {
        ...instructorTag,
        summary: 'Informasi tentang instructor endpoints',
        description: 'Endpoint untuk mendapatkan daftar semua endpoints yang tersedia',
      },
    },
    async (request, reply) => {
      return {
        success: true,
        message: 'Informasi instructor endpoints',
        data: {
          description: 'Modul untuk mengelola instructor dan assignment ke bootcamp',
          version: '1.0.0',
          features: [
            'CRUD instructor',
            'Search dan filtering instructor',
            'Assignment instructor ke bootcamp',
            'Batch operations',
            'Statistics dan analytics',
            'Overview dan reporting',
          ],
          endpoints: {
            crud: [
              'GET /api/instructors - List instructor dengan pagination',
              'GET /api/instructors/{id} - Detail instructor',
              'POST /api/instructors - Buat instructor baru',
              'PUT /api/instructors/{id} - Update instructor',
              'DELETE /api/instructors/{id} - Hapus instructor',
            ],
            search: ['GET /api/instructors/search - Cari berdasarkan nama', 'GET /api/instructors/popular - Instructor terpopuler'],
            assignments: [
              'GET /api/instructors/bootcamp/{bootcampId} - Instructor by bootcamp',
              'GET /api/instructors/{instructorId}/bootcamps - Bootcamp by instructor',
              'GET /api/instructors/available/{bootcampId} - Available instructors',
              'POST /api/instructors/assign/{bootcampId} - Assign instructor',
              'DELETE /api/instructors/remove/{bootcampId}/{instructorId} - Remove instructor',
              'POST /api/instructors/reorder/{bootcampId} - Reorder instructors',
            ],
            analytics: ['GET /api/instructors/stats - Statistik instructor', 'GET /api/instructors/overview/{instructorId} - Overview instructor'],
          },
          implementation_status: 'Partial - Basic endpoints ready, full controller implementation pending',
        },
        timestamp: new Date().toISOString(),
      };
    }
  );
}
