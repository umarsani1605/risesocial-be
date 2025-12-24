import { adminSystemSettingsController } from '../../controllers/admin/systemSettingsController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import {
  getAllSettingsSchema,
  getLinkedInRateLimitSchema,
  getSettingSchema,
  setSettingSchema,
  deleteSettingSchema,
} from '../../schemas/systemSettingsSchemas.js';

export default async function adminSystemSettingsRoutes(fastify) {
  fastify.addHook('preHandler', [authMiddleware, authorizeRoles(['ADMIN'])]);

  fastify.get('/', {
    schema: getAllSettingsSchema,
    handler: adminSystemSettingsController.getAllSettings,
  });

  fastify.get('/linkedin/rate-limit', {
    schema: getLinkedInRateLimitSchema,
    handler: adminSystemSettingsController.getLinkedInRateLimit,
  });

  fastify.get('/:key', {
    schema: getSettingSchema,
    handler: adminSystemSettingsController.getSetting,
  });

  fastify.put('/:key', {
    schema: setSettingSchema,
    handler: adminSystemSettingsController.setSetting,
  });

  fastify.delete('/:key', {
    schema: deleteSettingSchema,
    handler: adminSystemSettingsController.deleteSetting,
  });
}
