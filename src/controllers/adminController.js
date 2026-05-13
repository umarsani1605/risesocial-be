import { adminService } from '../services/admin/adminService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class AdminController {
  constructor() {
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
      return reply.status(500).json({
        success: false,
        message: error.message || 'Failed to upload image',
      });
    }
  }
}

export const adminController = new AdminController();
