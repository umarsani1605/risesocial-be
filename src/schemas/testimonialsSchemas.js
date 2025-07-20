import { body, query, param } from 'express-validator';

// Testimonial Status enum
const TESTIMONIAL_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];

/**
 * Validation schema for creating a new testimonial
 */
export const createTestimonialSchema = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters')
    .trim(),

  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters')
    .trim(),

  body('text')
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Text must be between 10 and 5000 characters')
    .trim(),

  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

  body('status')
    .optional()
    .isIn(TESTIMONIAL_STATUSES)
    .withMessage(`Status must be one of: ${TESTIMONIAL_STATUSES.join(', ')}`),

  body('featured').optional().isBoolean().withMessage('Featured must be a boolean value'),
];

/**
 * Validation schema for updating a testimonial
 */
export const updateTestimonialSchema = [
  body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters').trim(),

  body('country').optional().isLength({ min: 2, max: 100 }).withMessage('Country must be between 2 and 100 characters').trim(),

  body('text').optional().isLength({ min: 10, max: 5000 }).withMessage('Text must be between 10 and 5000 characters').trim(),

  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),

  body('status')
    .optional()
    .isIn(TESTIMONIAL_STATUSES)
    .withMessage(`Status must be one of: ${TESTIMONIAL_STATUSES.join(', ')}`),

  body('featured').optional().isBoolean().withMessage('Featured must be a boolean value'),
];

/**
 * Validation schema for testimonial search query parameters
 */
export const searchTestimonialsSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search').optional().isLength({ max: 200 }).withMessage('Search query must be less than 200 characters').trim(),

  query('status')
    .optional()
    .isIn(TESTIMONIAL_STATUSES)
    .withMessage(`Status must be one of: ${TESTIMONIAL_STATUSES.join(', ')}`),

  query('country').optional().isLength({ max: 100 }).withMessage('Country filter must be less than 100 characters').trim(),

  query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Minimum rating must be between 1 and 5'),

  query('featured').optional().isBoolean().withMessage('Featured filter must be a boolean'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'rating', 'country', 'featured'])
    .withMessage('Sort by must be one of: createdAt, name, rating, country, featured'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];

/**
 * Validation schema for featured testimonials query parameters
 */
export const featuredTestimonialsSchema = [query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')];

/**
 * Validation schema for testimonial ID parameter
 */
export const testimonialIdSchema = [
  param('id').notEmpty().withMessage('Testimonial ID is required').isInt({ min: 1 }).withMessage('Testimonial ID must be a positive integer'),
];

/**
 * Validation schema for country parameter
 */
export const countryParamSchema = [
  param('country')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters')
    .trim(),
];

/**
 * Validation schema for rating parameter
 */
export const ratingParamSchema = [
  param('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

/**
 * Validation schema for testimonials by country query parameters
 */
export const testimonialsByCountrySchema = [
  ...countryParamSchema,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

/**
 * Validation schema for testimonials by rating query parameters
 */
export const testimonialsByRatingSchema = [
  ...ratingParamSchema,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

/**
 * Validation schema for admin testimonial search query parameters
 */
export const adminSearchTestimonialsSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search').optional().isLength({ max: 200 }).withMessage('Search query must be less than 200 characters').trim(),

  query('status')
    .optional()
    .isIn(TESTIMONIAL_STATUSES)
    .withMessage(`Status must be one of: ${TESTIMONIAL_STATUSES.join(', ')}`),

  query('country').optional().isLength({ max: 100 }).withMessage('Country filter must be less than 100 characters').trim(),

  query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Minimum rating must be between 1 and 5'),

  query('featured').optional().isBoolean().withMessage('Featured filter must be a boolean'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'rating', 'country', 'featured', 'status'])
    .withMessage('Sort by must be one of: createdAt, name, rating, country, featured, status'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];
