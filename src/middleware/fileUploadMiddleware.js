import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { getLogger } from '../lib/loggerContext.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fastify-compatible file upload middleware
 * Uses @fastify/multipart plugin instead of multer
 */

const uploadsBaseDir = path.join(__dirname, '../../uploads');
const documentsDir = path.join(uploadsBaseDir, 'documents');
const imagesDir = path.join(uploadsBaseDir, 'images');

fs.ensureDirSync(documentsDir);
fs.ensureDirSync(imagesDir);

/**
 * Process uploaded file with Fastify multipart
 * @param {Object} file - File from request.file()
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @param {string} uploadType - Type of upload ('ESSAY', 'HEADSHOT', 'PAYMENT_PROOF', 'ACADEMY_IMAGE')
 * @returns {Object} Processed file info
 */
const processUploadedFile = async (file, allowedTypes, maxSize, uploadType) => {
  const logger = getLogger();
  logger.info('[fileUploadMiddleware] processUploadedFile start');

  if (!file) {
    logger.error('[fileUploadMiddleware] no_file_uploaded');
    throw new Error('No file uploaded');
  }

  logger.debug({ filename: file.filename, mimetype: file.mimetype }, '[fileUploadMiddleware] file_meta');

  if (!allowedTypes.includes(file.mimetype)) {
    logger.error({ mimetype: file.mimetype, allowed: allowedTypes }, '[fileUploadMiddleware] invalid_file_type');
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  const isPdf = file.mimetype === 'application/pdf';
  const targetDir = isPdf ? documentsDir : imagesDir;
  const relativeFolderName = isPdf ? 'documents' : 'images';
  logger.info({ uploadType, isPdf, targetDir }, '[fileUploadMiddleware] determine_target_dir');

  const timestamp = Date.now();
  const extension = path.extname(file.filename);
  const basename = path.basename(file.filename, extension);
  const uniqueFilename = `${timestamp}-${basename}${extension}`;
  const filePath = path.join(targetDir, uniqueFilename);

  logger.debug({ uniqueFilename }, '[fileUploadMiddleware] generated_filename');

  const buffer = await file.toBuffer();
  logger.debug({ size: buffer.length }, '[fileUploadMiddleware] buffer_size');

  if (buffer.length > maxSize) {
    const errorMsg = `File too large: ${Math.round(buffer.length / (1024 * 1024))}MB. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`;
    logger.error({ size: buffer.length, maxSize }, '[fileUploadMiddleware] file_too_large');
    throw new Error(errorMsg);
  }

  logger.info({ filePath }, '[fileUploadMiddleware] writing_file');
  await fs.writeFile(filePath, buffer);
  logger.info('[fileUploadMiddleware] write_success');

  return {
    filename: uniqueFilename,
    originalname: file.filename,
    mimetype: file.mimetype,
    size: buffer.length,
    path: filePath,
    relativePath: path.join('uploads', relativeFolderName, uniqueFilename),
  };
};

/**
 * Essay upload handler (PDF only)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export const uploadEssay = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadEssay start');
    const file = await request.file();

    const allowedTypes = ['application/pdf'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB

    const processedFile = await processUploadedFile(file, allowedTypes, maxSize, 'ESSAY');

    request.uploadedFile = processedFile;
    request.log.info('[fileUploadMiddleware] uploadEssay success');
  } catch (error) {
    request.log.error({ err: error }, '[fileUploadMiddleware] uploadEssay error');
    reply.status(400).send({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
};

/**
 * Headshot upload handler (Images only)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export const uploadHeadshot = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadHeadshot start');
    const file = await request.file();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB

    const processedFile = await processUploadedFile(file, allowedTypes, maxSize, 'HEADSHOT');

    request.uploadedFile = processedFile;
    request.log.info('[fileUploadMiddleware] uploadHeadshot success');
  } catch (error) {
    request.log.error({ err: error }, '[fileUploadMiddleware] uploadHeadshot error');
    reply.status(400).send({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
};

/**
 * Payment proof upload handler (Images only)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export const uploadPaymentProof = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadPaymentProof start');
    const file = await request.file();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB

    const processedFile = await processUploadedFile(file, allowedTypes, maxSize, 'PAYMENT_PROOF');

    request.uploadedFile = processedFile;
    request.log.info('[fileUploadMiddleware] uploadPaymentProof success');
  } catch (error) {
    request.log.error({ err: error }, '[fileUploadMiddleware] uploadPaymentProof error');
    reply.status(400).send({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
};

/**
 * Academy image upload handler (Images only)
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export const uploadAcademyImage = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadAcademyImage start');

    // Parse FormData fields
    const formData = {};
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        // Handle file upload
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB untuk optimasi
        const processedFile = await processUploadedFile(part, allowedTypes, maxSize, 'ACADEMY_IMAGE');
        request.uploadedFile = processedFile;
        request.log.info('[fileUploadMiddleware] file processed');
      } else {
        // Handle form fields
        let value = part.value;

        // Convert numeric fields to numbers
        if (
          part.fieldname === 'order' ||
          part.fieldname === 'tier_order' ||
          part.fieldname === 'feature_order' ||
          part.fieldname === 'session_order' ||
          part.fieldname === 'topic_order'
        ) {
          value = parseInt(value, 10);
        }

        // Convert boolean fields to booleans
        if (part.fieldname === 'certificate' || part.fieldname === 'portfolio') {
          value = value === 'true';
        }

        formData[part.fieldname] = value;
      }
    }

    // Set parsed form data to request body
    request.body = formData;
    request.log.info('[fileUploadMiddleware] uploadAcademyImage success');
  } catch (error) {
    request.log.error({ err: error }, '[fileUploadMiddleware] uploadAcademyImage error');
    reply.status(400).send({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
};

/**
 * Delete physical file helper
 * Exported for reuse in services
 * @param {string} filePath
 * @returns {Promise<boolean>} true if deleted or not exists, false if failed
 */
export const deleteFile = async (filePath) => {
  const logger = getLogger();
  try {
    logger.info({ filePath }, '[fileUploadMiddleware] deleteFile start');
    await fs.remove(filePath);
    logger.info('[fileUploadMiddleware] deleteFile success');
    return true;
  } catch (err) {
    logger.error({ err }, '[fileUploadMiddleware] deleteFile error');
    return false;
  }
};

/**
 * Simple upload middleware for Fastify
 * @param {Object} request - Fastify request
 * @param {Object} reply - Fastify reply
 */
export const uploadMiddleware = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadMiddleware start');
    const file = await request.file();

    if (file) {
      request.file = file;
      request.log.info('[fileUploadMiddleware] file attached to request');
    }

    request.log.info('[fileUploadMiddleware] uploadMiddleware success');
  } catch (error) {
    request.log.error({ err: error }, '[fileUploadMiddleware] uploadMiddleware error');
    reply.status(400).send({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
};
