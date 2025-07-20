import { body, param, query } from 'express-validator';

/**
 * EnrollmentSchemas - Validasi untuk enrollment endpoints
 * Menggunakan express-validator untuk validasi request
 */
const EnrollmentSchemas = {
  // Validasi untuk membuat enrollment baru
  createEnrollment: [
    body('user_id').isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    body('bootcamp_id').isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    body('pricing_tier_id').optional().isInt({ min: 1 }).withMessage('Pricing tier ID harus berupa angka positif'),

    body('enrollment_status').optional().isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),

    body('progress_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress percentage harus antara 0 dan 100'),
  ],

  // Validasi untuk update enrollment
  updateEnrollment: [
    param('id').isInt({ min: 1 }).withMessage('ID enrollment harus berupa angka positif'),

    body('enrollment_status').optional().isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),

    body('progress_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress percentage harus antara 0 dan 100'),

    body('pricing_tier_id').optional().isInt({ min: 1 }).withMessage('Pricing tier ID harus berupa angka positif'),
  ],

  // Validasi untuk update progress
  updateProgress: [
    param('id').isInt({ min: 1 }).withMessage('ID enrollment harus berupa angka positif'),

    body('progress_percentage').isInt({ min: 0, max: 100 }).withMessage('Progress percentage harus antara 0 dan 100'),
  ],

  // Validasi untuk update status
  updateStatus: [
    param('id').isInt({ min: 1 }).withMessage('ID enrollment harus berupa angka positif'),

    body('enrollment_status').isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),
  ],

  // Validasi untuk bulk update status
  bulkUpdateStatus: [
    body('enrollment_ids').isArray({ min: 1 }).withMessage('Enrollment IDs harus berupa array dan tidak boleh kosong'),

    body('enrollment_ids.*').isInt({ min: 1 }).withMessage('Setiap enrollment ID harus berupa angka positif'),

    body('enrollment_status').isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),
  ],

  // Validasi untuk mendapatkan enrollment by ID
  getEnrollmentById: [param('id').isInt({ min: 1 }).withMessage('ID enrollment harus berupa angka positif')],

  // Validasi untuk mendapatkan enrollment by user dan bootcamp
  getEnrollmentByUserAndBootcamp: [
    param('userId').isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    param('bootcampId').isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),
  ],

  // Validasi untuk mendapatkan user enrollments
  getUserEnrollments: [
    param('userId').isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    query('enrollment_status').optional().isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),

    query('progress_min').optional().isInt({ min: 0, max: 100 }).withMessage('Progress minimum harus antara 0 dan 100'),

    query('progress_max').optional().isInt({ min: 0, max: 100 }).withMessage('Progress maximum harus antara 0 dan 100'),

    query('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),

    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1 dan 100'),
  ],

  // Validasi untuk mendapatkan bootcamp enrollments
  getBootcampEnrollments: [
    param('bootcampId').isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('enrollment_status').optional().isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),

    query('progress_min').optional().isInt({ min: 0, max: 100 }).withMessage('Progress minimum harus antara 0 dan 100'),

    query('progress_max').optional().isInt({ min: 0, max: 100 }).withMessage('Progress maximum harus antara 0 dan 100'),

    query('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),

    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1 dan 100'),
  ],

  // Validasi untuk mendapatkan semua enrollments
  getAllEnrollments: [
    query('user_id').optional().isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('enrollment_status').optional().isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),

    query('progress_min').optional().isInt({ min: 0, max: 100 }).withMessage('Progress minimum harus antara 0 dan 100'),

    query('progress_max').optional().isInt({ min: 0, max: 100 }).withMessage('Progress maximum harus antara 0 dan 100'),

    query('enrolled_from').optional().isISO8601().toDate().withMessage('Tanggal mulai enrollment harus berupa tanggal yang valid'),

    query('enrolled_to').optional().isISO8601().toDate().withMessage('Tanggal akhir enrollment harus berupa tanggal yang valid'),

    query('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),

    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1 dan 100'),

    query('include_user').optional().isBoolean().withMessage('Include user harus berupa boolean'),

    query('include_bootcamp').optional().isBoolean().withMessage('Include bootcamp harus berupa boolean'),

    query('include_pricing').optional().isBoolean().withMessage('Include pricing harus berupa boolean'),
  ],

  // Validasi untuk mendapatkan enrollment statistics
  getEnrollmentStats: [
    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('user_id').optional().isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    query('date_from').optional().isISO8601().toDate().withMessage('Tanggal mulai harus berupa tanggal yang valid'),

    query('date_to').optional().isISO8601().toDate().withMessage('Tanggal akhir harus berupa tanggal yang valid'),
  ],

  // Validasi untuk mendapatkan expiring enrollments
  getExpiringEnrollments: [query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Jumlah hari harus antara 1 dan 365')],

  // Validasi untuk mendapatkan top learners
  getTopLearners: [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1 dan 100'),

    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),
  ],

  // Validasi untuk search enrollments
  searchEnrollments: [
    query('q').optional().isLength({ min: 1 }).withMessage('Query pencarian tidak boleh kosong'),

    query('user_name').optional().isLength({ min: 1 }).withMessage('Nama user tidak boleh kosong'),

    query('bootcamp_title').optional().isLength({ min: 1 }).withMessage('Judul bootcamp tidak boleh kosong'),

    query('email').optional().isEmail().withMessage('Email harus berupa email yang valid'),

    query('enrollment_status').optional().isIn(['ENROLLED', 'COMPLETED', 'CANCELLED', 'SUSPENDED']).withMessage('Status enrollment tidak valid'),

    query('progress_min').optional().isInt({ min: 0, max: 100 }).withMessage('Progress minimum harus antara 0 dan 100'),

    query('progress_max').optional().isInt({ min: 0, max: 100 }).withMessage('Progress maximum harus antara 0 dan 100'),

    query('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),

    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1 dan 100'),
  ],

  // Validasi untuk mendapatkan enrollment overview
  getEnrollmentOverview: [
    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('user_id').optional().isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    query('date_from').optional().isISO8601().toDate().withMessage('Tanggal mulai harus berupa tanggal yang valid'),

    query('date_to').optional().isISO8601().toDate().withMessage('Tanggal akhir harus berupa tanggal yang valid'),
  ],

  // Validasi untuk enrollment analysis
  getEnrollmentAnalysis: [
    query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Period harus berupa daily, weekly, monthly, atau yearly'),

    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('date_from').optional().isISO8601().toDate().withMessage('Tanggal mulai harus berupa tanggal yang valid'),

    query('date_to').optional().isISO8601().toDate().withMessage('Tanggal akhir harus berupa tanggal yang valid'),
  ],

  // Validasi untuk enrollment trends
  getEnrollmentTrends: [
    query('period').optional().isIn(['7days', '30days', '90days', '1year']).withMessage('Period harus berupa 7days, 30days, 90days, atau 1year'),

    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('group_by').optional().isIn(['day', 'week', 'month']).withMessage('Group by harus berupa day, week, atau month'),
  ],

  // Validasi untuk enrollment reports
  getEnrollmentReports: [
    query('type')
      .optional()
      .isIn(['summary', 'detailed', 'progress', 'completion'])
      .withMessage('Type harus berupa summary, detailed, progress, atau completion'),

    query('format').optional().isIn(['json', 'csv', 'excel']).withMessage('Format harus berupa json, csv, atau excel'),

    query('bootcamp_id').optional().isInt({ min: 1 }).withMessage('Bootcamp ID harus berupa angka positif'),

    query('user_id').optional().isInt({ min: 1 }).withMessage('User ID harus berupa angka positif'),

    query('date_from').optional().isISO8601().toDate().withMessage('Tanggal mulai harus berupa tanggal yang valid'),

    query('date_to').optional().isISO8601().toDate().withMessage('Tanggal akhir harus berupa tanggal yang valid'),
  ],
};

export { EnrollmentSchemas };
