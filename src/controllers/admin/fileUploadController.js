import { FileUploadService } from '../../services/fileUploadService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin File Upload Controller
 * Handles admin file management, statistics, and cleanup operations
 */
export class AdminFileUploadController {
  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  /**
   * Delete file by ID (Admin only)
   * DELETE /api/admin/uploads/:id
   */
  deleteFile = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] deleteFile start');
      request.log.debug({ params: request.params }, '[adminFileUploadController] rawParams');
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid file ID', 400));
      }

      const fileRecord = await this.fileUploadService.getFileById(parseInt(id));

      if (!fileRecord) {
        return reply.status(404).send(errorResponse('File not found', 404));
      }

      await this.fileUploadService.deleteFile(parseInt(id));

      request.log.info('[adminFileUploadController] deleteFile success');
      return reply.send(successResponse(null, 'File deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] deleteFile error');

      if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse('File not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to delete file', 500, error.message));
    }
  };

  /**
   * Get upload statistics (Admin only)
   * GET /api/admin/uploads/stats
   */
  getUploadStats = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] getUploadStats start');
      request.log.debug({ query: request.query }, '[adminFileUploadController] rawQuery');

      const {
        startDate,
        endDate,
        uploadType,
        groupBy = 'day', // day, week, month
      } = request.query;

      const filters = {
        startDate,
        endDate,
        uploadType: uploadType?.toUpperCase(),
        groupBy,
      };

      const stats = await this.fileUploadService.getUploadStats(filters);

      request.log.info('[adminFileUploadController] getUploadStats success');
      return reply.send(successResponse(stats, 'Upload statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] getUploadStats error');
      return reply.status(500).send(errorResponse('Failed to retrieve upload statistics', 500, error.message));
    }
  };

  /**
   * Cleanup orphaned files (Admin only)
   * POST /api/admin/uploads/cleanup
   */
  cleanupOrphanedFiles = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] cleanupOrphanedFiles start');
      request.log.debug({ body: request.body }, '[adminFileUploadController] rawBody');

      const {
        dryRun = true, // Default to dry run for safety
        olderThanDays = 7, // Only cleanup files older than X days
        uploadTypes = [], // Specific upload types to cleanup, empty = all
      } = request.body;

      const options = {
        dryRun,
        olderThanDays: parseInt(olderThanDays),
        uploadTypes: uploadTypes.map((type) => type.toUpperCase()),
      };

      const result = await this.fileUploadService.cleanupOrphanedFiles(options);

      request.log.info('[adminFileUploadController] cleanupOrphanedFiles success');
      return reply.send(successResponse(result, dryRun ? 'Cleanup simulation completed' : 'Orphaned files cleanup completed'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] cleanupOrphanedFiles error');
      return reply.status(500).send(errorResponse('Failed to cleanup orphaned files', 500, error.message));
    }
  };

  /**
   * Get all files with advanced filtering and pagination (Admin only)
   * GET /api/admin/uploads
   */
  getAllFiles = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] getAllFiles start');
      request.log.debug({ query: request.query }, '[adminFileUploadController] rawQuery');

      const {
        page = 1,
        limit = 20,
        uploadType,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minSize,
        maxSize,
      } = request.query;

      const filters = {
        uploadType: uploadType?.toUpperCase(),
        startDate,
        endDate,
        search,
        minSize: minSize ? parseInt(minSize) : undefined,
        maxSize: maxSize ? parseInt(maxSize) : undefined,
      };

      const result = await this.fileUploadService.getAllFiles({
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
        sortBy,
        sortOrder,
      });

      request.log.info('[adminFileUploadController] getAllFiles success');
      return reply.send(successResponse(result, 'Files retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] getAllFiles error');
      return reply.status(500).send(errorResponse('Failed to retrieve files', 500, error.message));
    }
  };

  /**
   * Get file usage statistics by type (Admin only)
   * GET /api/admin/uploads/usage-stats
   */
  getUsageStats = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] getUsageStats start');

      const usageStats = await this.fileUploadService.getUsageStatsByType();

      request.log.info('[adminFileUploadController] getUsageStats success');
      return reply.send(successResponse(usageStats, 'File usage statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] getUsageStats error');
      return reply.status(500).send(errorResponse('Failed to retrieve usage statistics', 500, error.message));
    }
  };

  /**
   * Get storage usage information (Admin only)
   * GET /api/admin/uploads/storage-info
   */
  getStorageInfo = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] getStorageInfo start');

      const storageInfo = await this.fileUploadService.getStorageInfo();

      request.log.info('[adminFileUploadController] getStorageInfo success');
      return reply.send(successResponse(storageInfo, 'Storage information retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] getStorageInfo error');
      return reply.status(500).send(errorResponse('Failed to retrieve storage information', 500, error.message));
    }
  };

  /**
   * Bulk delete files by IDs (Admin only)
   * POST /api/admin/uploads/bulk-delete
   */
  bulkDeleteFiles = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] bulkDeleteFiles start');
      request.log.debug({ body: request.body }, '[adminFileUploadController] rawBody');

      const { fileIds = [] } = request.body;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return reply.status(400).send(errorResponse('File IDs array is required', 400));
      }

      // Validate all IDs are numbers
      const validIds = fileIds.filter((id) => !isNaN(parseInt(id))).map((id) => parseInt(id));

      if (validIds.length !== fileIds.length) {
        return reply.status(400).send(errorResponse('All file IDs must be valid numbers', 400));
      }

      const result = await this.fileUploadService.bulkDeleteFiles(validIds);

      request.log.info('[adminFileUploadController] bulkDeleteFiles success');
      return reply.send(successResponse(result, 'Bulk file deletion completed'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] bulkDeleteFiles error');
      return reply.status(500).send(errorResponse('Failed to bulk delete files', 500, error.message));
    }
  };

  /**
   * Generate file usage report (Admin only)
   * GET /api/admin/uploads/report
   */
  generateUsageReport = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] generateUsageReport start');
      request.log.debug({ query: request.query }, '[adminFileUploadController] rawQuery');

      const {
        format = 'json', // json, csv, excel
        startDate,
        endDate,
        includeDetails = false,
      } = request.query;

      const options = {
        format,
        startDate,
        endDate,
        includeDetails: includeDetails === 'true',
      };

      const report = await this.fileUploadService.generateUsageReport(options);

      request.log.info('[adminFileUploadController] generateUsageReport success');

      // Set appropriate headers based on format
      if (format === 'csv') {
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="file_usage_report_${new Date().toISOString().split('T')[0]}.csv"`);
      } else if (format === 'excel') {
        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', `attachment; filename="file_usage_report_${new Date().toISOString().split('T')[0]}.xlsx"`);
      }

      return reply.send(format === 'json' ? successResponse(report, 'Usage report generated successfully') : report);
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] generateUsageReport error');
      return reply.status(500).send(errorResponse('Failed to generate usage report', 500, error.message));
    }
  };

  /**
   * Upload bootcamp image (Admin only)
   * POST /api/admin/uploads/bootcamp-image
   */
  uploadBootcampImage = async (request, reply) => {
    try {
      request.log.info('[adminFileUploadController] uploadBootcampImage start');

      if (!request.uploadedFile) {
        return reply.status(400).send(errorResponse('No file uploaded', 400));
      }

      const { filename, originalname, size, mimetype, relativePath } = request.uploadedFile;

      // Generate public URL untuk file
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const fileUrl = `${baseUrl}/${relativePath}`;

      const result = {
        filename,
        originalName: originalname,
        fileSize: size,
        mimeType: mimetype,
        fileUrl,
      };

      request.log.info('[adminFileUploadController] uploadBootcampImage success');
      return reply.status(201).send(successResponse(result, 'Bootcamp image uploaded successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminFileUploadController] uploadBootcampImage error');
      return reply.status(500).send(errorResponse('Failed to upload bootcamp image', 500, error.message));
    }
  };
}

// Export instance
export const adminFileUploadController = new AdminFileUploadController();
