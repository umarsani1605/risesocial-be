import { FileUploadController } from '../../controllers/upload/fileUploadController.js';
import { fileUploadSchemas } from '../../schemas/fileUploadSchemas.js';
import { uploadEssay, uploadHeadshot } from '../../middleware/fileUploadMiddleware.js';
import { authMiddleware } from '../../middleware/auth.js';

/**
 * File Upload Routes
 * Handles all file upload related endpoints
 */
export async function fileUploadRoutes(fastify) {
  const fileUploadController = new FileUploadController();

  // Apply authentication middleware to all routes (optional for public uploads)
  // fastify.addHook('preHandler', authMiddleware);

  /**
   * Upload essay file (PDF only)
   * POST /api/uploads/essay
   */
  fastify.post('/essay', {
    schema: fileUploadSchemas.uploadEssay,
    preHandler: [uploadEssay],
    handler: async (request, reply) => {
      return fileUploadController.uploadEssay(request, reply);
    },
  });

  /**
   * Upload headshot file (Images only)
   * POST /api/uploads/headshot
   */
  fastify.post('/headshot', {
    schema: fileUploadSchemas.uploadHeadshot,
    preHandler: [uploadHeadshot],
    handler: async (request, reply) => {
      return fileUploadController.uploadHeadshot(request, reply);
    },
  });

  /**
   * Download/view file by ID
   * GET /api/uploads/:id
   */
  fastify.get('/:id', {
    schema: fileUploadSchemas.downloadFile,
    handler: async (request, reply) => {
      return fileUploadController.downloadFile(request, reply);
    },
  });

  /**
   * Get file information by ID
   * GET /api/uploads/:id/info
   */
  fastify.get('/:id/info', {
    schema: fileUploadSchemas.getFileInfo,
    handler: async (request, reply) => {
      return fileUploadController.getFileInfo(request, reply);
    },
  });

  /**
   * Delete file by ID
   * DELETE /api/uploads/:id
   * Note: Should be protected with authentication in production
   */
  fastify.delete('/:id', {
    schema: fileUploadSchemas.deleteFile,
    // preHandler: [authMiddleware], // Uncomment for authentication
    handler: async (request, reply) => {
      return fileUploadController.deleteFile(request, reply);
    },
  });

  /**
   * Get files by upload type with pagination
   * GET /api/uploads/type/:uploadType
   */
  fastify.get('/type/:uploadType', {
    schema: fileUploadSchemas.getFilesByType,
    handler: async (request, reply) => {
      return fileUploadController.getFilesByType(request, reply);
    },
  });

  /**
   * Get upload statistics
   * GET /api/uploads/stats
   * Note: Should be protected with admin authentication in production
   */
  fastify.get('/stats', {
    schema: fileUploadSchemas.getUploadStats,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return fileUploadController.getUploadStats(request, reply);
    },
  });

  /**
   * Upload service health check
   * GET /api/uploads/health
   */
  fastify.get('/health', {
    schema: fileUploadSchemas.healthCheck,
    handler: async (request, reply) => {
      return fileUploadController.healthCheck(request, reply);
    },
  });

  /**
   * Cleanup orphaned files
   * POST /api/uploads/cleanup
   * Note: Should be protected with admin authentication in production
   */
  fastify.post('/cleanup', {
    schema: fileUploadSchemas.cleanupOrphanedFiles,
    // preHandler: [authMiddleware], // Add admin role check
    handler: async (request, reply) => {
      return fileUploadController.cleanupOrphanedFiles(request, reply);
    },
  });

  // Add route logging
  fastify.addHook('onRoute', (routeOptions) => {
    console.log(`📁 File Upload Route: ${routeOptions.method} ${routeOptions.url}`);
  });
}
