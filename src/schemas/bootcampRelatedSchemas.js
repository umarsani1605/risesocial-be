import { body, param, query } from 'express-validator';

// ========================
// BOOTCAMP PRICING SCHEMAS
// ========================

const bootcampPricingCreateSchema = [
  body('bootcamp_id').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Nama pricing harus berupa string dengan panjang 1-100 karakter'),

  body('original_price').isInt({ min: 1 }).withMessage('Harga asli harus berupa integer positif'),

  body('discount_price')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Harga diskon harus berupa integer positif atau nol')
    .custom((value, { req }) => {
      if (value && value > req.body.original_price) {
        throw new Error('Harga diskon tidak boleh lebih tinggi dari harga asli');
      }
      return true;
    }),

  body('tier_order').optional().isInt({ min: 1 }).withMessage('Tier order harus berupa integer positif'),
];

const bootcampPricingUpdateSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID pricing harus berupa integer positif'),

  body('name').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Nama pricing harus berupa string dengan panjang 1-100 karakter'),

  body('original_price').optional().isInt({ min: 1 }).withMessage('Harga asli harus berupa integer positif'),

  body('discount_price').optional().isInt({ min: 0 }).withMessage('Harga diskon harus berupa integer positif atau nol'),

  body('tier_order').optional().isInt({ min: 1 }).withMessage('Tier order harus berupa integer positif'),
];

const bootcampPricingReorderSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('order_data').isArray({ min: 1 }).withMessage('Order data harus berupa array yang tidak kosong'),

  body('order_data.*.id').isInt({ min: 1 }).withMessage('ID pricing harus berupa integer positif'),

  body('order_data.*.tier_order').isInt({ min: 1 }).withMessage('Tier order harus berupa integer positif'),
];

// ========================
// BOOTCAMP FEATURE SCHEMAS
// ========================

const bootcampFeatureCreateSchema = [
  body('bootcamp_id').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title feature harus berupa string dengan panjang 1-255 karakter'),

  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Deskripsi feature tidak boleh lebih dari 1000 karakter'),

  body('icon').optional().isString().isLength({ max: 100 }).withMessage('Icon feature tidak boleh lebih dari 100 karakter'),

  body('feature_order').optional().isInt({ min: 1 }).withMessage('Feature order harus berupa integer positif'),
];

const bootcampFeatureUpdateSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID feature harus berupa integer positif'),

  body('title').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Title feature harus berupa string dengan panjang 1-255 karakter'),

  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Deskripsi feature tidak boleh lebih dari 1000 karakter'),

  body('icon').optional().isString().isLength({ max: 100 }).withMessage('Icon feature tidak boleh lebih dari 100 karakter'),

  body('feature_order').optional().isInt({ min: 1 }).withMessage('Feature order harus berupa integer positif'),
];

const bootcampFeatureReorderSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('order_data').isArray({ min: 1 }).withMessage('Order data harus berupa array yang tidak kosong'),

  body('order_data.*.id').isInt({ min: 1 }).withMessage('ID feature harus berupa integer positif'),

  body('order_data.*.feature_order').isInt({ min: 1 }).withMessage('Feature order harus berupa integer positif'),
];

// ========================
// BOOTCAMP TOPIC SCHEMAS
// ========================

const bootcampTopicCreateSchema = [
  body('bootcamp_id').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title topic harus berupa string dengan panjang 1-255 karakter'),

  body('description').optional().isString().isLength({ max: 2000 }).withMessage('Deskripsi topic tidak boleh lebih dari 2000 karakter'),

  body('topic_order').optional().isInt({ min: 1 }).withMessage('Topic order harus berupa integer positif'),
];

const bootcampTopicUpdateSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif'),

  body('title').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Title topic harus berupa string dengan panjang 1-255 karakter'),

  body('description').optional().isString().isLength({ max: 2000 }).withMessage('Deskripsi topic tidak boleh lebih dari 2000 karakter'),

  body('topic_order').optional().isInt({ min: 1 }).withMessage('Topic order harus berupa integer positif'),
];

const bootcampTopicReorderSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('order_data').isArray({ min: 1 }).withMessage('Order data harus berupa array yang tidak kosong'),

  body('order_data.*.id').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif'),

  body('order_data.*.topic_order').isInt({ min: 1 }).withMessage('Topic order harus berupa integer positif'),
];

const bootcampTopicGetSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif'),

  query('include_sessions').optional().isBoolean().withMessage('Include sessions harus berupa boolean'),
];

// ========================
// BOOTCAMP SESSION SCHEMAS
// ========================

