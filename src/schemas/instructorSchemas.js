import { body, param, query } from 'express-validator';

// ========================
// INSTRUCTOR SCHEMAS
// ========================

const instructorCreateSchema = [
  body('name').isString().isLength({ min: 2, max: 255 }).withMessage('Nama instructor harus berupa string dengan panjang 2-255 karakter'),

  body('job_title').optional().isString().isLength({ max: 255 }).withMessage('Job title tidak boleh lebih dari 255 karakter'),

  body('avatar_url')
    .optional()
    .isString()
    .isURL()
    .isLength({ max: 500 })
    .withMessage('Avatar URL harus berupa URL valid dengan maksimal 500 karakter'),

  body('description').optional().isString().isLength({ max: 2000 }).withMessage('Deskripsi tidak boleh lebih dari 2000 karakter'),
];

const instructorUpdateSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),

  body('name').optional().isString().isLength({ min: 2, max: 255 }).withMessage('Nama instructor harus berupa string dengan panjang 2-255 karakter'),

  body('job_title').optional().isString().isLength({ max: 255 }).withMessage('Job title tidak boleh lebih dari 255 karakter'),

  body('avatar_url')
    .optional()
    .isString()
    .isURL()
    .isLength({ max: 500 })
    .withMessage('Avatar URL harus berupa URL valid dengan maksimal 500 karakter'),

  body('description').optional().isString().isLength({ max: 2000 }).withMessage('Deskripsi tidak boleh lebih dari 2000 karakter'),
];

const instructorGetSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),

  query('include_bootcamps').optional().isBoolean().withMessage('Include bootcamps harus berupa boolean'),
];

const instructorListSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa integer positif'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus berupa integer antara 1-100'),

  query('search').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Search query harus berupa string dengan panjang 1-100 karakter'),

  query('include_bootcamps').optional().isBoolean().withMessage('Include bootcamps harus berupa boolean'),
];

const instructorSearchSchema = [
  query('name').isString().isLength({ min: 1, max: 255 }).withMessage('Nama untuk pencarian harus berupa string dengan panjang 1-255 karakter'),
];

const instructorJobTitleSchema = [
  query('job_title')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Job title untuk pencarian harus berupa string dengan panjang 1-255 karakter'),
];

const instructorPopularSchema = [query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit harus berupa integer antara 1-50')];

// ========================
// BOOTCAMP INSTRUCTOR ASSIGNMENT SCHEMAS
// ========================

const assignInstructorSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('instructor_id').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),

  body('instructor_order').optional().isInt({ min: 1 }).withMessage('Instructor order harus berupa integer positif'),
];

const removeInstructorSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  param('instructorId').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),
];

const reorderInstructorsSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('order_data').isArray({ min: 1 }).withMessage('Order data harus berupa array yang tidak kosong'),

  body('order_data.*.instructor_id').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),

  body('order_data.*.instructor_order').isInt({ min: 1 }).withMessage('Instructor order harus berupa integer positif'),
];

const batchAssignInstructorsSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('instructor_ids').isArray({ min: 1 }).withMessage('Instructor IDs harus berupa array yang tidak kosong'),

  body('instructor_ids.*').isInt({ min: 1 }).withMessage('Setiap instructor ID harus berupa integer positif'),
];

const batchRemoveInstructorsSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('instructor_ids').isArray({ min: 1 }).withMessage('Instructor IDs harus berupa array yang tidak kosong'),

  body('instructor_ids.*').isInt({ min: 1 }).withMessage('Setiap instructor ID harus berupa integer positif'),
];

const getAssignmentDetailSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  param('instructorId').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),
];

