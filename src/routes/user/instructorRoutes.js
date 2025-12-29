import { userInstructorController } from '../../controllers/user/instructorController.js';

export default async function userInstructorRoutes(fastify) {
  const instructorTag = { tags: ['User Instructors'] };

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
            include_academies: { type: 'boolean', default: false },
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

  fastify.get(
    '/academy/:academyId',
    {
      schema: {
        ...instructorTag,
        description: 'Get instructors by academy ID',
        params: {
          type: 'object',
          properties: {
            academyId: { type: 'integer', minimum: 1 },
          },
          required: ['academyId'],
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
    userInstructorController.getInstructorsByAcademyId
  );

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
            include_academies: { type: 'boolean', default: false },
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

  fastify.get(
    '/:instructorId/academies',
    {
      schema: {
        ...instructorTag,
        description: 'Get academies by instructor ID',
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
    userInstructorController.getAcademiesByInstructorId
  );
}
