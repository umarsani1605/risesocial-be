import { RylsRegistrationController } from '../../controllers/registration/rylsRegistrationController.js';
import { rylsRegistrationSchemas } from '../../schemas/rylsRegistrationSchemas.js';
import { authMiddleware } from '../../middleware/auth.js';

/**
 * RYLS Registration Routes
 * Handles all RYLS registration related endpoints
 */
export async function rylsRegistrationRoutes(fastify) {
  const registrationController = new RylsRegistrationController();

  /**
   * Submit fully funded registration
   * POST /api/registrations/fully-funded
   */
  fastify.post('/fully-funded', {
    // schema: rylsRegistrationSchemas.submitFullyFundedRegistration, // Temporarily disabled for debugging
    handler: async (request, reply) => {
      return registrationController.submitFullyFundedRegistration(request, reply);
    },
  });

  /**
   * Submit self funded registration
   * POST /api/registrations/self-funded
   */
  fastify.post('/self-funded', {
    // schema: rylsRegistrationSchemas.submitSelfFundedRegistration,
    handler: async (request, reply) => {
      return registrationController.submitSelfFundedRegistration(request, reply);
    },
  });

  /**
   * Get registration by submission ID
   * GET /api/registrations/submission/:submissionId
   */
  fastify.get('/submission/:submissionId', {
    schema: rylsRegistrationSchemas.getRegistrationBySubmissionId,
    handler: async (request, reply) => {
      return registrationController.getRegistrationBySubmissionId(request, reply);
    },
  });

  /**
   * Check if email exists
   * GET /api/registrations/check-email/:email
   */
  fastify.get('/check-email/:email', {
    schema: rylsRegistrationSchemas.checkEmailExists,
    handler: async (request, reply) => {
      return registrationController.checkEmailExists(request, reply);
    },
  });

  /**
   * Get registration statistics
   * GET /api/registrations/stats
   * Note: Should be protected with admin authentication in production
   */
  fastify.get('/stats', {
    schema: rylsRegistrationSchemas.getRegistrationStatistics,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return registrationController.getRegistrationStatistics(request, reply);
    },
  });

  /**
   * Get registrations by date range
   * GET /api/registrations/date-range
   * Note: Should be protected with admin authentication in production
   */
  fastify.get('/date-range', {
    schema: rylsRegistrationSchemas.getRegistrationsByDateRange,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return registrationController.getRegistrationsByDateRange(request, reply);
    },
  });

  /**
   * Export registrations to CSV
   * GET /api/registrations/export
   * Note: Should be protected with admin authentication in production
   */
  fastify.get('/export', {
    schema: rylsRegistrationSchemas.exportRegistrations,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return registrationController.exportRegistrations(request, reply);
    },
  });

  /**
   * Registration service health check
   * GET /api/registrations/health
   */
  fastify.get('/health', {
    schema: rylsRegistrationSchemas.healthCheck,
    handler: async (request, reply) => {
      return registrationController.healthCheck(request, reply);
    },
  });

  /**
   * Get all registrations with pagination and filters
   * GET /api/registrations
   * Note: Should be protected with admin authentication in production
   */
  fastify.get('/', {
    // schema: rylsRegistrationSchemas.getRegistrations, // Temporarily disabled for debugging
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      console.log('🔵 [RylsRoutes] GET /api/registrations called');
      console.log('📝 [RylsRoutes] Request query params:', request.query);
      try {
        const result = await registrationController.getRegistrations(request, reply);
        console.log('✅ [RylsRoutes] Controller completed successfully');
        return result;
      } catch (error) {
        console.error('❌ [RylsRoutes] Route handler error:', error);
        throw error;
      }
    },
  });

  /**
   * Get registration by ID
   * GET /api/registrations/:id
   * Note: Should be protected with admin authentication in production
   */
  fastify.get('/:id', {
    // schema: rylsRegistrationSchemas.getRegistrationById,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      console.log('🔵 [RylsRoutes] GET /api/registrations/:id called');
      console.log('📝 [RylsRoutes] Registration ID:', request.params.id);
      try {
        const result = await registrationController.getRegistrationById(request, reply);
        console.log('✅ [RylsRoutes] Controller completed successfully');
        return result;
      } catch (error) {
        console.error('❌ [RylsRoutes] Route handler error:', error);
        throw error;
      }
    },
  });

  /**
   * Update registration status
   * PATCH /api/registrations/:id/status
   * Note: Should be protected with admin authentication in production
   */
  fastify.patch('/:id/status', {
    // schema: rylsRegistrationSchemas.updateRegistrationStatus,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return registrationController.updateRegistrationStatus(request, reply);
    },
  });

  /**
   * Delete registration
   * DELETE /api/registrations/:id
   * Note: Should be protected with admin authentication in production
   */
  fastify.delete('/:id', {
    // schema: rylsRegistrationSchemas.deleteRegistration,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return registrationController.deleteRegistration(request, reply);
    },
  });

  // Add route logging
  fastify.addHook('onRoute', (routeOptions) => {
    console.log(`📋 Registration Route: ${routeOptions.method} ${routeOptions.url}`);
  });
}
