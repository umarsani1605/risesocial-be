import { body, query, param } from 'express-validator';

// Job Types enum
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'REMOTE'];

// Experience Levels enum
const EXPERIENCE_LEVELS = ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR'];

/**
 * Validation schema for creating a new job
 */
export const createJobSchema = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters')
    .trim(),

  body('company')
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company must be between 2 and 100 characters')
    .trim(),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters')
    .trim(),

  body('jobType')
    .notEmpty()
    .withMessage('Job type is required')
    .isIn(JOB_TYPES)
    .withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),

  body('experienceLevel')
    .notEmpty()
    .withMessage('Experience level is required')
    .isIn(EXPERIENCE_LEVELS)
    .withMessage(`Experience level must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),

  body('minSalary').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),

  body('maxSalary')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number')
    .custom((value, { req }) => {
      if (req.body.minSalary && value < req.body.minSalary) {
        throw new Error('Maximum salary must be greater than minimum salary');
      }
      return true;
    }),

  body('skills').optional().isArray({ min: 1 }).withMessage('Skills must be an array with at least one item'),

  body('skills.*').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Each skill must be between 1 and 50 characters').trim(),

  body('requirements').optional().isArray().withMessage('Requirements must be an array'),

  body('requirements.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Each requirement must be between 1 and 500 characters')
    .trim(),

  body('benefits').optional().isArray().withMessage('Benefits must be an array'),

  body('benefits.*').optional().isString().isLength({ min: 1, max: 500 }).withMessage('Each benefit must be between 1 and 500 characters').trim(),

  body('isRemote').optional().isBoolean().withMessage('isRemote must be a boolean'),

  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    }),

  body('applicationUrl').optional().isURL().withMessage('Application URL must be a valid URL'),

  body('contactEmail').optional().isEmail().withMessage('Contact email must be a valid email address').normalizeEmail(),

  body('companyDescription').optional().isLength({ max: 1000 }).withMessage('Company description must be less than 1000 characters').trim(),

  body('companyWebsite').optional().isURL().withMessage('Company website must be a valid URL'),

  body('companySize').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Company size must be between 1 and 50 characters').trim(),
];

/**
 * Validation schema for updating a job
 */
export const updateJobSchema = [
  body('title').optional().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters').trim(),

  body('description').optional().isLength({ min: 50, max: 5000 }).withMessage('Description must be between 50 and 5000 characters').trim(),

  body('company').optional().isLength({ min: 2, max: 100 }).withMessage('Company must be between 2 and 100 characters').trim(),

  body('location').optional().isLength({ min: 2, max: 100 }).withMessage('Location must be between 2 and 100 characters').trim(),

  body('jobType')
    .optional()
    .isIn(JOB_TYPES)
    .withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),

  body('experienceLevel')
    .optional()
    .isIn(EXPERIENCE_LEVELS)
    .withMessage(`Experience level must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),

  body('minSalary').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),

  body('maxSalary')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number')
    .custom((value, { req }) => {
      if (req.body.minSalary && value < req.body.minSalary) {
        throw new Error('Maximum salary must be greater than minimum salary');
      }
      return true;
    }),

  body('skills').optional().isArray({ min: 1 }).withMessage('Skills must be an array with at least one item'),

  body('skills.*').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Each skill must be between 1 and 50 characters').trim(),

  body('requirements').optional().isArray().withMessage('Requirements must be an array'),

  body('requirements.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Each requirement must be between 1 and 500 characters')
    .trim(),

  body('benefits').optional().isArray().withMessage('Benefits must be an array'),

  body('benefits.*').optional().isString().isLength({ min: 1, max: 500 }).withMessage('Each benefit must be between 1 and 500 characters').trim(),

  body('isRemote').optional().isBoolean().withMessage('isRemote must be a boolean'),

  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    }),

  body('applicationUrl').optional().isURL().withMessage('Application URL must be a valid URL'),

  body('contactEmail').optional().isEmail().withMessage('Contact email must be a valid email address').normalizeEmail(),

  body('companyDescription').optional().isLength({ max: 1000 }).withMessage('Company description must be less than 1000 characters').trim(),

  body('companyWebsite').optional().isURL().withMessage('Company website must be a valid URL'),

  body('companySize').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Company size must be between 1 and 50 characters').trim(),
];

/**
 * Validation schema for job search query parameters
 */
export const searchJobsSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search').optional().isLength({ max: 200 }).withMessage('Search query must be less than 200 characters').trim(),

  query('location').optional().isLength({ max: 100 }).withMessage('Location filter must be less than 100 characters').trim(),

  query('jobType')
    .optional()
    .isIn(JOB_TYPES)
    .withMessage(`Job type must be one of: ${JOB_TYPES.join(', ')}`),

  query('experienceLevel')
    .optional()
    .isIn(EXPERIENCE_LEVELS)
    .withMessage(`Experience level must be one of: ${EXPERIENCE_LEVELS.join(', ')}`),

  query('minSalary').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),

  query('maxSalary').optional().isInt({ min: 0 }).withMessage('Maximum salary must be a positive number'),

  query('isRemote').optional().isBoolean().withMessage('isRemote must be a boolean'),

  query('companyName').optional().isLength({ max: 100 }).withMessage('Company name filter must be less than 100 characters').trim(),

  query('skills').optional().isLength({ max: 500 }).withMessage('Skills filter must be less than 500 characters').trim(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'company', 'location', 'minSalary', 'maxSalary'])
    .withMessage('Sort by must be one of: createdAt, title, company, location, minSalary, maxSalary'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];

/**
 * Validation schema for job recommendations query parameters
 */
export const jobRecommendationsSchema = [query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')];

/**
 * Validation schema for job ID parameter
 */
export const jobIdSchema = [
  param('id')
    .notEmpty()
    .withMessage('Job ID is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Job ID must be between 1 and 100 characters')
    .trim(),
];
