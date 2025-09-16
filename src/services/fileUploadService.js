import { FileUploadRepository } from '../repositories/fileUploadRepository.js';
import { deleteFile } from '../middleware/fileUploadMiddleware.js';
import fs from 'fs-extra';
import path from 'path';
import { getLogger } from '../lib/loggerContext.js';

/**
 * FileUpload Service
 * Business logic for file upload operations
 */
export class FileUploadService {
  constructor() {
    this.fileUploadRepository = new FileUploadRepository();
  }

  get logger() {
    return getLogger();
  }

  /**
   * Process and save uploaded file
   */
  async processFileUpload(fileData, uploadType) {
    this.logger.info('[fileUploadService] processFileUpload start');
    this.logger.debug({ fileName: fileData?.originalname, uploadType }, '[fileUploadService] rawInput');
    try {
      const validTypes = ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'BOOTCAMP_IMAGE'];
      if (!validTypes.includes(uploadType)) {
        throw new Error(`Invalid upload type: ${uploadType}`);
      }

      const fileUploadData = {
        originalName: fileData.originalname,
        path: fileData.path,
        size: fileData.size,
        mimeType: fileData.mimetype,
        uploadType: uploadType,
      };

      const savedFile = await this.fileUploadRepository.createFileUpload(fileUploadData);

      const result = {
        id: savedFile.id,
        originalName: savedFile.original_name,
        filePath: savedFile.file_path,
        fileSize: savedFile.file_size,
        mimeType: savedFile.mime_type,
        uploadType: savedFile.upload_type,
        uploadDate: savedFile.created_at,
        fileUrl: this.generateFileUrl(savedFile.id),
      };

      this.logger.info('[fileUploadService] processFileUpload success');
      return result;
    } catch (error) {
      if (fileData && fileData.path) {
        await deleteFile(fileData.path);
      }

      this.logger.error({ err: error }, '[fileUploadService] processFileUpload error');
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId) {
    this.logger.info({ fileId }, '[fileUploadService] getFileById start');
    try {
      const file = await this.fileUploadRepository.findById(fileId);
      const result = file ? this.enhanceFileObject(file) : null;
      this.logger.info('[fileUploadService] getFileById success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getFileById error');
      throw new Error('Failed to retrieve file');
    }
  }

  /**
   * Get file download info
   */
  async getFileDownloadInfo(fileId) {
    this.logger.info({ fileId }, '[fileUploadService] getFileDownloadInfo start');
    try {
      const file = await this.fileUploadRepository.findById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const fileExists = await fs.pathExists(file.file_path);
      if (!fileExists) {
        throw new Error('Physical file not found');
      }

      const result = {
        id: file.id,
        originalName: file.original_name,
        filePath: file.file_path,
        mimeType: file.mime_type,
        fileSize: file.file_size,
        uploadType: file.upload_type,
      };
      this.logger.info('[fileUploadService] getFileDownloadInfo success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getFileDownloadInfo error');
      throw error;
    }
  }

  /**
   * Delete file and its record
   */
  async deleteFile(fileId) {
    this.logger.info({ fileId }, '[fileUploadService] deleteFile start');
    try {
      const file = await this.fileUploadRepository.findById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const fileDeleted = await deleteFile(file.file_path);
      await this.fileUploadRepository.deleteFileUpload(fileId);

      this.logger.info('[fileUploadService] deleteFile success');
      return { success: true, physicalFileDeleted: fileDeleted, message: 'File deleted successfully' };
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] deleteFile error');
      throw error;
    }
  }

  /**
   * Get files by upload type
   */
  async getFilesByType(uploadType, options = {}) {
    this.logger.info({ uploadType, options }, '[fileUploadService] getFilesByType start');
    try {
      const files = await this.fileUploadRepository.findByUploadType(uploadType, options);
      const result = {
        files: files.map((file) => this.enhanceFileObject(file)),
        pagination: { page: options.page || 1, limit: options.limit || 10, total: files.length },
      };
      this.logger.info('[fileUploadService] getFilesByType success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getFilesByType error');
      throw new Error('Failed to retrieve files');
    }
  }

  /**
   * Get file upload statistics
   */
  async getUploadStatistics() {
    this.logger.info('[fileUploadService] getUploadStatistics start');
    try {
      const stats = await this.fileUploadRepository.getFileUploadStats();
      const result = {
        ...stats,
        totalSizeFormatted: this.formatFileSize(stats.totalSize),
        averageFileSizeFormatted: this.formatFileSize(stats.averageFileSize),
      };
      this.logger.info('[fileUploadService] getUploadStatistics success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getUploadStatistics error');
      throw new Error('Failed to retrieve upload statistics');
    }
  }

  generateFileUrl(fileId) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return `${baseUrl}/api/uploads/${fileId}`;
  }

  enhanceFileObject(file) {
    return {
      id: file.id,
      originalName: file.original_name,
      fileName: path.basename(file.file_path),
      fileSize: file.file_size,
      fileSizeFormatted: this.formatFileSize(file.file_size),
      mimeType: file.mime_type,
      uploadType: file.upload_type,
      uploadDate: file.created_at,
      fileUrl: this.generateFileUrl(file.id),
      fileExtension: path.extname(file.original_name),
      isImage: file.mime_type.startsWith('image/'),
      isPdf: file.mime_type === 'application/pdf',
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateUploadRequest(req, expectedType) {
    const errors = [];
    if (!req.file) errors.push('No file uploaded');
    if (!expectedType || !['ESSAY', 'HEADSHOT'].includes(expectedType)) errors.push('Invalid upload type specified');
    return { isValid: errors.length === 0, errors };
  }

  async cleanupOrphanedFiles() {
    this.logger.info('[fileUploadService] cleanupOrphanedFiles start');
    try {
      const uploadBaseDir = path.join(process.cwd(), 'uploads');
      const subDirs = ['documents', 'images'];
      let totalPhysicalFiles = 0;
      let orphanedCount = 0;
      let cleanedCount = 0;

      for (const dirName of subDirs) {
        const dirPath = path.join(uploadBaseDir, dirName);
        const exists = await fs.pathExists(dirPath);
        if (!exists) continue;

        const entries = await fs.readdir(dirPath);
        for (const fileName of entries) {
          const filePath = path.join(dirPath, fileName);
          const stat = await fs.stat(filePath);
          if (!stat.isFile()) continue;

          totalPhysicalFiles++;
          const fileExists = await this.fileUploadRepository.fileExistsByPath(filePath);
          if (!fileExists) {
            orphanedCount++;
            const deleted = await deleteFile(filePath);
            if (deleted) cleanedCount++;
          }
        }
      }

      const result = {
        totalPhysicalFiles,
        orphanedFiles: orphanedCount,
        cleanedFiles: cleanedCount,
        message: `Cleaned up ${cleanedCount} orphaned files`,
      };
      this.logger.info('[fileUploadService] cleanupOrphanedFiles success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] cleanupOrphanedFiles error');
      throw new Error('Failed to cleanup orphaned files');
    }
  }
}
