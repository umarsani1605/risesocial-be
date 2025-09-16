import { FileUploadService } from '../../services/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User File Upload Controller
 * Handles user file upload operations and basic file access
 */
export class UserFileUploadController {
  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  /**
   * Upload essay file (PDF only)
   * POST /api/uploads/essay
   */
  uploadEssay = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] uploadEssay start');
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await this.fileUploadService.processFileUpload(request.uploadedFile, 'ESSAY');

      request.log.info('[userFileUploadController] uploadEssay success');
      return reply.status(201).send(successResponse(uploadResult, 'Essay file uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] uploadEssay error');
      return reply.status(500).send(errorResponse('Failed to upload essay file', 500, error.message));
    }
  };

  /**
   * Upload headshot file (Images only)
   * POST /api/uploads/headshot
   */
  uploadHeadshot = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] uploadHeadshot start');
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await this.fileUploadService.processFileUpload(request.uploadedFile, 'HEADSHOT');

      request.log.info('[userFileUploadController] uploadHeadshot success');
      return reply.status(201).send(successResponse(uploadResult, 'Headshot file uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] uploadHeadshot error');
      return reply.status(500).send(errorResponse('Failed to upload headshot file', 500, error.message));
    }
  };

  /**
   * Upload payment proof file (Images only)
   * POST /api/uploads/payment-proof
   */
  uploadPaymentProof = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] uploadPaymentProof start');
      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const uploadResult = await this.fileUploadService.processFileUpload(request.uploadedFile, 'PAYMENT_PROOF');

      request.log.info('[userFileUploadController] uploadPaymentProof success');
      return reply.status(201).send(successResponse(uploadResult, 'Payment proof file uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] uploadPaymentProof error');
      return reply.status(500).send(errorResponse('Failed to upload payment proof file', 500, error.message));
    }
  };

  /**
   * Download/view file by ID
   * GET /api/uploads/:id
   */
  downloadFile = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] downloadFile start');
      request.log.debug({ params: request.params }, '[userFileUploadController] rawParams');
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid file ID', 400));
      }

      const fileRecord = await this.fileUploadService.getFileById(parseInt(id));

      if (!fileRecord) {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      // Set appropriate headers for file download
      reply.header('Content-Type', fileRecord.mimeType);
      reply.header('Content-Disposition', `inline; filename="${fileRecord.originalName}"`);

      // Stream the file
      const fileStream = await this.fileUploadService.createFileStream(fileRecord.filePath);

      request.log.info('[userFileUploadController] downloadFile success');
      return reply.send(fileStream);
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] downloadFile error');

      if (error.code === 'ENOENT') {
        return reply.status(404).send(errorResponse('File not found on disk', 404));
      }

      return reply.status(500).send(errorResponse('Failed to download file', 500, error.message));
    }
  };

  /**
   * Get file information by ID
   * GET /api/uploads/:id/info
   */
  getFileInfo = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] getFileInfo start');
      request.log.debug({ params: request.params }, '[userFileUploadController] rawParams');
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid file ID', 400));
      }

      const fileInfo = await this.fileUploadService.getFileInfo(parseInt(id));

      if (!fileInfo) {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      request.log.info('[userFileUploadController] getFileInfo success');
      return reply.send(successResponse(fileInfo, 'File information retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] getFileInfo error');
      return reply.status(500).send(errorResponse('Failed to retrieve file information', 500, error.message));
    }
  };

  /**
   * Get files by upload type with pagination
   * GET /api/uploads/type/:uploadType
   */
  getFilesByType = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] getFilesByType start');
      request.log.debug({ params: request.params, query: request.query }, '[userFileUploadController] raw');
      const { uploadType } = request.params;
      const { page = 1, limit = 10 } = request.query;

      if (!uploadType) {
        return reply.status(400).send(errorResponse('Upload type is required', 400));
      }

      const validTypes = ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'BOOTCAMP_IMAGE'];
      if (!validTypes.includes(uploadType.toUpperCase())) {
        return reply.status(400).send(errorResponse('Invalid upload type', 400, `Valid types: ${validTypes.join(', ')}`));
      }

      const result = await this.fileUploadService.getFilesByType(uploadType.toUpperCase(), parseInt(page), parseInt(limit));

      request.log.info('[userFileUploadController] getFilesByType success');
      return reply.send(successResponse(result, 'Files retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] getFilesByType error');
      return reply.status(500).send(errorResponse('Failed to retrieve files by type', 500, error.message));
    }
  };

  /**
   * Upload service health check
   * GET /api/uploads/health
   */
  healthCheck = async (request, reply) => {
    try {
      request.log.info('[userFileUploadController] healthCheck start');
      const healthStatus = await this.fileUploadService.healthCheck();

      request.log.info('[userFileUploadController] healthCheck success');
      return reply.send(successResponse(healthStatus, 'Upload service is healthy'));
    } catch (error) {
      request.log.error({ err: error }, '[userFileUploadController] healthCheck error');
      return reply.status(500).send(errorResponse('Upload service health check failed', 500, error.message));
    }
  };
}

// Export instance
export const userFileUploadController = new UserFileUploadController();
