import { FileUploadRepository } from '../repositories/fileUploadRepository.js';
import { deleteFile } from '../middleware/fileUploadMiddleware.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * FileUpload Service
 * Business logic for file upload operations
 */
export class FileUploadService {
  constructor() {
    this.fileUploadRepository = new FileUploadRepository();
  }

  /**
   * Process and save uploaded file
   * @param {Object} fileData - File data from multer
   * @param {string} uploadType - Upload type (ESSAY, HEADSHOT)
   * @returns {Promise<Object>} Saved file record
   */
  async processFileUpload(fileData, uploadType) {
    try {
      const validTypes = ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF'];
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

      return {
        id: savedFile.id,
        originalName: savedFile.original_name,
        filePath: savedFile.file_path,
        fileSize: savedFile.file_size,
        mimeType: savedFile.mime_type,
        uploadType: savedFile.upload_type,
        uploadDate: savedFile.created_at,
        fileUrl: this.generateFileUrl(savedFile.id),
      };
    } catch (error) {
      if (fileData && fileData.path) {
        await deleteFile(fileData.path);
      }

      console.error('Error processing file upload:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   * @param {number} fileId - File ID
   * @returns {Promise<Object|null>} File record
   */
  async getFileById(fileId) {
    try {
      const file = await this.fileUploadRepository.findById(fileId);

      if (!file) {
        return null;
      }

      return this.enhanceFileObject(file);
    } catch (error) {
      console.error('Error getting file by ID:', error);
      throw new Error('Failed to retrieve file');
    }
  }

  /**
   * Get file download info
   * @param {number} fileId - File ID
   * @returns {Promise<Object>} File download info
   */
  async getFileDownloadInfo(fileId) {
    try {
      const file = await this.fileUploadRepository.findById(fileId);

      if (!file) {
        throw new Error('File not found');
      }

      // Check if physical file exists
      const fileExists = await fs.pathExists(file.file_path);
      if (!fileExists) {
        throw new Error('Physical file not found');
      }

      return {
        id: file.id,
        originalName: file.original_name,
        filePath: file.file_path,
        mimeType: file.mime_type,
        fileSize: file.file_size,
        uploadType: file.upload_type,
      };
    } catch (error) {
      console.error('Error getting file download info:', error);
      throw error;
    }
  }

  /**
   * Delete file and its record
   * @param {number} fileId - File ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(fileId) {
    try {
      const file = await this.fileUploadRepository.findById(fileId);

      if (!file) {
        throw new Error('File not found');
      }

      // Delete physical file
      const fileDeleted = await deleteFile(file.file_path);

      // Delete database record
      await this.fileUploadRepository.deleteFileUpload(fileId);

      return {
        success: true,
        physicalFileDeleted: fileDeleted,
        message: 'File deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get files by upload type
   * @param {string} uploadType - Upload type
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Files with pagination
   */
  async getFilesByType(uploadType, options = {}) {
    try {
      const files = await this.fileUploadRepository.findByUploadType(uploadType, options);

      return {
        files: files.map((file) => this.enhanceFileObject(file)),
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          total: files.length,
        },
      };
    } catch (error) {
      console.error('Error getting files by type:', error);
      throw new Error('Failed to retrieve files');
    }
  }

  /**
   * Get file upload statistics
   * @returns {Promise<Object>} Upload statistics
   */
  async getUploadStatistics() {
    try {
      const stats = await this.fileUploadRepository.getFileUploadStats();

      return {
        ...stats,
        totalSizeFormatted: this.formatFileSize(stats.totalSize),
        averageFileSizeFormatted: this.formatFileSize(stats.averageFileSize),
      };
    } catch (error) {
      console.error('Error getting upload statistics:', error);
      throw new Error('Failed to retrieve upload statistics');
    }
  }

  /**
   * Generate file URL
   * @private
   * @param {number} fileId - File ID
   * @returns {string} File URL
   */
  generateFileUrl(fileId) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return `${baseUrl}/api/uploads/${fileId}`;
  }

  /**
   * Enhance file object with additional properties
   * @private
   * @param {Object} file - File record
   * @returns {Object} Enhanced file object
   */
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

  /**
   * Format file size in human readable format
   * @private
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file upload request
   * @param {Object} req - Request object
   * @param {string} expectedType - Expected upload type
   * @returns {Object} Validation result
   */
  validateUploadRequest(req, expectedType) {
    const errors = [];

    // Check if file is present
    if (!req.file) {
      errors.push('No file uploaded');
    }

    // Validate upload type
    if (!expectedType || !['ESSAY', 'HEADSHOT'].includes(expectedType)) {
      errors.push('Invalid upload type specified');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean up orphaned files (files without database records)
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupOrphanedFiles() {
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

      return {
        totalPhysicalFiles,
        orphanedFiles: orphanedCount,
        cleanedFiles: cleanedCount,
        message: `Cleaned up ${cleanedCount} orphaned files`,
      };
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
      throw new Error('Failed to cleanup orphaned files');
    }
  }
}
