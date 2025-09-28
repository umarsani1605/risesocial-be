import { adminService } from '../services/adminService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Admin Controller
 * Handles admin-specific operations
 */
export class AdminController {
  constructor() {
    this.logger = getLogger();
  }

  /**
   * Upload image for academy, instructor, or testimonial
   * @param {Object} request - Fastify request
   * @param {Object} reply - Fastify reply
   */
  async uploadImage(request, reply) {
    try {
      const { file } = request;
      const { type } = request.body; // ACADEMY_IMAGE, INSTRUCTOR_AVATAR, TESTIMONIAL_AVATAR

      if (!file) {
        return reply.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const result = await adminService.uploadImage(file, type);

      return reply.json({
        success: true,
        data: result,
      });
    } catch (error) {
      this.logger.error('Upload image error:', error);
      return reply.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }
}

// Export instance
export const adminController = new AdminController();