const getInstructorsByBootcampSchema = [param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif')];

const getBootcampsByInstructorSchema = [param('instructorId').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif')];

const getAvailableInstructorsSchema = [param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif')];

// ========================
// COMBINED SCHEMAS
// ========================

const instructorBootcampOverviewSchema = [
  param('instructorId').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),

  query('include_details').optional().isBoolean().withMessage('Include details harus berupa boolean'),
];

const bootcampInstructorOverviewSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  query('include_details').optional().isBoolean().withMessage('Include details harus berupa boolean'),
];

// ========================
// COMMON SCHEMAS
// ========================

const instructorIdParamSchema = [param('instructorId').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif')];

const bootcampIdParamSchema = [param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif')];

const idParamSchema = [param('id').isInt({ min: 1 }).withMessage('ID harus berupa integer positif')];

// ========================
// BULK OPERATION SCHEMAS
// ========================

const bulkCreateInstructorsSchema = [
  body('instructors').isArray({ min: 1, max: 10 }).withMessage('Instructors harus berupa array dengan 1-10 item'),

  body('instructors.*.name')
    .isString()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama instructor harus berupa string dengan panjang 2-255 karakter'),

  body('instructors.*.job_title').optional().isString().isLength({ max: 255 }).withMessage('Job title tidak boleh lebih dari 255 karakter'),

  body('instructors.*.avatar_url')
    .optional()
    .isString()
    .isURL()
    .isLength({ max: 500 })
    .withMessage('Avatar URL harus berupa URL valid dengan maksimal 500 karakter'),

  body('instructors.*.description').optional().isString().isLength({ max: 2000 }).withMessage('Deskripsi tidak boleh lebih dari 2000 karakter'),
];

const bulkUpdateInstructorsSchema = [
  body('updates').isArray({ min: 1, max: 10 }).withMessage('Updates harus berupa array dengan 1-10 item'),

  body('updates.*.id').isInt({ min: 1 }).withMessage('ID instructor harus berupa integer positif'),

  body('updates.*.name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama instructor harus berupa string dengan panjang 2-255 karakter'),

  body('updates.*.job_title').optional().isString().isLength({ max: 255 }).withMessage('Job title tidak boleh lebih dari 255 karakter'),

  body('updates.*.avatar_url')
    .optional()
    .isString()
    .isURL()
    .isLength({ max: 500 })
    .withMessage('Avatar URL harus berupa URL valid dengan maksimal 500 karakter'),

  body('updates.*.description').optional().isString().isLength({ max: 2000 }).withMessage('Deskripsi tidak boleh lebih dari 2000 karakter'),
];

const bulkDeleteInstructorsSchema = [
  body('instructor_ids').isArray({ min: 1, max: 10 }).withMessage('Instructor IDs harus berupa array dengan 1-10 item'),

  body('instructor_ids.*').isInt({ min: 1 }).withMessage('Setiap instructor ID harus berupa integer positif'),
];

// ========================
// FILTER SCHEMAS
// ========================

const instructorFilterSchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa integer positif'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus berupa integer antara 1-100'),

  query('search').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Search query harus berupa string dengan panjang 1-100 karakter'),

  query('job_title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Job title filter harus berupa string dengan panjang 1-255 karakter'),

  query('experience_level')
    .optional()
    .isIn(['Junior', 'Mid-Level', 'Senior', 'Executive'])
    .withMessage('Experience level harus salah satu dari: Junior, Mid-Level, Senior, Executive'),

  query('instructor_type')
    .optional()
    .isIn(['Technical', 'Design', 'Product', 'Data', 'Marketing', 'General'])
    .withMessage('Instructor type harus salah satu dari: Technical, Design, Product, Data, Marketing, General'),

  query('has_avatar').optional().isBoolean().withMessage('Has avatar harus berupa boolean'),

  query('has_description').optional().isBoolean().withMessage('Has description harus berupa boolean'),

  query('min_bootcamp_count').optional().isInt({ min: 0 }).withMessage('Min bootcamp count harus berupa integer non-negatif'),

  query('max_bootcamp_count').optional().isInt({ min: 0 }).withMessage('Max bootcamp count harus berupa integer non-negatif'),

  query('sort_by')
    .optional()
    .isIn(['name', 'created_at', 'updated_at', 'bootcamp_count'])
    .withMessage('Sort by harus salah satu dari: name, created_at, updated_at, bootcamp_count'),

  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order harus asc atau desc'),

  query('include_bootcamps').optional().isBoolean().withMessage('Include bootcamps harus berupa boolean'),
];

export {
  // Instructor basic operations
  instructorCreateSchema,
  instructorUpdateSchema,
  instructorGetSchema,
  instructorListSchema,
  instructorSearchSchema,
  instructorJobTitleSchema,
  instructorPopularSchema,

  // Bootcamp-Instructor assignments
  assignInstructorSchema,
  removeInstructorSchema,
  reorderInstructorsSchema,
  batchAssignInstructorsSchema,
  batchRemoveInstructorsSchema,
  getAssignmentDetailSchema,
  getInstructorsByBootcampSchema,
  getBootcampsByInstructorSchema,
  getAvailableInstructorsSchema,

  // Combined operations
  instructorBootcampOverviewSchema,
  bootcampInstructorOverviewSchema,

  // Bulk operations
  bulkCreateInstructorsSchema,
  bulkUpdateInstructorsSchema,
  bulkDeleteInstructorsSchema,

  // Advanced filtering
  instructorFilterSchema,

  // Common
  instructorIdParamSchema,
  bootcampIdParamSchema,
  idParamSchema,
};
