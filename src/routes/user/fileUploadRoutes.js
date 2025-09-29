import { fileUploadController } from '../../controllers/guest/fileUploadController.js';
import { uploadEssay, uploadHeadshot, uploadPaymentProof } from '../../middleware/fileUploadMiddleware.js';

/**
 * User File Upload Routes
 * Handles user file upload operations and basic file access
 */
export default async function userFileUploadRoutes(fastify) {
  const userUploadTag = { tags: ['User File Upload'] };

  /**
   * Upload headshot file (Images only)
   * POST /api/uploads/headshot
   */
  fastify.post(
    '/headshot',
    {
      preHandler: [uploadHeadshot],
    },
    fileUploadController.uploadHeadshot
  );

  /**
   * Upload payment proof file (Images only)
   * POST /uploads/payment-proof
   */
  fastify.post(
    '/payment-proof',
    {
      preHandler: [uploadPaymentProof],
    },
    fileUploadController.uploadPaymentProof
  );

  /**
   * Download/view file by ID
   * GET /api/uploads/:id
   */
  fastify.get(
    '/:id',
    {
      // schema dihapus
    },
    fileUploadController.downloadFile
  );

  /**
   * Get file information by ID
   * GET /api/uploads/:id/info
   */
  fastify.get(
    '/:id/info',
    {
      // schema dihapus
    },
    fileUploadController.getFileInfo
  );

  /**
   * Get files by upload type with pagination
   * GET /api/uploads/type/:uploadType
   */
  fastify.get(
    '/type/:uploadType',
    {
      // schema dihapus
    },
    fileUploadController.getFilesByType
  );

  /**
   * Upload service health check
   * GET /api/uploads/health
   */
  fastify.get(
    '/health',
    {
      // schema dihapus
    },
    fileUploadController.healthCheck
  );
}
