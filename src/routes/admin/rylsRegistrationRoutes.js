import { adminRylsRegistrationController } from '../../controllers/admin/rylsRegistrationController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import {
  getRegistrationsSchema,
  getRegistrationStatisticsSchema,
  getRegistrationsByDateRangeSchema,
  exportRegistrationsSchema,
  exportRegistrationsExcelSchema,
  getRegistrationByIdSchema,
  updateRegistrationStatusSchema,
  deleteRegistrationSchema,
} from '../../schemas/rylsRegistrationSchemas.js';

export default async function adminRylsRegistrationRoutes(fastify) {
  fastify.addHook('preHandler', [authMiddleware, authorizeRoles(['ADMIN'])]);

  fastify.get('/', {
    schema: getRegistrationsSchema,
    handler: adminRylsRegistrationController.getRegistrations,
  });

  fastify.get('/stats', {
    schema: getRegistrationStatisticsSchema,
    handler: adminRylsRegistrationController.getRegistrationStatistics,
  });

  fastify.get('/date-range', {
    schema: getRegistrationsByDateRangeSchema,
    handler: adminRylsRegistrationController.getRegistrationsByDateRange,
  });

  fastify.get('/export', {
    schema: exportRegistrationsSchema,
    handler: adminRylsRegistrationController.exportRegistrations,
  });

  fastify.get('/export-excel', {
    schema: exportRegistrationsExcelSchema,
    handler: adminRylsRegistrationController.exportRegistrationsExcel,
  });

  fastify.get('/:id', {
    schema: getRegistrationByIdSchema,
    handler: adminRylsRegistrationController.getRegistrationById,
  });

  fastify.patch('/:id/status', {
    schema: updateRegistrationStatusSchema,
    handler: adminRylsRegistrationController.updateRegistrationStatus,
  });

  fastify.delete('/:id', {
    schema: deleteRegistrationSchema,
    handler: adminRylsRegistrationController.deleteRegistration,
  });
}
