import { adminRylsRegistrationController } from '../../controllers/admin/rylsRegistrationController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';

export default async function adminRylsRegistrationRoutes(fastify) {
  const tag = { tags: ['Admin RYLS Registration'] };

  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/', {
    schema: {
      ...tag,
      description: 'Get all registrations (Admin only)',
      querystring: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          scholarshipType: { type: 'string', enum: ['FULLY_FUNDED', 'SELF_FUNDED'] },
        },
      },
    },
    preHandler: requirePermission('admin.ryls'),
    handler: adminRylsRegistrationController.getRegistrations,
  });

  fastify.get('/stats', {
    schema: { ...tag, description: 'Get registration statistics (Admin only)' },
    preHandler: requirePermission('admin.ryls'),
    handler: adminRylsRegistrationController.getRegistrationStatistics,
  });

  fastify.get('/date-range', {
    schema: {
      ...tag,
      description: 'Get registrations by date range (Admin only)',
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
        },
      },
    },
    preHandler: requirePermission('admin.ryls'),
    handler: adminRylsRegistrationController.getRegistrationsByDateRange,
  });

  fastify.get('/export', {
    schema: { ...tag, description: 'Export registrations (Admin only)' },
    preHandler: requirePermission('admin.ryls'),
    handler: adminRylsRegistrationController.exportRegistrations,
  });

  fastify.get('/export-excel', {
    schema: { ...tag, description: 'Export registrations to Excel (Admin only)' },
    preHandler: requirePermission('admin.ryls'),
    handler: adminRylsRegistrationController.exportRegistrationsExcel,
  });

  fastify.get('/:id', {
    schema: {
      ...tag,
      description: 'Get registration by ID (Admin only)',
      params: { type: 'object', properties: { id: { type: 'integer', minimum: 1 } }, required: ['id'] },
    },
    preHandler: requirePermission('admin.ryls'),
    handler: adminRylsRegistrationController.getRegistrationById,
  });

  fastify.delete('/:id', {
    schema: {
      ...tag,
      description: 'Delete registration (Admin only)',
      params: { type: 'object', properties: { id: { type: 'integer', minimum: 1 } }, required: ['id'] },
    },
    preHandler: requirePermission('admin.ryls', 'EDITOR'),
    handler: adminRylsRegistrationController.deleteRegistration,
  });
}
