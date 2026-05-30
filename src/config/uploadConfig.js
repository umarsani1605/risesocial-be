/**
 * Upload Configuration
 * Centralized definitions for all upload types: allowed MIME types, max size, storage path.
 */

const MB = 1024 * 1024;

export const UPLOAD_CONFIG = {
  ryls_essay: {
    mimeTypes: ['application/pdf'],
    maxSize: 10 * MB,
    storagePath: 'ryls/essays',
  },
  ryls_headshot: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 5 * MB,
    storagePath: 'ryls/headshots',
  },
  ryls_payment_proof: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSize: 5 * MB,
    storagePath: 'ryls/payments',
  },
  cohort_attachment: {
    mimeTypes: null, // no restriction — all file types allowed
    maxSize: 20 * MB,
    storagePath: 'cohorts/attachments',
  },
  academy_image: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * MB,
    storagePath: 'academies/images',
  },
  broadcast_image: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * MB,
    storagePath: 'images/broadcasts',
  },
  user_avatar: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * MB,
    storagePath: 'users/avatars',
  },
  instructor_avatar: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * MB,
    storagePath: 'instructors/avatars',
  },
};
