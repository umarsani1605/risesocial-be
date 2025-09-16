import { userInstructorController } from '../../controllers/user/instructorController.js';

/**
 * User Instructor routes plugin
 * @param {Object} fastify - Fastify instance
 */
export default async function userInstructorRoutes(fastify) {
  const instructorTag = { tags: ['User Instructors'] };

  // GET /api/instructors - Get all instructors with pagination and filtering
  fastify.get(
    '/',
    {
      schema: {
        ...instructorTag,
        description: 'Get all instructors with pagination and filtering',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            search: { type: 'string' },
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
        },
      },
    },
    userInstructorController.getAllInstructors
  );

  // GET /api/instructors/search - Search instructors by name
  fastify.get(
    '/search',
    {
      schema: {
        ...instructorTag,
        description: 'Search instructors by name',
        querystring: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1 },
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
    userInstructorController.searchInstructorByName
  );

  // GET /api/instructors/popular - Get popular instructors
  fastify.get(
    '/popular',
    {
      schema: {
        ...instructorTag,
        description: 'Get popular instructors',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
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
    userInstructorController.getPopularInstructors
  );

  // GET /api/instructors/by-job-title - Get instructors by job title
  fastify.get(
    '/by-job-title',
    {
      schema: {
        ...instructorTag,
        description: 'Get instructors by job title',
        querystring: {
          type: 'object',
          required: ['job_title'],
          properties: {
            job_title: { type: 'string', minLength: 1 },
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
    userInstructorController.getInstructorsByJobTitle
  );

  // GET /api/instructors/bootcamp/:bootcampId - Get instructors by bootcamp ID
  fastify.get(
    '/bootcamp/:bootcampId',
    {
      schema: {
        ...instructorTag,
        description: 'Get instructors by bootcamp ID',
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
              data: { type: 'object' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    userInstructorController.getInstructorsByBootcampId
  );

  // GET /api/instructors/:id - Get instructor by ID
  fastify.get(
    '/:id',
    {
      schema: {
        ...instructorTag,
        description: 'Get instructor by ID',
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
    userInstructorController.getInstructorById
  );

  // GET /api/instructors/:instructorId/bootcamps - Get bootcamps by instructor ID
  fastify.get(
    '/:instructorId/bootcamps',
    {
      schema: {
        ...instructorTag,
        description: 'Get bootcamps by instructor ID',
        params: {
          type: 'object',
          properties: {
            instructorId: { type: 'integer', minimum: 1 },
          },
          required: ['instructorId'],
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
    userInstructorController.getBootcampsByInstructorId
  );
}
