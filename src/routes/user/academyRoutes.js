import { userAcademyController } from '../../controllers/user/academyController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import { getAllAcademiesSchema, getAcademyBySlugSchema } from '../../schemas/shared/academySchemas.js';

export default async function userAcademyRoutes(fastify) {
  fastify.get('/', {
    schema: getAllAcademiesSchema,
    preHandler: optionalAuthMiddleware,
    handler: userAcademyController.getAcademys,
  });

  fastify.get('/:slug', {
    schema: getAcademyBySlugSchema,
    preHandler: optionalAuthMiddleware,
    handler: userAcademyController.getAcademyBySlug,
  });

  // Sub-tables endpoints
  fastify.get('/pricing', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all pricing tiers',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
        },
      },
    },
    handler: userAcademyController.getAllPricing,
  });

  fastify.get('/features', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all features',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
        },
      },
    },
    handler: userAcademyController.getAllFeatures,
  });

  fastify.get('/instructors', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all instructors',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
        },
      },
    },
    handler: userAcademyController.getAllInstructors,
  });

  fastify.get('/themes', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all themes',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
          include_topics: { type: 'string', enum: ['true', 'false'] },
        },
      },
    },
    handler: userAcademyController.getAllThemes,
  });

  fastify.get('/topics', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all topics',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
          theme_id: { type: 'integer' },
        },
      },
    },
    handler: userAcademyController.getAllTopics,
  });

  fastify.get('/testimonials', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all testimonials',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
        },
      },
    },
    handler: userAcademyController.getAllTestimonials,
  });

  fastify.get('/faqs', {
    schema: {
      tags: ['User Academies'],
      summary: 'Get all FAQs',
      querystring: {
        type: 'object',
        properties: {
          academy_id: { type: 'integer' },
        },
      },
    },
    handler: userAcademyController.getAllFaqs,
  });
}
