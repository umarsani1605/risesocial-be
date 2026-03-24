import { fileUploadController } from '../../controllers/guest/fileUploadController.js';
import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';
import {
  uploadHeadshotSchema,
  uploadPaymentProofSchema,
  downloadFileSchema,
  getFileInfoSchema,
  getFilesByTypeSchema,
  healthCheckSchema,
} from '../../schemas/shared/fileUploadSchemas.js';

export default async function userFileUploadRoutes(fastify) {
  fastify.post('/headshot', {
    schema: uploadHeadshotSchema,
    preHandler: [createUploadMiddleware('ryls_headshot')],
    handler: fileUploadController.uploadHeadshot,
  });

  fastify.post('/payment-proof', {
    schema: uploadPaymentProofSchema,
    preHandler: [createUploadMiddleware('ryls_payment_proof')],
    handler: fileUploadController.uploadPaymentProof,
  });

  fastify.get('/:id', {
    schema: downloadFileSchema,
    handler: fileUploadController.downloadFile,
  });

  fastify.get('/:id/info', {
    schema: getFileInfoSchema,
    handler: fileUploadController.getFileInfo,
  });

  fastify.get('/type/:uploadType', {
    schema: getFilesByTypeSchema,
    handler: fileUploadController.getFilesByType,
  });

  fastify.get('/health', {
    schema: healthCheckSchema,
    handler: fileUploadController.healthCheck,
  });
}
