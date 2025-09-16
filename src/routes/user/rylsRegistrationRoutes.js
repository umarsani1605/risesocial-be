import { userRylsRegistrationController } from '../../controllers/user/rylsRegistrationController.js';
import { rylsRegistrationSchemas } from '../../schemas/rylsRegistrationSchemas.js';

/**
 * User RYLS Registration Routes
 * Handles user registration submissions and queries
 */
export default async function userRylsRegistrationRoutes(fastify) {
  const userRegistrationTag = { tags: ['User RYLS Registration'] };

  /**
   * Create registration
   * POST /api/ryls/registrations
   */
  fastify.post('/', {
    schema: { ...rylsRegistrationSchemas.createRegistration, ...userRegistrationTag },
    handler: userRylsRegistrationController.createRegistration,
  });

  /**
   * Submit fully funded registration
   * POST /api/ryls/registrations/fully-funded
   */
  fastify.post('/fully-funded', {
    schema: { ...rylsRegistrationSchemas.submitFullyFundedRegistration, ...userRegistrationTag },
    handler: userRylsRegistrationController.submitFullyFundedRegistration,
  });

  /**
   * Submit self funded registration
   * POST /api/ryls/registrations/self-funded
   */
  fastify.post('/self-funded', {
    schema: { ...rylsRegistrationSchemas.submitSelfFundedRegistration, ...userRegistrationTag },
    handler: userRylsRegistrationController.submitSelfFundedRegistration,
  });

  /**
   * Get registration by submission ID
   * GET /api/ryls/registrations/submission/:submissionId
   */
  fastify.get('/submission/:submissionId', {
    schema: { ...rylsRegistrationSchemas.getRegistrationBySubmissionId, ...userRegistrationTag },
    handler: userRylsRegistrationController.getRegistrationBySubmissionId,
  });

  /**
   * Check if email exists in registrations
   * GET /api/ryls/registrations/check-email/:email
   */
  fastify.get('/check-email/:email', {
    schema: {
      description: 'Check if email exists in registrations',
      tags: ['User RYLS Registration'],
      params: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
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
                exists: { type: 'boolean' },
                email: { type: 'string' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: userRylsRegistrationController.checkEmailExists,
  });

  /**
   * Health check for registration service
   * GET /api/ryls/registrations/health
   */
  fastify.get('/health', {
    schema: {
      description: 'Health check for registration service',
      tags: ['User RYLS Registration'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                timestamp: { type: 'string' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: userRylsRegistrationController.healthCheck,
  });
}
