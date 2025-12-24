import fs from 'fs-extra';
import path from 'path';
import { getLogger } from '../lib/loggerContext.js';

export class AdminService {
  constructor() {
    this.logger = getLogger();
  }

    async uploadImage(file, type) {
    try {
      const allowedTypes = ['ACADEMY_IMAGE', 'INSTRUCTOR_AVATAR', 'TESTIMONIAL_AVATAR'];

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
      }

      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = path.join(uploadPath, filename);
      await fs.writeFile(filePath, file.buffer);

      return {
        filename,
        path: filePath,
        url: publicUrl,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Upload image service error:', error);
      throw error;
    }
  }
}

// Export instance
export const adminService = new AdminService();
