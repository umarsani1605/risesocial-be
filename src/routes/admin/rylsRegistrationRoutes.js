import { adminRylsRegistrationController } from '../../controllers/admin/rylsRegistrationController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import { rylsRegistrationSchemas } from '../../schemas/rylsRegistrationSchemas.js';

/**
 * Admin RYLS Registration Routes
 * Handles admin management and monitoring of registrations
 */
export default async function adminRylsRegistrationRoutes(fastify) {
  const adminRegistrationTag = { tags: ['Admin RYLS Registration'] };

  /**
   * Get all registrations with pagination and filters (Admin only)
   * GET /api/admin/ryls/registrations
   */
  fastify.get('/', {
    schema: {
      description: 'Get all registrations with pagination and filters (Admin only)',
      tags: ['Admin RYLS Registration'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'] },
          registrationType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
          sortBy: { type: 'string', default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          search: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
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
                registrations: { type: 'array' },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    pages: { type: 'integer' },
                  },
                },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.getRegistrations,
  });

  /**
   * Get registration by ID (Admin only)
   * GET /api/admin/ryls/registrations/:id
   */
  fastify.get('/:id', {
    schema: {
      description: 'Get registration by ID (Admin only)',
      tags: ['Admin RYLS Registration'],
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
            data: { type: 'object' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.getRegistrationById,
  });

  /**
   * Update registration status (Admin only)
   * PATCH /api/admin/ryls/registrations/:id/status
   */
  fastify.patch('/:id/status', {
    schema: {
      description: 'Update registration status (Admin only)',
      tags: ['Admin RYLS Registration'],
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
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'] },
          notes: { type: 'string' },
        },
        required: ['status'],
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
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.updateRegistrationStatus,
  });

  /**
   * Delete registration (Admin only)
   * DELETE /api/admin/ryls/registrations/:id
   */
  fastify.delete('/:id', {
    schema: {
      description: 'Delete registration (Admin only)',
      tags: ['Admin RYLS Registration'],
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
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.deleteRegistration,
  });

  /**
   * Get registration statistics (Admin only)
   * GET /api/admin/ryls/registrations/stats
   */
  fastify.get('/stats', {
    schema: {
      description: 'Get registration statistics (Admin only)',
      tags: ['Admin RYLS Registration'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                byStatus: { type: 'object' },
                byType: { type: 'object' },
                recent: { type: 'array' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.getRegistrationStatistics,
  });

  /**
   * Get registrations by date range (Admin only)
   * GET /api/admin/ryls/registrations/date-range
   */
  fastify.get('/date-range', {
    schema: {
      description: 'Get registrations by date range (Admin only)',
      tags: ['Admin RYLS Registration'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
        },
        required: ['startDate', 'endDate'],
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
                registrations: { type: 'array' },
                pagination: { type: 'object' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.getRegistrationsByDateRange,
  });

  /**
   * Export registrations (Admin only)
   * GET /api/admin/ryls/registrations/export
   */
  fastify.get('/export', {
    schema: {
      description: 'Export registrations (Admin only)',
      tags: ['Admin RYLS Registration'],
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['csv', 'json'], default: 'csv' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'] },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.exportRegistrations,
  });

  /**
   * Export registrations to Excel (Admin only)
   * GET /api/admin/ryls/registrations/export-excel
   */
  fastify.get('/export-excel', {
    schema: {
      description: 'Export registrations to Excel (Admin only)',
      tags: ['Admin RYLS Registration'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'] },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminRylsRegistrationController.exportRegistrationsExcel,
  });
}
