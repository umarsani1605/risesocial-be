import { fileUploadRepository } from '../../repositories/shared/fileUploadRepository.js';
import { UPLOAD_CONFIG } from '../../config/uploadConfig.js';
import { captureEvent } from '../../config/posthog.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.join(__dirname, '../../../uploads');

export class FileUploadService {
  constructor() {
    this.fileUploadRepository = fileUploadRepository;
  }


  async processFileUpload(fileData, uploadType) {
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

      return result;
    } catch (error) {
      if (fileData && fileData.path) {
        await fs.remove(fileData.path).catch(() => {});
      }
      captureEvent('system', 'upload.failed', {
        endpoint: 'processFileUpload',
        upload_type: uploadType,
        reason: error.message,
        file_size: fileData?.size,
      });
      throw error;
    }
  }

  async getFileById(fileId) {
    try {
      const file = await this.fileUploadRepository.findById(fileId);
      return file;
    } catch (error) {
      throw new Error('Failed to retrieve file');
    }
  }

  async getFileDownloadInfo(fileId) {
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
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const file = await this.fileUploadRepository.findById(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      const fileDeleted = await fs.remove(file.file_path).then(() => true).catch(() => false);
      await this.fileUploadRepository.deleteFileUpload(fileId);

      return { success: true, physicalFileDeleted: fileDeleted, message: 'File deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getFilesByType(uploadType, options = {}) {
    try {
      const files = await this.fileUploadRepository.findByUploadType(uploadType, options);
      const result = {
        files: files,
        pagination: { page: options.page || 1, limit: options.limit || 10, total: files.length },
      };
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve files');
    }
  }

  async getUploadStatistics() {
    try {
      const stats = await this.fileUploadRepository.getFileUploadStats();
      return stats;
    } catch (error) {
      throw new Error('Failed to retrieve upload statistics');
    }
  }

  generateFileUrl(fileId) {
    const baseUrl = process.env.BACKEND_URL;
    return `${baseUrl}/api/uploads/${fileId}`;
  }

  generatePublicFileUrl(fileData) {
    const baseUrl = process.env.BACKEND_URL;
    const relativePath = fileData.relativePath || fileData.path;
    return `${baseUrl}/${relativePath}`;
  }

  async uploadImage(file, type) {
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

      return result;
    } catch (error) {
      throw error;
    }
  }

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
            const deleted = await fs.remove(filePath).then(() => true).catch(() => false);
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
      return result;
    } catch (error) {
      throw new Error('Failed to cleanup orphaned files');
    }
  }

  /**
   * Unified atomic upload method.
   * Writes file to disk, then inserts DB record.
   * If DB insert fails, deletes the physical file (atomicity fix).
   *
   * @param {Object} uploadedFile - from createUploadMiddleware: { buffer, originalName, mimeType, size, uploadType }
   * @param {Object} entityRefs   - optional entity FKs: { cohortModuleId, academyId }
   * @returns {Promise<Object>} file record with relativePath and publicUrl
   */
  async upload(uploadedFile, entityRefs = {}) {
    try {
      const config = UPLOAD_CONFIG[uploadedFile.uploadType];
      if (!config) {
        const err = new Error(`Unknown upload type: ${uploadedFile.uploadType}`);
        err.statusCode = 400;
        throw err;
      }

      const storageDir = path.join(uploadsBaseDir, config.storagePath);
      const ext = path.extname(uploadedFile.originalName).toLowerCase();
      const baseName = path.basename(uploadedFile.originalName, ext)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 100);
      let candidateName = `${baseName}${ext}`;
      let counter = 1;
      while (await fs.pathExists(path.join(storageDir, candidateName))) {
        counter++;
        candidateName = `${baseName}_${counter}${ext}`;
      }
      const uniqueName = candidateName;
      const absolutePath = path.join(storageDir, uniqueName);
      const relativePath = `${config.storagePath}/${uniqueName}`;

      await fs.ensureDir(storageDir);
      await fs.writeFile(absolutePath, uploadedFile.buffer);

      let record;
      try {
        record = await this.fileUploadRepository.createFileUpload({
          originalName: uploadedFile.originalName,
          path: relativePath,
          size: uploadedFile.size,
          mimeType: uploadedFile.mimeType,
          uploadType: uploadedFile.uploadType,
          cohortModuleId: entityRefs.cohortModuleId || null,
          academyId: entityRefs.academyId || null,
        });
      } catch (dbErr) {
        // Atomicity: remove physical file if DB insert fails
        await fs.remove(absolutePath).catch(() => {});
        captureEvent('system', 'upload.failed', {
          endpoint: 'upload',
          upload_type: uploadedFile.uploadType,
          reason: dbErr.message,
          file_size: uploadedFile.size,
        });
        throw dbErr;
      }

      const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const publicUrl = `${baseUrl}/uploads/${relativePath}`;

      return {
        id: record.id,
        originalName: record.original_name,
        relativePath,
        absolutePath,
        fileSize: record.file_size,
        mimeType: record.mime_type,
        uploadType: record.upload_type,
        publicUrl,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const fileUploadService = new FileUploadService();
