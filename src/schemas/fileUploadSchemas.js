/**
 * File Upload Validation Schemas
 * Fastify JSON schemas for file upload endpoints
 */

// Common file upload response schema
const fileUploadResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        originalName: { type: 'string' },
        filePath: { type: 'string' },
        fileSize: { type: 'integer' },
        mimeType: { type: 'string' },
        uploadType: { type: 'string', enum: ['ESSAY', 'HEADSHOT'] },
        uploadDate: { type: 'string', format: 'date-time' },
        fileUrl: { type: 'string' },
      },
      required: ['id', 'originalName', 'fileSize', 'mimeType', 'uploadType', 'uploadDate', 'fileUrl'],
    },
    meta: { type: 'object' },
  },
  required: ['success', 'message', 'data'],
};

// Enhanced file info response schema
const fileInfoResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        originalName: { type: 'string' },
        fileName: { type: 'string' },
        fileSize: { type: 'integer' },
        fileSizeFormatted: { type: 'string' },
        mimeType: { type: 'string' },
        uploadType: { type: 'string', enum: ['ESSAY', 'HEADSHOT'] },
        uploadDate: { type: 'string', format: 'date-time' },
        fileUrl: { type: 'string' },
        fileExtension: { type: 'string' },
        isImage: { type: 'boolean' },
        isPdf: { type: 'boolean' },
      },
      required: ['id', 'originalName', 'fileName', 'fileSize', 'mimeType', 'uploadType', 'uploadDate', 'fileUrl'],
    },
  },
  required: ['success', 'message', 'data'],
};

// Error response schema
const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [false] },
    message: { type: 'string' },
    error: { type: 'string' },
    details: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }, { type: 'object' }],
    },
  },
  required: ['success', 'message'],
};

// Upload statistics response schema
const uploadStatsResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        totalFiles: { type: 'integer' },
        essayFiles: { type: 'integer' },
        headshotFiles: { type: 'integer' },
        totalSize: { type: 'integer' },
        totalSizeFormatted: { type: 'string' },
        recentFiles: { type: 'integer' },
        averageFileSize: { type: 'integer' },
        averageFileSizeFormatted: { type: 'string' },
      },
      required: ['totalFiles', 'essayFiles', 'headshotFiles', 'totalSize', 'recentFiles', 'averageFileSize'],
    },
    meta: {
      type: 'object',
      properties: {
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  required: ['success', 'message', 'data'],
};

// Files by type response schema
const filesByTypeResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              originalName: { type: 'string' },
              fileName: { type: 'string' },
              fileSize: { type: 'integer' },
              fileSizeFormatted: { type: 'string' },
              mimeType: { type: 'string' },
              uploadType: { type: 'string', enum: ['ESSAY', 'HEADSHOT'] },
              uploadDate: { type: 'string', format: 'date-time' },
              fileUrl: { type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
          },
        },
      },
    },
  },
  required: ['success', 'message', 'data'],
};

// Health check response schema
const healthCheckResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        uploadDirectory: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            exists: { type: 'boolean' },
            writable: { type: 'boolean' },
          },
        },
        maxFileSize: { type: 'string' },
        allowedTypes: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  },
  required: ['success', 'message', 'data'],
};

// Cleanup response schema
const cleanupResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        totalPhysicalFiles: { type: 'integer' },
        orphanedFiles: { type: 'integer' },
        cleanedFiles: { type: 'integer' },
        message: { type: 'string' },
      },
    },
    meta: {
      type: 'object',
      properties: {
        executedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  required: ['success', 'message', 'data'],
};

// Request parameter schemas
const fileIdParamSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'File ID (numeric)',
    },
  },
  required: ['id'],
};

const uploadTypeParamSchema = {
  type: 'object',
  properties: {
    uploadType: {
      type: 'string',
      enum: ['ESSAY', 'HEADSHOT'],
      description: 'Upload type filter',
    },
  },
  required: ['uploadType'],
};

// Query parameter schemas
const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: {
      type: 'string',
      pattern: '^[0-9]+$',
      default: '1',
      description: 'Page number',
    },
    limit: {
      type: 'string',
      pattern: '^[0-9]+$',
      default: '10',
      description: 'Items per page',
    },
    sortBy: {
      type: 'string',
      enum: ['created_at', 'original_name', 'file_size', 'upload_type'],
      default: 'created_at',
      description: 'Sort field',
    },
    sortOrder: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Sort order',
    },
  },
};

// Complete route schemas
export const fileUploadSchemas = {
  // POST /api/uploads/essay
  uploadEssay: {
    summary: 'Upload essay file',
    description: 'Upload a PDF file for essay submission',
    tags: ['File Upload'],
    consumes: ['multipart/form-data'],
    response: {
      201: fileUploadResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // POST /api/uploads/headshot
  uploadHeadshot: {
    summary: 'Upload headshot file',
    description: 'Upload an image file for headshot',
    tags: ['File Upload'],
    consumes: ['multipart/form-data'],
    response: {
      201: fileUploadResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/uploads/:id
  downloadFile: {
    summary: 'Download file by ID',
    description: 'Download or view uploaded file',
    tags: ['File Upload'],
    params: fileIdParamSchema,
    response: {
      200: {
        description: 'File content',
        type: 'string',
        format: 'binary',
      },
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/uploads/:id/info
  getFileInfo: {
    summary: 'Get file information',
    description: 'Get detailed information about uploaded file',
    tags: ['File Upload'],
    params: fileIdParamSchema,
    response: {
      200: fileInfoResponseSchema,
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // DELETE /api/uploads/:id
  deleteFile: {
    summary: 'Delete file by ID',
    description: 'Delete uploaded file and its record',
    tags: ['File Upload'],
    params: fileIdParamSchema,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              physicalFileDeleted: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/uploads/type/:uploadType
  getFilesByType: {
    summary: 'Get files by upload type',
    description: 'Get paginated list of files by upload type',
    tags: ['File Upload'],
    params: uploadTypeParamSchema,
    querystring: paginationQuerySchema,
    response: {
      200: filesByTypeResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/uploads/stats
  getUploadStats: {
    summary: 'Get upload statistics',
    description: 'Get comprehensive upload statistics',
    tags: ['File Upload'],
    response: {
      200: uploadStatsResponseSchema,
      500: errorResponseSchema,
    },
  },

  // GET /api/uploads/health
  healthCheck: {
    summary: 'Upload service health check',
    description: 'Check upload service health and configuration',
    tags: ['File Upload'],
    response: {
      200: healthCheckResponseSchema,
      500: errorResponseSchema,
    },
  },

  // POST /api/uploads/cleanup
  cleanupOrphanedFiles: {
    summary: 'Cleanup orphaned files',
    description: 'Remove orphaned files without database records',
    tags: ['File Upload'],
    response: {
      200: cleanupResponseSchema,
      500: errorResponseSchema,
    },
  },
};
