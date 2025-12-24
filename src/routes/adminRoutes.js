import { adminController } from '../controllers/adminController.js';
import { uploadMiddleware } from '../middleware/fileUploadMiddleware.js';

export default async function adminRoutes(fastify) {
  fastify.post('/uploads/image', { preHandler: [uploadMiddleware] }, adminController.uploadImage);
}
