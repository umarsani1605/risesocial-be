/**
 * Upload Middleware Factory
 * Replaces 6+ duplicated upload middleware functions with a single factory.
 *
 * Usage:
 *   import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';
 *   preHandler: [createUploadMiddleware('academy_image')]
 */

import { UPLOAD_CONFIG } from '../config/uploadConfig.js';
import { errorResponse } from '../utils/response.js';

/**
 * Create a configured upload preHandler for a given upload type.
 * - If request is not multipart, passes through (supports JSON-only requests).
 * - Consumes the multipart stream ONCE via toBuffer().
 * - Validates MIME type and file size, returns 400 on failure.
 * - Attaches { buffer, originalName, mimeType, size, uploadType } to request.uploadedFile.
 * - Parses non-file form fields into request.body.
 *
 * @param {string} uploadType - Key from UPLOAD_CONFIG (e.g. 'academy_image')
 * @returns {Function} Fastify preHandler middleware
 */
export function createUploadMiddleware(uploadType) {
  const config = UPLOAD_CONFIG[uploadType];

  if (!config) {
    throw new Error(`[uploadMiddleware] Unknown uploadType: "${uploadType}". Check UPLOAD_CONFIG.`);
  }

  return async function uploadPreHandler(request, reply) {
    // Skip if not a multipart request (allow JSON-only or no-file updates)
    if (!request.isMultipart()) {
      request.uploadedFile = null;
      return;
    }

    let fileAttached = false;
    const bodyFields = {};

    try {
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === 'file') {
          if (fileAttached) {
            // Drain extra files to avoid hanging the request
            await part.toBuffer();
            continue;
          }


          // Validate MIME type (skip if mimeTypes is null — all types allowed)
          if (config.mimeTypes && !config.mimeTypes.includes(part.mimetype)) {
            await part.toBuffer(); // drain stream before replying
            return reply.status(400).send(errorResponse(`Invalid file type. Allowed: ${config.mimeTypes.join(', ')}`, 400));
          }

          // Consume stream ONCE
          const buffer = await part.toBuffer();

          // Validate size
          if (buffer.length > config.maxSize) {
            const maxMB = Math.round(config.maxSize / (1024 * 1024));
            return reply.status(400).send(errorResponse(`File too large. Maximum size: ${maxMB}MB`, 400));
          }

          request.uploadedFile = {
            buffer,
            originalName: part.filename,
            mimeType: part.mimetype,
            size: buffer.length,
            uploadType,
          };

          fileAttached = true;
        } else {
          // Text/JSON field — collect into body
          const value = part.value;
          bodyFields[part.fieldname] = value;
        }
      }

      // Merge parsed fields into request.body
      if (Object.keys(bodyFields).length > 0) {
        // Try to parse JSON fields (e.g. when body was sent as JSON string in form)
        request.body = request.body || {};
        for (const [key, value] of Object.entries(bodyFields)) {
          try {
            request.body[key] = JSON.parse(value);
          } catch {
            request.body[key] = value;
          }
        }
      }

      if (!fileAttached) {
        request.uploadedFile = null;
      }

    } catch (error) {
      return reply.status(400).send(errorResponse('Failed to parse file upload', 400));
    }
  };
}
