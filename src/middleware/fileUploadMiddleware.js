import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fastify-compatible file upload middleware
 * Uses @fastify/multipart plugin instead of multer
 */

// Ensure upload directories exist
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
  if (!file) {
    throw new Error('No file uploaded');
  }

  // Validate file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Determine upload directory based on type
  const targetDir = uploadType === 'ESSAY' ? documentsDir : imagesDir;
  const relativeFolderName = uploadType === 'ESSAY' ? 'documents' : 'images';

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = path.extname(file.filename);
  const basename = path.basename(file.filename, extension);
  const uniqueFilename = `${timestamp}-${random}-${basename}${extension}`;

  const filePath = path.join(targetDir, uniqueFilename);

  // Save file to disk
  const buffer = await file.toBuffer();

  // Validate file size
  if (buffer.length > maxSize) {
    throw new Error(`File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  await fs.writeFile(filePath, buffer);

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

    // Attach processed file to request for controller
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

    // Attach processed file to request for controller
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
