import { fileUploadService } from '../../services/shared/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import fs from 'fs-extra';
import path from 'path';

export class FileUploadController {
  async uploadEssay(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await fileUploadService.upload(request.uploadedFile, {});

      return reply.status(201).send(successResponse(uploadResult, 'Essay file uploaded successfully'));
    } catch (error) {
      throw error;
    }
  }

  async uploadHeadshot(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }
      const uploadResult = await fileUploadService.upload(request.uploadedFile, {});

      return reply.status(201).send(successResponse(uploadResult, 'Headshot file uploaded successfully'));
    } catch (error) {
      throw error;
    }
  }

  async uploadPaymentProof(request, reply) {
    try {
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await fileUploadService.upload(request.uploadedFile, {});


      return reply.status(201).send(successResponse(uploadResult, 'Payment proof file uploaded successfully'));
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(request, reply) {
    try {
      const { id } = request.params;


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

      if (error.message === 'File not found') {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      throw error;
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
      throw error;
    }
  }

  async deleteFile(request, reply) {
    try {
      const { id } = request.params;

      const deleteResult = await fileUploadService.deleteFile(Number(id));

      return reply.status(200).send(
        successResponse(deleteResult, 'File deleted successfully', {
          fileId: Number(id),
        }),
      );
    } catch (error) {

      if (error.message === 'File not found') {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      throw error;
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
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  async getUploadStats(request, reply) {
    try {
      const stats = await fileUploadService.getUploadStatistics();

      return reply.status(200).send(
        successResponse(stats, 'Upload statistics retrieved successfully', {
          generatedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async cleanupOrphanedFiles(request, reply) {
    try {
      const cleanupResult = await fileUploadService.cleanupOrphanedFiles();

      return reply.status(200).send(
        successResponse(cleanupResult, 'Orphaned files cleanup completed', {
          executedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      throw error;
    }
  }
}

export const fileUploadController = new FileUploadController();
