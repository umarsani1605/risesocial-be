import { fileUploadController } from '../../controllers/guest/fileUploadController.js';
import { uploadHeadshot, uploadPaymentProof } from '../../middleware/fileUploadMiddleware.js';
import {
  uploadHeadshotSchema,
  uploadPaymentProofSchema,
  downloadFileSchema,
  getFileInfoSchema,
  getFilesByTypeSchema,
  healthCheckSchema,
} from '../../schemas/fileUploadSchemas.js';

export default async function userFileUploadRoutes(fastify) {
  fastify.post('/headshot', { schema: uploadHeadshotSchema, preHandler: [uploadHeadshot] }, fileUploadController.uploadHeadshot);
  fastify.post('/payment-proof', { schema: uploadPaymentProofSchema, preHandler: [uploadPaymentProof] }, fileUploadController.uploadPaymentProof);
  fastify.get('/health', { schema: healthCheckSchema }, fileUploadController.healthCheck);
  fastify.get('/type/:uploadType', { schema: getFilesByTypeSchema }, fileUploadController.getFilesByType);
  fastify.get('/:id', { schema: downloadFileSchema }, fileUploadController.downloadFile);
  fastify.get('/:id/info', { schema: getFileInfoSchema }, fileUploadController.getFileInfo);
}
