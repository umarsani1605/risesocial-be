import { adminController } from '../controllers/adminController.js';
import { uploadMiddleware } from '../middleware/fileUploadMiddleware.js';

/**
 * Admin Routes
 * Handles admin-specific routes
 */
export default async function adminRoutes(fastify) {
  // Admin image upload route
  fastify.post('/uploads/image', {
    preHandler: [uploadMiddleware],
    handler: adminController.uploadImage.bind(adminController),
    schema: {
      description: 'Upload image for academy, instructor, or testimonial',
      tags: ['Admin'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['ACADEMY_IMAGE', 'INSTRUCTOR_AVATAR', 'TESTIMONIAL_AVATAR'],
            description: 'Type of image being uploaded',
          },
        },
        required: ['type'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                url: { type: 'string' },
                size: { type: 'number' },
                mimetype: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  });
}
