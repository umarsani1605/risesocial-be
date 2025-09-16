import { userFileUploadController } from '../../controllers/user/fileUploadController.js';
import { fileUploadSchemas } from '../../schemas/fileUploadSchemas.js';
import { uploadEssay, uploadHeadshot, uploadPaymentProof } from '../../middleware/fileUploadMiddleware.js';

/**
 * User File Upload Routes
 * Handles user file upload operations and basic file access
 */
export default async function userFileUploadRoutes(fastify) {
  const userUploadTag = { tags: ['User File Upload'] };

  /**
   * Upload essay file (PDF only)
   * POST /api/uploads/essay
   */
  fastify.post('/essay', {
    schema: { ...fileUploadSchemas.uploadEssay, ...userUploadTag },
    preHandler: [uploadEssay],
    handler: userFileUploadController.uploadEssay,
  });

  /**
   * Upload headshot file (Images only)
   * POST /api/uploads/headshot
   */
  fastify.post('/headshot', {
    schema: { ...fileUploadSchemas.uploadHeadshot, ...userUploadTag },
    preHandler: [uploadHeadshot],
    handler: userFileUploadController.uploadHeadshot,
  });

  /**
   * Upload payment proof file (Images only)
   * POST /api/uploads/payment-proof
   */
  fastify.post('/payment-proof', {
    schema: { ...fileUploadSchemas.uploadPaymentProof, ...userUploadTag },
    preHandler: [uploadPaymentProof],
    handler: userFileUploadController.uploadPaymentProof,
  });

  /**
   * Download/view file by ID
   * GET /api/uploads/:id
   */
  fastify.get('/:id', {
    schema: {
      description: 'Download/view file by ID',
      tags: ['User File Upload'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
        },
        required: ['id'],
      },
    },
    handler: userFileUploadController.downloadFile,
  });

  /**
   * Get file information by ID
   * GET /api/uploads/:id/info
   */
  fastify.get('/:id/info', {
    schema: { ...fileUploadSchemas.getFileInfo, ...userUploadTag },
    handler: userFileUploadController.getFileInfo,
  });

  /**
   * Get files by upload type with pagination
   * GET /api/uploads/type/:uploadType
   */
  fastify.get('/type/:uploadType', {
    schema: { ...fileUploadSchemas.getFilesByType, ...userUploadTag },
    handler: userFileUploadController.getFilesByType,
  });

  /**
   * Upload service health check
   * GET /api/uploads/health
   */
  fastify.get('/health', {
    schema: { ...fileUploadSchemas.healthCheck, ...userUploadTag },
    handler: userFileUploadController.healthCheck,
  });
}
