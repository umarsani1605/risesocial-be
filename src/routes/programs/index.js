import { ProgramsController } from '../../controllers/programs/programsController.js';

const programsController = new ProgramsController();
import { authMiddleware } from '../../middleware/auth.js';
import {
  createProgramSchema,
  updateProgramSchema,
  searchProgramsSchema,
  featuredProgramsSchema,
  programIdSchema,
  adminSearchProgramsSchema,
} from '../../schemas/programsSchemas.js';

/**
 * Programs routes plugin
 * @param {Object} fastify - Fastify instance
 */
export async function programsRoutes(fastify) {
  const programsTag = { tags: ['Programs'] };

  // ================================
  // PUBLIC ROUTES
  // ================================

  // GET /api/programs - Get all programs with search and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...programsTag,
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            search: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'] },
            sortBy: { type: 'string', enum: ['createdAt', 'title', 'status'], default: 'createdAt' },
            sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
        },
      },
    },
    programsController.getPrograms.bind(programsController)
  );

  // GET /api/programs/featured - Get featured programs
  fastify.get(
    '/featured',
    {
      schema: {
        ...programsTag,
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 6 },
          },
        },
      },
    },
    programsController.getFeaturedPrograms.bind(programsController)
  );

  // GET /api/programs/:id - Get program by ID
  fastify.get(
    '/:id',
    {
      schema: {
        ...programsTag,
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
          required: ['id'],
        },
      },
    },
    programsController.getProgramById.bind(programsController)
  );

  // GET /api/programs/slug/:slug - Get program by slug
  fastify.get(
    '/slug/:slug',
    {
      schema: {
        ...programsTag,
        params: {
          type: 'object',
          properties: {
            slug: { type: 'string', minLength: 3 },
          },
          required: ['slug'],
        },
      },
    },
    programsController.getProgramBySlug.bind(programsController)
  );

  // ================================
  // ADMIN ROUTES (Protected)
  // ================================

  // Register protected routes
  fastify.register(async function (protectedRoutes) {
    // POST /api/programs - Create new program (Admin only)
    protectedRoutes.post(
      '/',
      {
        schema: {
          ...programsTag,
          body: {
            type: 'object',
            required: ['title', 'description', 'image'],
            properties: {
              title: { type: 'string', minLength: 3, maxLength: 255 },
              description: { type: 'string', minLength: 10 },
              image: { type: 'string', format: 'uri' },
              status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'DRAFT' },
            },
          },
        },
        preHandler: authMiddleware,
      },
      programsController.createProgram
    );

    // PUT /api/programs/:id - Update program (Admin only)
    protectedRoutes.put(
      '/:id',
      {
        schema: {
          ...programsTag,
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
              title: { type: 'string', minLength: 3, maxLength: 255 },
              description: { type: 'string', minLength: 10 },
              image: { type: 'string', format: 'uri' },
              status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'] },
            },
          },
        },
        preHandler: authMiddleware,
      },
      programsController.updateProgram
    );

    // DELETE /api/programs/:id - Delete program (Admin only)
    protectedRoutes.delete(
      '/:id',
      {
        schema: {
          ...programsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      programsController.deleteProgram
    );

    // GET /api/programs/admin/search - Admin search programs
    protectedRoutes.get(
      '/admin/search',
      {
        schema: {
          ...programsTag,
          querystring: {
            type: 'object',
            properties: {
              page: { type: 'integer', minimum: 1, default: 1 },
              limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              search: { type: 'string' },
              status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'DRAFT'] },
              sortBy: { type: 'string', enum: ['createdAt', 'title', 'status'], default: 'createdAt' },
              sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            },
          },
        },
        preHandler: authMiddleware,
      },
      programsController.adminSearchPrograms
    );

    // GET /api/programs/:id/statistics - Get program statistics (Admin only)
    protectedRoutes.get(
      '/:id/statistics',
      {
        schema: {
          ...programsTag,
          params: {
            type: 'object',
            properties: {
              id: { type: 'integer', minimum: 1 },
            },
            required: ['id'],
          },
        },
        preHandler: authMiddleware,
      },
      programsController.getProgramStatistics
    );

    // GET /api/programs/admin/statistics - Get all programs statistics (Admin only)
    protectedRoutes.get(
      '/admin/statistics',
      {
        schema: {
          ...programsTag,
        },
        preHandler: authMiddleware,
      },
      programsController.getAllProgramsStatistics
    );
  });
}

export default programsRoutes;
