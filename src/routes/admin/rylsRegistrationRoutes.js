import { adminRylsRegistrationController } from '../../controllers/admin/rylsRegistrationController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import {
  getAllRegistrationsSchema,
  getRegistrationStatisticsSchema,
  exportRegistrationsSchema,
  getRegistrationByIdSchema,
  updateRegistrationStatusSchema,
  deleteRegistrationSchema,
} from '../../schemas/admin/rylsRegistrationSchemas.js';

export default async function adminRylsRegistrationRoutes(fastify) {
  const adminRegistrationTag = { tags: ['Admin RYLS Registration'] };

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', {
    schema: {
      ...adminRegistrationTag,
      description: 'Get all registrations (Admin only)',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
          status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'] },
        },
      },
    },
    handler: adminRylsRegistrationController.getRegistrations,
  });

  fastify.get('/stats', {
    schema: {
      ...adminRegistrationTag,
      description: 'Get registration statistics (Admin only)',
    },
    handler: adminRylsRegistrationController.getRegistrationStatistics,
  });

  fastify.get('/date-range', {
    schema: {
      ...adminRegistrationTag,
      description: 'Get registrations by date range (Admin only)',
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
        },
      },
    },
    handler: adminRylsRegistrationController.getRegistrationsByDateRange,
  });

  fastify.get('/export', {
    schema: {
      ...adminRegistrationTag,
      description: 'Export registrations (Admin only)',
    },
    handler: adminRylsRegistrationController.exportRegistrations,
  });

  fastify.get('/export-excel', {
    schema: {
      ...adminRegistrationTag,
      description: 'Export registrations to Excel (Admin only)',
    },
    handler: adminRylsRegistrationController.exportRegistrationsExcel,
  });

  fastify.get('/:id', {
    schema: {
      ...adminRegistrationTag,
      description: 'Get registration by ID (Admin only)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
        required: ['id'],
      },
    },
    handler: adminRylsRegistrationController.getRegistrationById,
  });

  fastify.patch('/:id/status', {
    schema: {
      ...adminRegistrationTag,
      description: 'Update registration status (Admin only)',
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
    },
    handler: adminRylsRegistrationController.updateRegistrationStatus,
  });

  fastify.delete('/:id', {
    schema: {
      ...adminRegistrationTag,
      description: 'Delete registration (Admin only)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
        required: ['id'],
      },
    },
    handler: adminRylsRegistrationController.deleteRegistration,
  });
}
