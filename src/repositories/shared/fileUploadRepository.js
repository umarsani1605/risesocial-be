import { BaseRepository } from './BaseRepository.js';
import prisma from '../../config/database.js';

export class FileUploadRepository extends BaseRepository {
  constructor() {
    super(prisma.fileUpload);
  }


  async createFileUpload(fileData) {
    try {
      const fileUpload = await this.model.create({
        data: {
          original_name: fileData.originalName,
          file_path: fileData.path,
          file_size: fileData.size,
          mime_type: fileData.mimeType,
          upload_type: fileData.uploadType,
          cohort_module_id: fileData.cohortModuleId || null,
          academy_id: fileData.academyId || null,
        },
      });

      return fileUpload;
    } catch (error) {
      throw new Error('Failed to create file upload record');
    }
  }

  async findById(id) {
    try {
      const fileUpload = await this.model.findUnique({ where: { id: parseInt(id) } });
      return fileUpload;
    } catch (error) {
      throw new Error('Failed to find file upload');
    }
  }

  async findByUploadType(uploadType, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const files = await this.model.findMany({ where: { upload_type: uploadType }, orderBy: { [sortBy]: sortOrder }, skip, take: limit });

      return files;
    } catch (error) {
      throw new Error('Failed to find files by upload type');
    }
  }

  async getFileUploadStats() {
    try {
      const [totalFiles, essayFiles, headshotFiles, totalSize, recentFiles] = await Promise.all([
        this.model.count(),
        this.model.count({ where: { upload_type: 'ESSAY' } }),
        this.model.count({ where: { upload_type: 'HEADSHOT' } }),
        this.model.aggregate({ _sum: { file_size: true } }),
        this.model.count({ where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      ]);

      const result = {
        totalFiles,
        essayFiles,
        headshotFiles,
        totalSize: totalSize._sum.file_size || 0,
        recentFiles,
        averageFileSize: totalFiles > 0 ? Math.round((totalSize._sum.file_size || 0) / totalFiles) : 0,
      };
      return result;
    } catch (error) {
      throw new Error('Failed to get file upload statistics');
    }
  }

  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { uploadType, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const whereClause = { created_at: { gte: startDate, lte: endDate } };
      if (uploadType) whereClause.upload_type = uploadType;

      const files = await this.model.findMany({ where: whereClause, orderBy: { [sortBy]: sortOrder }, skip, take: limit });

      return files;
    } catch (error) {
      throw new Error('Failed to find files by date range');
    }
  }

  async deleteFileUpload(id) {
    try {
      await this.model.delete({ where: { id: parseInt(id) } });
      return true;
    } catch (error) {
      throw new Error('Failed to delete file upload record');
    }
  }

  async updateFileUpload(id, updateData) {
    try {
      const updatedFile = await this.model.update({ where: { id: parseInt(id) }, data: updateData });
      return updatedFile;
    } catch (error) {
      throw new Error('Failed to update file upload record');
    }
  }

  async findByOriginalName(namePattern, options = {}) {
    try {
      const { uploadType, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const whereClause = { original_name: { contains: namePattern, mode: 'insensitive' } };
      if (uploadType) whereClause.upload_type = uploadType;

      const files = await this.model.findMany({ where: whereClause, orderBy: { [sortBy]: sortOrder }, skip, take: limit });

      return files;
    } catch (error) {
      throw new Error('Failed to find files by original name');
    }
  }

  async getCountByType() {
    try {
      const counts = await this.model.groupBy({ by: ['upload_type'], _count: { id: true } });
      const result = {};
      counts.forEach((count) => {
        result[count.upload_type] = count._count.id;
      });
      return result;
    } catch (error) {
      throw new Error('Failed to get count by type');
    }
  }

  async fileExistsByPath(filePath) {
    try {
      const file = await this.model.findFirst({ where: { file_path: filePath } });
      const exists = !!file;
      return exists;
    } catch (error) {
      throw new Error('Failed to check file existence');
    }
  }
}

export const fileUploadRepository = new FileUploadRepository();
