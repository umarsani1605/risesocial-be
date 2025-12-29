import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { getLogger } from '../utils/loggerContext.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsBaseDir = path.join(__dirname, '../../uploads');
const documentsDir = path.join(uploadsBaseDir, 'documents');
const imagesDir = path.join(uploadsBaseDir, 'images');

fs.ensureDirSync(documentsDir);
fs.ensureDirSync(imagesDir);

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

export const uploadEssay = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadEssay start');
    const file = await request.file();

    const allowedTypes = ['application/pdf'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024;

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

export const uploadHeadshot = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadHeadshot start');
    const file = await request.file();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024;

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

export const uploadPaymentProof = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadPaymentProof start');
    const file = await request.file();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024;

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

export const uploadAcademyImage = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadAcademyImage start');

    const formData = {};
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;
        const processedFile = await processUploadedFile(part, allowedTypes, maxSize, 'ACADEMY_IMAGE');
        request.uploadedFile = processedFile;
        request.log.info('[fileUploadMiddleware] file processed');
      } else {
        let value = part.value;

        if (
          part.fieldname === 'order' ||
          part.fieldname === 'tier_order' ||
          part.fieldname === 'feature_order' ||
          part.fieldname === 'session_order' ||
          part.fieldname === 'topic_order'
        ) {
          value = parseInt(value, 10);
        }

        if (part.fieldname === 'certificate' || part.fieldname === 'portfolio') {
          value = value === 'true';
        }

        formData[part.fieldname] = value;
      }
    }

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

export const uploadUserAvatar = async (request, reply) => {
  try {
    request.log.info('[fileUploadMiddleware] uploadUserAvatar start');

    const formData = {};
    const parts = request.parts();

    for await (const part of parts) {
      if (part.type === 'file') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024;
        const processedFile = await processUploadedFile(part, allowedTypes, maxSize, 'USER_AVATAR');
        request.uploadedFile = processedFile;
        request.log.info('[fileUploadMiddleware] user avatar file processed');
      } else {
        let value = part.value;

        if (part.fieldname === 'email_verified' || part.fieldname === 'phone_verified') {
          value = value === 'true';
        }

        formData[part.fieldname] = value;
      }
    }

    request.body = formData;
    request.log.info('[fileUploadMiddleware] uploadUserAvatar success');
  } catch (error) {
    request.log.error({ err: error }, '[fileUploadMiddleware] uploadUserAvatar error');

    let errorMessage = 'File upload failed';
    let statusCode = 400;

    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      errorMessage = 'File size exceeds the maximum limit of 5MB.';
      statusCode = 413;
    } else if (error.message?.includes('Invalid file type')) {
      errorMessage = 'Invalid file type. Please select a valid image file (JPEG, PNG, or WebP).';
      statusCode = 400;
    } else if (error.message?.includes('File too large')) {
      errorMessage = 'File size exceeds the maximum limit of 5MB.';
      statusCode = 413;
    }

    reply.status(statusCode).send({
      success: false,
      message: errorMessage,
    });
  }
};

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
