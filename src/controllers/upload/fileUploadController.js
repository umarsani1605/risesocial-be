import { FileUploadService } from '../../services/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * FileUpload Controller
 * Handles file upload HTTP requests
 */
export class FileUploadController {
  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  /**
   * Upload essay file (PDF only)
   * POST /api/uploads/essay
   */
  async uploadEssay(request, reply) {
    try {
      // File is already processed by middleware and attached to request.uploadedFile
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      // Process file upload
      const uploadResult = await this.fileUploadService.processFileUpload(request.uploadedFile, 'ESSAY');

      return reply.status(201).send(successResponse(uploadResult, 'Essay file uploaded successfully'));
    } catch (error) {
      console.error('Error uploading essay:', error);
      return reply.status(500).send(errorResponse('Failed to upload essay file', 500, error.message));
    }
  }

  /**
   * Upload headshot file (Images only)
   * POST /api/uploads/headshot
   */
  async uploadHeadshot(request, reply) {
    try {
      // File is already processed by middleware and attached to request.uploadedFile
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      // Process file upload
      const uploadResult = await this.fileUploadService.processFileUpload(request.uploadedFile, 'HEADSHOT');

      return reply.status(201).send(successResponse(uploadResult, 'Headshot file uploaded successfully'));
    } catch (error) {
      console.error('Error uploading headshot:', error);
      return reply.status(500).send(errorResponse('Failed to upload headshot file', 500, error.message));
    }
  }

  /**
   * Download/view file by ID
   * GET /api/uploads/:id
   */
  async downloadFile(request, reply) {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid file ID provided', 400));
      }

      // Get file download info
      const fileInfo = await this.fileUploadService.getFileDownloadInfo(parseInt(id));

      // Check if file exists on disk
      const fileExists = await fs.pathExists(fileInfo.filePath);
      if (!fileExists) {
        return reply.status(404).send(errorResponse('File not found on disk', 404));
      }

      // Set appropriate headers
      reply.type(fileInfo.mimeType);
      reply.header('Content-Disposition', `inline; filename="${fileInfo.originalName}"`);
      reply.header('Content-Length', fileInfo.fileSize);

      // Stream file
      const fileStream = fs.createReadStream(fileInfo.filePath);
      return reply.send(fileStream);
    } catch (error) {
      console.error('Error downloading file:', error);

      if (error.message === 'File not found') {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      return reply.status(500).send(errorResponse('Failed to download file', 500, error.message));
    }
  }

  /**
   * Get file information by ID
   * GET /api/uploads/:id/info
   */
  async getFileInfo(request, reply) {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid file ID provided', 400));
      }

      const fileInfo = await this.fileUploadService.getFileById(parseInt(id));

      if (!fileInfo) {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      return reply.status(200).send(successResponse(fileInfo, 'File information retrieved successfully'));
    } catch (error) {
      console.error('Error getting file info:', error);
      return reply.status(500).send(errorResponse('Failed to get file information', 500, error.message));
    }
  }

  /**
   * Delete file by ID
   * DELETE /api/uploads/:id
   */
  async deleteFile(request, reply) {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid file ID provided', 400));
      }

      const deleteResult = await this.fileUploadService.deleteFile(parseInt(id));

      return reply.status(200).send(
        successResponse(deleteResult, 'File deleted successfully', {
          fileId: parseInt(id),
        })
      );
    } catch (error) {
      console.error('Error deleting file:', error);

      if (error.message === 'File not found') {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete file', 500, error.message));
    }
  }

  /**
   * Get files by upload type
   * GET /api/uploads/type/:uploadType
   */
  async getFilesByType(request, reply) {
    try {
      const { uploadType } = request.params;
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = request.query;

      // Validate upload type
      if (!['ESSAY', 'HEADSHOT'].includes(uploadType)) {
        return reply.status(400).send(errorResponse('Invalid upload type. Must be ESSAY or HEADSHOT', 400));
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await this.fileUploadService.getFilesByType(uploadType, options);

      return reply.status(200).send(
        successResponse(result, `${uploadType} files retrieved successfully`, {
          uploadType,
          ...result.pagination,
        })
      );
    } catch (error) {
      console.error('Error getting files by type:', error);
      return reply.status(500).send(errorResponse('Failed to retrieve files', 500, error.message));
    }
  }

  /**
   * Get upload statistics
   * GET /api/uploads/stats
   */
  async getUploadStats(request, reply) {
    try {
      const stats = await this.fileUploadService.getUploadStatistics();

      return reply.status(200).send(
        successResponse(stats, 'Upload statistics retrieved successfully', {
          generatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Error getting upload stats:', error);
      return reply.status(500).send(errorResponse('Failed to retrieve upload statistics', 500, error.message));
    }
  }

  /**
   * Health check for upload service
   * GET /api/uploads/health
   */
  async healthCheck(request, reply) {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const dirExists = await fs.pathExists(uploadDir);

      const health = {
        status: 'healthy',
        uploadDirectory: {
          path: uploadDir,
          exists: dirExists,
          writable: dirExists
            ? await fs
                .access(uploadDir, fs.constants.W_OK)
                .then(() => true)
                .catch(() => false)
            : false,
        },
        maxFileSize: process.env.UPLOAD_MAX_SIZE || '10485760',
        allowedTypes: process.env.UPLOAD_ALLOWED_TYPES || 'application/pdf,image/jpeg,image/jpg,image/png',
        timestamp: new Date().toISOString(),
      };

      return reply.status(200).send(successResponse(health, 'Upload service is healthy'));
    } catch (error) {
      console.error('Error in health check:', error);
      return reply.status(500).send(errorResponse('Upload service health check failed', 500, error.message));
    }
  }

  /**
   * Cleanup orphaned files
   * POST /api/uploads/cleanup
   * Note: This should be protected with admin authentication
   */
  async cleanupOrphanedFiles(request, reply) {
    try {
      const cleanupResult = await this.fileUploadService.cleanupOrphanedFiles();

      return reply.status(200).send(
        successResponse(cleanupResult, 'Orphaned files cleanup completed', {
          executedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
      return reply.status(500).send(errorResponse('Failed to cleanup orphaned files', 500, error.message));
    }
  }
}
