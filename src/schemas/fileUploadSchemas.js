import {
  createSuccessResponseSchema,
  createPaginatedResponseSchema,
  createErrorResponseSchema,
  paginationQuerySchema,
  idParamSchema,
  timestampFieldsSchema,
} from './baseSchemas.js';

const UPLOAD_TYPES = ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'ACADEMY_IMAGE', 'INSTRUCTOR_AVATAR', 'TESTIMONIAL_AVATAR', 'USER_AVATAR'];

/**
 * File Upload Entity Schema
 */
const fileUploadEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', description: 'File ID' },
    originalName: { type: 'string', description: 'Original filename' },
    fileName: { type: 'string', description: 'Stored filename' },
    filePath: { type: 'string', description: 'File path on server' },
    fileSize: { type: 'integer', description: 'File size in bytes' },
    fileSizeFormatted: { type: 'string', description: 'Formatted file size' },
    mimeType: { type: 'string', description: 'MIME type' },
    uploadType: { type: 'string', enum: UPLOAD_TYPES, description: 'Upload type' },
    uploadDate: { type: 'string', format: 'date-time', description: 'Upload timestamp' },
    fileUrl: { type: 'string', description: 'File URL' },
    fileExtension: { type: 'string', description: 'File extension' },
    isImage: { type: 'boolean', description: 'Is image file' },
    isPdf: { type: 'boolean', description: 'Is PDF file' },
    ...timestampFieldsSchema,
  },
};

/**
 * Upload Type Param Schema
 */
const uploadTypeParamSchema = {
  type: 'object',
  properties: {
    uploadType: {
      type: 'string',
      enum: UPLOAD_TYPES,
      description: 'Upload type filter',
    },
  },
  required: ['uploadType'],
};

/**
 * File Upload Query Schema
 */
const fileUploadQuerySchema = {
  type: 'object',
  properties: {
    ...paginationQuerySchema.properties,
    sortBy: {
      type: 'string',
      enum: ['created_at', 'original_name', 'file_size', 'upload_type'],
      default: 'created_at',
      description: 'Sort field',
    },
  },
};

/**
 * POST /api/uploads/essay - Upload essay file
 */
export const uploadEssaySchema = {
  summary: 'Upload essay file',
  description: 'Upload a PDF file for essay submission',
  tags: ['File Upload'],
  consumes: ['multipart/form-data'],
  response: {
    201: createSuccessResponseSchema(fileUploadEntitySchema, 'Essay uploaded successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * POST /api/uploads/headshot - Upload headshot file
 */
export const uploadHeadshotSchema = {
  summary: 'Upload headshot file',
  description: 'Upload an image file for headshot',
  tags: ['File Upload'],
  consumes: ['multipart/form-data'],
  response: {
    201: createSuccessResponseSchema(fileUploadEntitySchema, 'Headshot uploaded successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * POST /api/uploads/payment-proof - Upload payment proof file
 */
export const uploadPaymentProofSchema = {
  summary: 'Upload payment proof file',
  description: 'Upload an image file for payment proof',
  tags: ['File Upload'],
  consumes: ['multipart/form-data'],
  response: {
    201: createSuccessResponseSchema(fileUploadEntitySchema, 'Payment proof uploaded successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/uploads/:id - Download file by ID
 */
export const downloadFileSchema = {
  summary: 'Download file by ID',
  description: 'Download or view uploaded file',
  tags: ['File Upload'],
  params: idParamSchema,
  response: {
    200: {
      description: 'File content',
      type: 'string',
      format: 'binary',
    },
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file ID'),
    404: createErrorResponseSchema(404, 'File not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/uploads/:id/info - Get file information
 */
export const getFileInfoSchema = {
  summary: 'Get file information',
  description: 'Get detailed information about uploaded file',
  tags: ['File Upload'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(fileUploadEntitySchema, 'File info retrieved successfully'),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file ID'),
    404: createErrorResponseSchema(404, 'File not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * DELETE /api/uploads/:id - Delete file by ID
 */
export const deleteFileSchema = {
  summary: 'Delete file by ID',
  description: 'Delete uploaded file and its record',
  tags: ['File Upload'],
  params: idParamSchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          physicalFileDeleted: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
      'File deleted successfully'
    ),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid file ID'),
    404: createErrorResponseSchema(404, 'File not found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/uploads/type/:uploadType - Get files by upload type
 */
export const getFilesByTypeSchema = {
  summary: 'Get files by upload type',
  description: 'Get paginated list of files by upload type',
  tags: ['File Upload'],
  params: uploadTypeParamSchema,
  querystring: fileUploadQuerySchema,
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: fileUploadEntitySchema,
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
      'Files retrieved successfully'
    ),
    400: createErrorResponseSchema(400, 'Bad Request - Invalid upload type'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/uploads/stats - Get upload statistics
 */
export const getUploadStatsSchema = {
  summary: 'Get upload statistics',
  description: 'Get comprehensive upload statistics',
  tags: ['File Upload'],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          totalFiles: { type: 'integer' },
          essayFiles: { type: 'integer' },
          headshotFiles: { type: 'integer' },
          paymentProofFiles: { type: 'integer' },
          totalSize: { type: 'integer' },
          totalSizeFormatted: { type: 'string' },
          recentFiles: { type: 'integer' },
          averageFileSize: { type: 'integer' },
          averageFileSizeFormatted: { type: 'string' },
        },
      },
      'Statistics retrieved successfully'
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * GET /api/uploads/health - Upload service health check
 */
export const healthCheckSchema = {
  summary: 'Upload service health check',
  description: 'Check upload service health and configuration',
  tags: ['File Upload'],
  response: {
    200: createSuccessResponseSchema(
      {
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
      'Health check successful'
    ),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

/**
 * POST /api/uploads/cleanup - Cleanup orphaned files
 */
export const cleanupOrphanedFilesSchema = {
  summary: 'Cleanup orphaned files',
  description: 'Remove orphaned files without database records (Admin only)',
  tags: ['Admin File Upload'],
  security: [{ bearerAuth: [] }],
  response: {
    200: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          totalPhysicalFiles: { type: 'integer' },
          orphanedFiles: { type: 'integer' },
          cleanedFiles: { type: 'integer' },
          message: { type: 'string' },
        },
      },
      'Cleanup completed successfully'
    ),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
