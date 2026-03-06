import { fileUploadController } from '../../controllers/guest/fileUploadController.js';
import { uploadHeadshot, uploadPaymentProof } from '../../middleware/fileUploadMiddleware.js';
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
    preHandler: [uploadHeadshot],
    handler: fileUploadController.uploadHeadshot,
  });

  fastify.post('/payment-proof', {
    schema: uploadPaymentProofSchema,
    preHandler: [uploadPaymentProof],
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
