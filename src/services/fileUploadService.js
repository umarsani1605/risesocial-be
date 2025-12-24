import { fileUploadRepository } from '../repositories/fileUploadRepository.js';
import { deleteFile } from '../middleware/fileUploadMiddleware.js';
import fs from 'fs-extra';
import path from 'path';
import { getLogger } from '../lib/loggerContext.js';

export class FileUploadService {
  constructor() {
    this.fileUploadRepository = fileUploadRepository;
  }

  get logger() {
    return getLogger();
  }

  async processFileUpload(fileData, uploadType) {
    this.logger.info('[fileUploadService] processFileUpload start');
    try {
      const validTypes = ['ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'ACADEMY_IMAGE', 'INSTRUCTOR_AVATAR', 'TESTIMONIAL_AVATAR', 'USER_AVATAR'];
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

  async getFileById(fileId) {
    this.logger.info({ fileId }, '[fileUploadService] getFileById start');
    try {
      const file = await this.fileUploadRepository.findById(fileId);
      this.logger.info('[fileUploadService] getFileById success');
      return file;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getFileById error');
      throw new Error('Failed to retrieve file');
    }
  }

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

  async getFilesByType(uploadType, options = {}) {
    this.logger.info({ uploadType, options }, '[fileUploadService] getFilesByType start');
    try {
      const files = await this.fileUploadRepository.findByUploadType(uploadType, options);
      const result = {
        files: files,
        pagination: { page: options.page || 1, limit: options.limit || 10, total: files.length },
      };
      this.logger.info('[fileUploadService] getFilesByType success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getFilesByType error');
      throw new Error('Failed to retrieve files');
    }
  }

  async getUploadStatistics() {
    this.logger.info('[fileUploadService] getUploadStatistics start');
    try {
      const stats = await this.fileUploadRepository.getFileUploadStats();
      this.logger.info('[fileUploadService] getUploadStatistics success');
      return stats;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] getUploadStatistics error');
      throw new Error('Failed to retrieve upload statistics');
    }
  }

  generateFileUrl(fileId) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return `${baseUrl}/api/uploads/${fileId}`;
  }

  generatePublicFileUrl(fileData) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const relativePath = fileData.relativePath || fileData.path;
    return `${baseUrl}/${relativePath}`;
  }

  async uploadImage(file, type) {
    this.logger.info('[fileUploadService] uploadImage start');
    try {
      const allowedTypes = ['ACADEMY_IMAGE', 'INSTRUCTOR_AVATAR', 'TESTIMONIAL_AVATAR', 'USER_AVATAR'];
      if (!allowedTypes.includes(type)) {
        throw new Error('Invalid upload type');
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.originalname);
      const filename = `${timestamp}_${randomString}${extension}`;

      let uploadPath = '';
      let publicUrl = '';

      switch (type) {
        case 'ACADEMY_IMAGE':
          uploadPath = path.join(process.cwd(), 'uploads', 'images', 'academies');
          publicUrl = `/images/academies/${filename}`;
          break;
        case 'INSTRUCTOR_AVATAR':
          uploadPath = path.join(process.cwd(), 'uploads', 'images', 'instructors');
          publicUrl = `/images/instructors/${filename}`;
          break;
        case 'TESTIMONIAL_AVATAR':
          uploadPath = path.join(process.cwd(), 'uploads', 'images', 'testimonials');
          publicUrl = `/images/testimonials/${filename}`;
          break;
        case 'USER_AVATAR':
          uploadPath = path.join(process.cwd(), 'uploads', 'images', 'users');
          publicUrl = `/images/users/${filename}`;
          break;
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = path.join(uploadPath, filename);
      await fs.writeFile(filePath, file.buffer);

      const result = {
        filename,
        path: filePath,
        url: publicUrl,
        size: file.size,
        mimetype: file.mimetype,
      };

      this.logger.info({ avatarUrl: publicUrl }, '[fileUploadService] uploadImage success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[fileUploadService] uploadImage error');
      throw error;
    }
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

export const fileUploadService = new FileUploadService();
