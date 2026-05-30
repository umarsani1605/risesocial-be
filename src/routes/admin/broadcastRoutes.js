import { adminBroadcastController } from '../../controllers/admin/broadcastController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';
import {
  getSendersSchema,
  getSegmentCountsSchema,
  previewRecipientsSchema,
  createBroadcastSchema,
  listBroadcastsSchema,
  getBroadcastByIdSchema,
  uploadBroadcastImageSchema,
  refreshStatsSchema,
} from '../../schemas/admin/broadcastSchemas.js';

const uploadBroadcastImage = createUploadMiddleware('broadcast_image');

const VIEW = requirePermission('admin.broadcast');
const EDIT = requirePermission('admin.broadcast', 'EDITOR');

export default async function broadcastRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/senders', { schema: getSendersSchema, preHandler: VIEW, handler: adminBroadcastController.getSenders });
  fastify.get('/segment-counts', { schema: getSegmentCountsSchema, preHandler: VIEW, handler: adminBroadcastController.getSegmentCounts });
  fastify.post('/preview-recipients', { schema: previewRecipientsSchema, preHandler: VIEW, handler: adminBroadcastController.previewRecipients });
  fastify.post('/', { schema: createBroadcastSchema, preHandler: EDIT, handler: adminBroadcastController.createBroadcast });
  fastify.post('/images', { schema: uploadBroadcastImageSchema, preValidation: [uploadBroadcastImage], preHandler: EDIT, handler: adminBroadcastController.uploadImage });
  fastify.get('/', { schema: listBroadcastsSchema, preHandler: VIEW, handler: adminBroadcastController.listBroadcasts });
  fastify.get('/:id', { schema: getBroadcastByIdSchema, preHandler: VIEW, handler: adminBroadcastController.getBroadcastById });
  fastify.post('/:id/refresh-stats', { schema: refreshStatsSchema, preHandler: EDIT, handler: adminBroadcastController.refreshStats });
}
