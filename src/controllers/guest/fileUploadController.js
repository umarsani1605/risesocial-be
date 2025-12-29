import { fileUploadService } from '../../services/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import fs from 'fs-extra';
import path from 'path';

export class FileUploadController {
  async uploadEssay(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await fileUploadService.processFileUpload(request.uploadedFile, 'ESSAY');

      return reply.status(201).send(successResponse(uploadResult, 'Essay file uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, 'Error uploading essay');
      return reply.status(500).send(errorResponse('Failed to upload essay file', 500, error.message));
    }
  }

  async uploadHeadshot(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }
      const uploadResult = await fileUploadService.processFileUpload(request.uploadedFile, 'HEADSHOT');

      return reply.status(201).send(successResponse(uploadResult, 'Headshot file uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, 'Error uploading headshot');
      return reply.status(500).send(errorResponse('Failed to upload headshot file', 500, error.message));
    }
  }

  async uploadPaymentProof(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await fileUploadService.processFileUpload(request.uploadedFile, 'PAYMENT_PROOF');

      request.log.info({ uploadResult }, 'Payment proof uploaded successfully');

      return reply.status(201).send(successResponse(uploadResult, 'Payment proof file uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, 'Error uploading payment proof');
      return reply.status(500).send(errorResponse('Failed to upload payment proof file', 500, error.message));
    }
  }

  async downloadFile(request, reply) {
    try {
      const { id } = request.params;

      request.log.info({ id }, 'Downloading file');

      const fileInfo = await fileUploadService.getFileDownloadInfo(Number(id));
      const fileExists = await fs.pathExists(fileInfo.filePath);
      if (!fileExists) {
        return reply.status(404).send(errorResponse('File not found on disk', 404));
      }

      reply.type(fileInfo.mimeType);
      reply.header('Content-Disposition', `inline; filename="${fileInfo.originalName}"`);
      reply.header('Content-Length', fileInfo.fileSize);

      const fileStream = fs.createReadStream(fileInfo.filePath);
      return reply.send(fileStream);
    } catch (error) {
      request.log.error({ err: error }, 'Error downloading file');

      if (error.message === 'File not found') {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      return reply.status(500).send(errorResponse('Failed to download file', 500, error.message));
    }
  }

  async getFileInfo(request, reply) {
    try {
      const { id } = request.params;

      const fileInfo = await fileUploadService.getFileById(Number(id));

      if (!fileInfo) {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      return reply.status(200).send(successResponse(fileInfo, 'File information retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, 'Error getting file info');
      return reply.status(500).send(errorResponse('Failed to get file information', 500, error.message));
    }
  }

  async deleteFile(request, reply) {
    try {
      const { id } = request.params;

      const deleteResult = await fileUploadService.deleteFile(Number(id));

      return reply.status(200).send(
        successResponse(deleteResult, 'File deleted successfully', {
          fileId: Number(id),
        })
      );
    } catch (error) {
      request.log.error({ err: error }, 'Error deleting file');

      if (error.message === 'File not found') {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete file', 500, error.message));
    }
  }

  async getFilesByType(request, reply) {
    try {
      const { uploadType } = request.params;
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = request.query;

      if (!['ESSAY', 'HEADSHOT'].includes(uploadType)) {
        return reply.status(400).send(errorResponse('Invalid upload type. Must be ESSAY or HEADSHOT', 400));
      }

      const options = {
        page: Number(page),
        limit: Number(limit),
        sortBy,
        sortOrder,
      };

      const result = await fileUploadService.getFilesByType(uploadType, options);

      return reply.status(200).send(
        successResponse(result, `${uploadType} files retrieved successfully`, {
          uploadType,
          ...result.pagination,
        })
      );
    } catch (error) {
      request.log.error({ err: error }, 'Error getting files by type');
      return reply.status(500).send(errorResponse('Failed to retrieve files', 500, error.message));
    }
  }

  async getUploadStats(request, reply) {
    try {
      const stats = await fileUploadService.getUploadStatistics();

      return reply.status(200).send(
        successResponse(stats, 'Upload statistics retrieved successfully', {
          generatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      request.log.error({ err: error }, 'Error getting upload stats');
      return reply.status(500).send(errorResponse('Failed to retrieve upload statistics', 500, error.message));
    }
  }

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
      request.log.error({ err: error }, 'Error in health check');
      return reply.status(500).send(errorResponse('Upload service health check failed', 500, error.message));
    }
  }

  async cleanupOrphanedFiles(request, reply) {
    try {
      const cleanupResult = await fileUploadService.cleanupOrphanedFiles();

      return reply.status(200).send(
        successResponse(cleanupResult, 'Orphaned files cleanup completed', {
          executedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      request.log.error({ err: error }, 'Error cleaning up orphaned files');
      return reply.status(500).send(errorResponse('Failed to cleanup orphaned files', 500, error.message));
    }
  }
}

export const fileUploadController = new FileUploadController();
