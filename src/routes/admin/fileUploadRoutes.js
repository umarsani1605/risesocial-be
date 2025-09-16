import { adminFileUploadController } from '../../controllers/admin/fileUploadController.js';
import { authMiddleware, authorizeRoles } from '../../middleware/auth.js';
import { fileUploadSchemas } from '../../schemas/fileUploadSchemas.js';
import { uploadBootcampImage } from '../../middleware/fileUploadMiddleware.js';

/**
 * Admin File Upload Routes
 * Handles admin file management, statistics, and cleanup operations
 */
export default async function adminFileUploadRoutes(fastify) {
  const adminUploadTag = { tags: ['Admin File Upload'] };

  /**
   * Get all files with advanced filtering and pagination (Admin only)
   * GET /api/admin/uploads
   */
  fastify.get('/', {
    schema: {
      description: 'Get all files with advanced filtering and pagination (Admin only)',
      tags: ['Admin File Upload'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          uploadType: { type: 'string', enum: ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'BOOTCAMP_IMAGE'] },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          search: { type: 'string' },
          sortBy: { type: 'string', default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          minSize: { type: 'integer', minimum: 0 },
          maxSize: { type: 'integer', minimum: 0 },
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
                files: { type: 'array' },
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
    handler: adminFileUploadController.getAllFiles,
  });

  /**
   * Delete file by ID (Admin only)
   * DELETE /api/admin/uploads/:id
   */
  fastify.delete('/:id', {
    schema: { ...fileUploadSchemas.deleteFile, ...adminUploadTag },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.deleteFile,
  });

  /**
   * Get upload statistics (Admin only)
   * GET /api/admin/uploads/stats
   */
  fastify.get('/stats', {
    schema: {
      description: 'Get upload statistics (Admin only)',
      tags: ['Admin File Upload'],
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          uploadType: { type: 'string', enum: ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'BOOTCAMP_IMAGE'] },
          groupBy: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' },
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
                totalFiles: { type: 'integer' },
                totalSize: { type: 'integer' },
                byType: { type: 'object' },
                byDate: { type: 'array' },
                averageFileSize: { type: 'number' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.getUploadStats,
  });

  /**
   * Cleanup orphaned files (Admin only)
   * POST /api/admin/uploads/cleanup
   */
  fastify.post('/cleanup', {
    schema: {
      description: 'Cleanup orphaned files (Admin only)',
      tags: ['Admin File Upload'],
      body: {
        type: 'object',
        properties: {
          dryRun: { type: 'boolean', default: true },
          olderThanDays: { type: 'integer', minimum: 1, default: 7 },
          uploadTypes: {
            type: 'array',
            items: { type: 'string', enum: ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF'] },
            default: [],
          },
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
                filesFound: { type: 'integer' },
                filesDeleted: { type: 'integer' },
                spaceSaved: { type: 'integer' },
                dryRun: { type: 'boolean' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.cleanupOrphanedFiles,
  });

  /**
   * Get file usage statistics by type (Admin only)
   * GET /api/admin/uploads/usage-stats
   */
  fastify.get('/usage-stats', {
    schema: {
      description: 'Get file usage statistics by type (Admin only)',
      tags: ['Admin File Upload'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                byType: { type: 'object' },
                totalFiles: { type: 'integer' },
                totalSize: { type: 'integer' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.getUsageStats,
  });

  /**
   * Get storage usage information (Admin only)
   * GET /api/admin/uploads/storage-info
   */
  fastify.get('/storage-info', {
    schema: {
      description: 'Get storage usage information (Admin only)',
      tags: ['Admin File Upload'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                totalSpace: { type: 'integer' },
                usedSpace: { type: 'integer' },
                freeSpace: { type: 'integer' },
                usagePercentage: { type: 'number' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.getStorageInfo,
  });

  /**
   * Bulk delete files by IDs (Admin only)
   * POST /api/admin/uploads/bulk-delete
   */
  fastify.post('/bulk-delete', {
    schema: {
      description: 'Bulk delete files by IDs (Admin only)',
      tags: ['Admin File Upload'],
      body: {
        type: 'object',
        properties: {
          fileIds: {
            type: 'array',
            items: { type: 'integer', minimum: 1 },
            minItems: 1,
          },
        },
        required: ['fileIds'],
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
                deleted: { type: 'integer' },
                failed: { type: 'integer' },
                errors: { type: 'array' },
              },
            },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.bulkDeleteFiles,
  });

  /**
   * Generate file usage report (Admin only)
   * GET /api/admin/uploads/report
   */
  fastify.get('/report', {
    schema: {
      description: 'Generate file usage report (Admin only)',
      tags: ['Admin File Upload'],
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv', 'excel'], default: 'json' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          includeDetails: { type: 'boolean', default: false },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN'])],
    handler: adminFileUploadController.generateUsageReport,
  });

  /**
   * Upload bootcamp image (Admin only)
   * POST /api/admin/uploads/bootcamp-image
   */
  fastify.post('/bootcamp-image', {
    schema: {
      description: 'Upload bootcamp image (Admin only)',
      tags: ['Admin File Upload'],
      consumes: ['multipart/form-data'],
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                originalName: { type: 'string' },
                fileSize: { type: 'integer' },
                mimeType: { type: 'string' },
                fileUrl: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, authorizeRoles(['ADMIN']), uploadBootcampImage],
    handler: adminFileUploadController.uploadBootcampImage,
  });
}
