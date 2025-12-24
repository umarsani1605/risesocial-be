import { BaseRepository } from './base/BaseRepository.js';
import prisma from '../lib/prisma.js';
import { getLogger } from '../lib/loggerContext.js';

export class FileUploadRepository extends BaseRepository {
  constructor() {
    super(prisma.fileUpload);
  }

  get logger() {
    return getLogger();
  }

  async createFileUpload(fileData) {
    this.logger.info('[fileUploadRepository] createFileUpload start');
    this.logger.debug({ originalName: fileData.originalName, uploadType: fileData.uploadType }, '[fileUploadRepository] rawInput');
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

      this.logger.info({ id: fileUpload.id }, '[fileUploadRepository] createFileUpload success');
      return fileUpload;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadRepository] createFileUpload error');
      throw new Error('Failed to create file upload record');
    }
  }

  async findById(id) {
    this.logger.info({ id }, '[fileUploadRepository] findById start');
    try {
      const fileUpload = await this.model.findUnique({ where: { id: parseInt(id) } });
      this.logger.info({ found: !!fileUpload }, '[fileUploadRepository] findById success');
      return fileUpload;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadRepository] findById error');
      throw new Error('Failed to find file upload');
    }
  }

  async findByUploadType(uploadType, options = {}) {
    this.logger.info({ uploadType, options }, '[fileUploadRepository] findByUploadType start');
    try {
      const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const files = await this.model.findMany({ where: { upload_type: uploadType }, orderBy: { [sortBy]: sortOrder }, skip, take: limit });

      this.logger.info({ count: files.length }, '[fileUploadRepository] findByUploadType success');
      return files;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadRepository] findByUploadType error');
      throw new Error('Failed to find files by upload type');
    }
  }

  async getFileUploadStats() {
    this.logger.info('[fileUploadRepository] getFileUploadStats start');
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
      this.logger.info('[fileUploadRepository] getFileUploadStats success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadRepository] getFileUploadStats error');
      throw new Error('Failed to get file upload statistics');
    }
  }
  async deleteFileUpload(id) {
    this.logger.info({ id }, '[fileUploadRepository] deleteFileUpload start');
    try {
      await this.model.delete({ where: { id: parseInt(id) } });
      this.logger.info('[fileUploadRepository] deleteFileUpload success');
      return true;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadRepository] deleteFileUpload error');
      throw new Error('Failed to delete file upload record');
    }
  }

  async fileExistsByPath(filePath) {
    try {
      const file = await this.model.findFirst({ where: { file_path: filePath } });
      const exists = !!file;
      this.logger.info({ exists }, '[fileUploadRepository] fileExistsByPath success');
      return exists;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadRepository] fileExistsByPath error');
      throw new Error('Failed to check file existence');
    }
  }
}

export const fileUploadRepository = new FileUploadRepository();
