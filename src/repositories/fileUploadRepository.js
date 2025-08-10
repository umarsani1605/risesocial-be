import { BaseRepository } from './base/BaseRepository.js';
import prisma from '../lib/prisma.js';

/**
 * FileUpload Repository
 * Handles database operations for file uploads
 */
export class FileUploadRepository extends BaseRepository {
  constructor() {
    super(prisma.fileUpload);
  }

  /**
   * Create a new file upload record
   * @param {Object} fileData - File upload data
   * @returns {Promise<Object>} Created file upload record
   */
  async createFileUpload(fileData) {
    try {
      const fileUpload = await this.model.create({
        data: {
          original_name: fileData.originalName,
          file_path: fileData.path,
          file_size: fileData.size,
          mime_type: fileData.mimeType,
          upload_type: fileData.uploadType,
        },
      });

      return fileUpload;
    } catch (error) {
      console.error('Error creating file upload:', error);
      throw new Error('Failed to create file upload record');
    }
  }

  /**
   * Find file upload by ID
   * @param {number} id - File upload ID
   * @returns {Promise<Object|null>} File upload record
   */
  async findById(id) {
    try {
      const fileUpload = await this.model.findUnique({
        where: { id: parseInt(id) },
      });

      return fileUpload;
    } catch (error) {
      console.error('Error finding file upload by ID:', error);
      throw new Error('Failed to find file upload');
    }
  }

  /**
   * Find files by upload type
   * @param {string} uploadType - Upload type (ESSAY, HEADSHOT)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of file upload records
   */
  async findByUploadType(uploadType, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

      const skip = (page - 1) * limit;

      const files = await this.model.findMany({
        where: {
          upload_type: uploadType,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      return files;
    } catch (error) {
      console.error('Error finding files by upload type:', error);
      throw new Error('Failed to find files by upload type');
    }
  }

  /**
   * Get file upload statistics
   * @returns {Promise<Object>} File upload statistics
   */
  async getFileUploadStats() {
    try {
      const [totalFiles, essayFiles, headshotFiles, totalSize, recentFiles] = await Promise.all([
        // Total files count
        this.model.count(),

        // Essay files count
        this.model.count({
          where: { upload_type: 'ESSAY' },
        }),

        // Headshot files count
        this.model.count({
          where: { upload_type: 'HEADSHOT' },
        }),

        // Total size of all files
        this.model.aggregate({
          _sum: {
            file_size: true,
          },
        }),

        // Recent files (last 7 days)
        this.model.count({
          where: {
            created_at: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        totalFiles,
        essayFiles,
        headshotFiles,
        totalSize: totalSize._sum.file_size || 0,
        recentFiles,
        averageFileSize: totalFiles > 0 ? Math.round((totalSize._sum.file_size || 0) / totalFiles) : 0,
      };
    } catch (error) {
      console.error('Error getting file upload stats:', error);
      throw new Error('Failed to get file upload statistics');
    }
  }

  /**
   * Find files uploaded within date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of file upload records
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { uploadType, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

      const skip = (page - 1) * limit;

      const whereClause = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (uploadType) {
        whereClause.upload_type = uploadType;
      }

      const files = await this.model.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      return files;
    } catch (error) {
      console.error('Error finding files by date range:', error);
      throw new Error('Failed to find files by date range');
    }
  }

  /**
   * Delete file upload record
   * @param {number} id - File upload ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteFileUpload(id) {
    try {
      await this.model.delete({
        where: { id: parseInt(id) },
      });

      return true;
    } catch (error) {
      console.error('Error deleting file upload:', error);
      throw new Error('Failed to delete file upload record');
    }
  }

  /**
   * Update file upload record
   * @param {number} id - File upload ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated file upload record
   */
  async updateFileUpload(id, updateData) {
    try {
      const updatedFile = await this.model.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      return updatedFile;
    } catch (error) {
      console.error('Error updating file upload:', error);
      throw new Error('Failed to update file upload record');
    }
  }

  /**
   * Find files by original name pattern
   * @param {string} namePattern - Name pattern to search
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of file upload records
   */
  async findByOriginalName(namePattern, options = {}) {
    try {
      const { uploadType, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

      const skip = (page - 1) * limit;

      const whereClause = {
        original_name: {
          contains: namePattern,
          mode: 'insensitive',
        },
      };

      if (uploadType) {
        whereClause.upload_type = uploadType;
      }

      const files = await this.model.findMany({
        where: whereClause,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      return files;
    } catch (error) {
      console.error('Error finding files by original name:', error);
      throw new Error('Failed to find files by original name');
    }
  }

  /**
   * Get file upload count by type
   * @returns {Promise<Object>} Count by upload type
   */
  async getCountByType() {
    try {
      const counts = await this.model.groupBy({
        by: ['upload_type'],
        _count: {
          id: true,
        },
      });

      const result = {};
      counts.forEach((count) => {
        result[count.upload_type] = count._count.id;
      });

      return result;
    } catch (error) {
      console.error('Error getting count by type:', error);
      throw new Error('Failed to get count by type');
    }
  }

  /**
   * Check if file exists by path
   * @param {string} filePath - File path
   * @returns {Promise<boolean>} File exists status
   */
  async fileExistsByPath(filePath) {
    try {
      const file = await this.model.findFirst({
        where: { file_path: filePath },
      });

      return !!file;
    } catch (error) {
      console.error('Error checking file exists by path:', error);
      throw new Error('Failed to check file existence');
    }
  }
}
