import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

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
 * @param {string} uploadType - Type of upload ('ESSAY' or 'HEADSHOT')
 * @returns {Object} Processed file info
 */
const processUploadedFile = async (file, allowedTypes, maxSize, uploadType) => {
  console.log('[FileUploadMiddleware] Processing file upload');
  console.log(`[FileUploadMiddleware] Original filename: ${file.filename}, Type: ${file.mimetype}, Size: ${file.file?.bytesRead || 'unknown'} bytes`);

  if (!file) {
    console.error('[FileUploadMiddleware] No file uploaded');
    throw new Error('No file uploaded');
  }

  if (!allowedTypes.includes(file.mimetype)) {
    console.error(`[FileUploadMiddleware] Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`);
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  const isPdf = file.mimetype === 'application/pdf';
  const targetDir = isPdf ? documentsDir : imagesDir;
  const relativeFolderName = isPdf ? 'documents' : 'images';
  console.log(`[FileUploadMiddleware] File type: ${isPdf ? 'PDF' : 'Image'}, Target directory: ${targetDir}`);

  const timestamp = Date.now();
  const extension = path.extname(file.filename);
  const basename = path.basename(file.filename, extension);
  const uniqueFilename = `${timestamp}-${basename}${extension}`;
  const filePath = path.join(targetDir, uniqueFilename);

  console.log(`[FileUploadMiddleware] Generated unique filename: ${uniqueFilename}`);

  const buffer = await file.toBuffer();
  console.log(`[FileUploadMiddleware] File buffer size: ${buffer.length} bytes`);

  if (buffer.length > maxSize) {
    const errorMsg = `File too large: ${Math.round(buffer.length / (1024 * 1024))}MB. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`;
    console.error(`[FileUploadMiddleware] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  console.log(`[FileUploadMiddleware] Writing file to: ${filePath}`);
  await fs.writeFile(filePath, buffer);
  console.log('[FileUploadMiddleware] File successfully written to disk');

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
    const file = await request.file();

    const allowedTypes = ['application/pdf'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB

    const processedFile = await processUploadedFile(file, allowedTypes, maxSize, 'ESSAY');

    request.uploadedFile = processedFile;
  } catch (error) {
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
    const file = await request.file();

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB

    const processedFile = await processUploadedFile(file, allowedTypes, maxSize, 'HEADSHOT');

    request.uploadedFile = processedFile;
  } catch (error) {
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
    const file = await request.file();

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024; // 10MB

    const processedFile = await processUploadedFile(file, allowedTypes, maxSize, 'PAYMENT_PROOF');

    request.uploadedFile = processedFile;
  } catch (error) {
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
  try {
    await fs.remove(filePath);
    return true;
  } catch (err) {
    return false;
  }
};
