import { adminService } from '../services/adminService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getLogger } from '../utils/loggerContext.js';

export class AdminController {
  constructor() {
    this.logger = getLogger();
  }

  async uploadImage(request, reply) {
    try {
      const { file } = request;
      const { type } = request.body;

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

export const adminController = new AdminController();
