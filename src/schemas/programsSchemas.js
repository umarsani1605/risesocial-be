import { body, query, param } from 'express-validator';

// Program Status enum
const PROGRAM_STATUSES = ['ACTIVE', 'INACTIVE', 'DRAFT'];

/**
 * Validation schema for creating a new program
 */
export const createProgramSchema = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters')
    .trim(),

  body('image')
    .notEmpty()
    .withMessage('Image is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Image URL must be between 1 and 500 characters')
    .trim(),

  body('status')
    .optional()
    .isIn(PROGRAM_STATUSES)
    .withMessage(`Status must be one of: ${PROGRAM_STATUSES.join(', ')}`),
];

/**
 * Validation schema for updating a program
 */
export const updateProgramSchema = [
  body('title').optional().isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters').trim(),

  body('description').optional().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),

  body('image').optional().isLength({ min: 1, max: 500 }).withMessage('Image URL must be between 1 and 500 characters').trim(),

  body('status')
    .optional()
    .isIn(PROGRAM_STATUSES)
    .withMessage(`Status must be one of: ${PROGRAM_STATUSES.join(', ')}`),
];

/**
 * Validation schema for program search query parameters
 */
export const searchProgramsSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search').optional().isLength({ max: 200 }).withMessage('Search query must be less than 200 characters').trim(),

  query('status')
    .optional()
    .isIn(PROGRAM_STATUSES)
    .withMessage(`Status must be one of: ${PROGRAM_STATUSES.join(', ')}`),

  query('sortBy').optional().isIn(['createdAt', 'title', 'status']).withMessage('Sort by must be one of: createdAt, title, status'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];

/**
 * Validation schema for featured programs query parameters
 */
export const featuredProgramsSchema = [query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')];

/**
 * Validation schema for program ID parameter
 */
export const programIdSchema = [
  param('id')
    .notEmpty()
    .withMessage('Program ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Program ID must be between 1 and 100 characters')
    .trim(),
];

/**
 * Validation schema for admin program search query parameters
 */
export const adminSearchProgramsSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search').optional().isLength({ max: 200 }).withMessage('Search query must be less than 200 characters').trim(),

  query('status')
    .optional()
    .isIn(PROGRAM_STATUSES)
    .withMessage(`Status must be one of: ${PROGRAM_STATUSES.join(', ')}`),

  query('sortBy').optional().isIn(['createdAt', 'title', 'status']).withMessage('Sort by must be one of: createdAt, title, status'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];