const bootcampSessionCreateSchema = [
  body('topic_id').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif'),

  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title session harus berupa string dengan panjang 1-255 karakter'),

  body('session_order').optional().isInt({ min: 1 }).withMessage('Session order harus berupa integer positif'),
];

const bootcampSessionUpdateSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID session harus berupa integer positif'),

  body('title').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Title session harus berupa string dengan panjang 1-255 karakter'),

  body('session_order').optional().isInt({ min: 1 }).withMessage('Session order harus berupa integer positif'),
];

const bootcampSessionReorderSchema = [
  param('topicId').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif'),

  body('order_data').isArray({ min: 1 }).withMessage('Order data harus berupa array yang tidak kosong'),

  body('order_data.*.id').isInt({ min: 1 }).withMessage('ID session harus berupa integer positif'),

  body('order_data.*.session_order').isInt({ min: 1 }).withMessage('Session order harus berupa integer positif'),
];

const bootcampSessionBatchCreateSchema = [
  param('topicId').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif'),

  body('sessions').isArray({ min: 1 }).withMessage('Sessions harus berupa array yang tidak kosong'),

  body('sessions.*.title').isString().isLength({ min: 1, max: 255 }).withMessage('Title session harus berupa string dengan panjang 1-255 karakter'),

  body('sessions.*.session_order').optional().isInt({ min: 1 }).withMessage('Session order harus berupa integer positif'),
];

// ========================
// BOOTCAMP FAQ SCHEMAS
// ========================

const bootcampFaqCreateSchema = [
  body('bootcamp_id').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('question').isString().isLength({ min: 1, max: 500 }).withMessage('Pertanyaan FAQ harus berupa string dengan panjang 1-500 karakter'),

  body('answer').isString().isLength({ min: 1, max: 2000 }).withMessage('Jawaban FAQ harus berupa string dengan panjang 1-2000 karakter'),
];

const bootcampFaqUpdateSchema = [
  param('id').isInt({ min: 1 }).withMessage('ID FAQ harus berupa integer positif'),

  body('question')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Pertanyaan FAQ harus berupa string dengan panjang 1-500 karakter'),

  body('answer').optional().isString().isLength({ min: 1, max: 2000 }).withMessage('Jawaban FAQ harus berupa string dengan panjang 1-2000 karakter'),
];

const bootcampFaqSearchSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  query('keyword').isString().isLength({ min: 1, max: 100 }).withMessage('Keyword pencarian harus berupa string dengan panjang 1-100 karakter'),
];

const bootcampFaqBatchCreateSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  body('faqs').isArray({ min: 1 }).withMessage('FAQs harus berupa array yang tidak kosong'),

  body('faqs.*.question').isString().isLength({ min: 1, max: 500 }).withMessage('Pertanyaan FAQ harus berupa string dengan panjang 1-500 karakter'),

  body('faqs.*.answer').isString().isLength({ min: 1, max: 2000 }).withMessage('Jawaban FAQ harus berupa string dengan panjang 1-2000 karakter'),
];

const bootcampFaqFrequentlyAskedSchema = [
  param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif'),

  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit harus berupa integer antara 1-20'),
];

// ========================
// COMMON SCHEMAS
// ========================

const bootcampIdParamSchema = [param('bootcampId').isInt({ min: 1 }).withMessage('ID bootcamp harus berupa integer positif')];

const idParamSchema = [param('id').isInt({ min: 1 }).withMessage('ID harus berupa integer positif')];

const topicIdParamSchema = [param('topicId').isInt({ min: 1 }).withMessage('ID topic harus berupa integer positif')];

export {
  // Bootcamp Pricing
  bootcampPricingCreateSchema,
  bootcampPricingUpdateSchema,
  bootcampPricingReorderSchema,

  // Bootcamp Feature
  bootcampFeatureCreateSchema,
  bootcampFeatureUpdateSchema,
  bootcampFeatureReorderSchema,

  // Bootcamp Topic
  bootcampTopicCreateSchema,
  bootcampTopicUpdateSchema,
  bootcampTopicReorderSchema,
  bootcampTopicGetSchema,

  // Bootcamp Session
  bootcampSessionCreateSchema,
  bootcampSessionUpdateSchema,
  bootcampSessionReorderSchema,
  bootcampSessionBatchCreateSchema,

  // Bootcamp FAQ
  bootcampFaqCreateSchema,
  bootcampFaqUpdateSchema,
  bootcampFaqSearchSchema,
  bootcampFaqBatchCreateSchema,
  bootcampFaqFrequentlyAskedSchema,

  // Common
  bootcampIdParamSchema,
  idParamSchema,
  topicIdParamSchema,
};
