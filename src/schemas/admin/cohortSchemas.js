import { createSuccessResponseSchema, createPaginatedResponseSchema, createErrorResponseSchema } from '../shared/baseSchemas.js';

const academyBasicSchema = {
  type: ['object', 'null'],
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    slug: { type: 'string' },
  },
};

const cohortEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    academy: academyBasicSchema,
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    status: { type: 'string' },
    start_date: { type: ['string', 'null'] },
    end_date: { type: ['string', 'null'] },
    enrollment_count: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const cohortModuleEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_id: { type: 'integer' },
    academy_id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: ['string', 'null'] },
    is_published: { type: 'boolean' },
    session_start_time: { type: ['string', 'null'] },
    session_end_time: { type: ['string', 'null'] },
    meeting_link: { type: ['string', 'null'] },
    attendance_link: { type: ['string', 'null'] },
    assignment_title: { type: ['string', 'null'] },
    assignment_link: { type: ['string', 'null'] },
    assignment_deadline: { type: ['string', 'null'] },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const cohortAttachmentEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_module_id: { type: 'integer' },
    cohort_id: { type: 'integer' },
    academy_id: { type: 'integer' },
    type: { type: 'string' },
    label: { type: ['string', 'null'] },
    file_path: { type: ['string', 'null'] },
    file_mime: { type: ['string', 'null'] },
    file_size_kb: { type: ['integer', 'null'] },
    url: { type: ['string', 'null'] },
    embed_provider: { type: ['string', 'null'] },
    file_url: { type: ['string', 'null'] },
    order: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const cohortEnrollmentEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_id: { type: 'integer' },
    academy_id: { type: 'integer' },
    user_id: { type: 'integer' },
    user: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'integer' },
        first_name: { type: ['string', 'null'] },
        last_name: { type: ['string', 'null'] },
        email: { type: 'string' },
        avatar: { type: ['string', 'null'] },
      },
    },
    transaction_id: { type: ['integer', 'null'] },
    status: { type: 'string' },
    enrolled_at: { type: ['string', 'null'] },
    completion_date: { type: ['string', 'null'] },
    notes: { type: ['string', 'null'] },
    certificate: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'integer' },
        certificate_code: { type: 'string' },
        file_path: { type: ['string', 'null'] },
        file_url: { type: ['string', 'null'] },
      },
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const cohortMentorEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_id: { type: 'integer' },
    academy_id: { type: 'integer' },
    name: { type: 'string' },
    avatar: { type: ['string', 'null'] },
    job_title: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

const cohortCertificateEntitySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_id: { type: 'integer' },
    user_id: { type: 'integer' },
    certificate_code: { type: 'string' },
    student_name: { type: 'string' },
    academy_title: { type: 'string' },
    cohort_name: { type: 'string' },
    grades_transcript: { type: ['object', 'null'] },
    file_path: { type: ['string', 'null'] },
    file_url: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

// --- Cohort CRUD ---

export const getAdminCohortsSchema = {
  tags: ['Admin - Cohorts'],
  summary: 'List all cohorts',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      academy_id: { type: 'integer' },
      status: { type: 'string', enum: ['not_started', 'ongoing', 'completed'] },
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: createPaginatedResponseSchema(cohortEntitySchema, 'List of cohorts'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

const cohortDetailSchema = {
  type: 'object',
  properties: {
    ...cohortEntitySchema.properties,
    academy: academyBasicSchema,
    modules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ...cohortModuleEntitySchema.properties,
          attachments: {
            type: 'array',
            items: cohortAttachmentEntitySchema,
          },
        },
      },
    },
    mentors: {
      type: 'array',
      items: cohortMentorEntitySchema,
    },
  },
};

export const getAdminCohortByIdSchema = {
  tags: ['Admin - Cohorts'],
  summary: 'Get cohort by ID',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema(cohortDetailSchema, 'Cohort details'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const createCohortSchema = {
  tags: ['Admin - Cohorts'],
  summary: 'Create new cohort',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object',
    required: ['academy_id', 'name', 'start_date', 'end_date'],
    properties: {
      academy_id: { type: 'integer' },
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      status: { type: 'string', enum: ['not_started', 'ongoing', 'completed'], default: 'not_started' },
      start_date: { type: 'string', format: 'date' },
      end_date: { type: 'string', format: 'date' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(cohortEntitySchema, 'Cohort created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateCohortSchema = {
  tags: ['Admin - Cohorts'],
  summary: 'Update cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  body: {
    type: 'object',
    required: ['start_date', 'end_date'],
    properties: {
      name: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      status: { type: 'string', enum: ['not_started', 'ongoing', 'completed'] },
      start_date: { type: 'string', format: 'date' },
      end_date: { type: 'string', format: 'date' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(cohortEntitySchema, 'Cohort updated'),
    404: createErrorResponseSchema(404, 'Not Found'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteCohortSchema = {
  tags: ['Admin - Cohorts'],
  summary: 'Delete cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Cohort deleted'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// --- Module CRUD ---

export const createModuleSchema = {
  tags: ['Admin - Cohort Modules'],
  summary: 'Create cohort module',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  body: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: ['string', 'null'] },
      is_published: { type: 'boolean', default: false },
      session_start_time: { type: ['string', 'null'] },
      session_end_time: { type: ['string', 'null'] },
      meeting_link: { type: ['string', 'null'] },
      attendance_link: { type: ['string', 'null'] },
      assignment_title: { type: ['string', 'null'] },
      assignment_link: { type: ['string', 'null'] },
      assignment_deadline: { type: ['string', 'null'] },
      order: { type: 'integer', minimum: 1 },
      copy_from_topic_id: { type: 'integer' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(cohortModuleEntitySchema, 'Module created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateModuleSchema = {
  tags: ['Admin - Cohort Modules'],
  summary: 'Update cohort module',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'moduleId'],
    properties: { id: { type: 'integer' }, moduleId: { type: 'integer' } },
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: ['string', 'null'] },
      is_published: { type: 'boolean' },
      session_start_time: { type: ['string', 'null'] },
      session_end_time: { type: ['string', 'null'] },
      meeting_link: { type: ['string', 'null'] },
      attendance_link: { type: ['string', 'null'] },
      assignment_title: { type: ['string', 'null'] },
      assignment_link: { type: ['string', 'null'] },
      assignment_deadline: { type: ['string', 'null'] },
      order: { type: 'integer', minimum: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(cohortModuleEntitySchema, 'Module updated'),
    404: createErrorResponseSchema(404, 'Not Found'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteModuleSchema = {
  tags: ['Admin - Cohort Modules'],
  summary: 'Delete cohort module',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'moduleId'],
    properties: { id: { type: 'integer' }, moduleId: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Module deleted'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// --- Attachment CRUD ---

export const createAttachmentSchema = {
  tags: ['Admin - Cohort Attachments'],
  summary: 'Create module attachment',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'moduleId'],
    properties: { id: { type: 'integer' }, moduleId: { type: 'integer' } },
  },
  // body schema omitted: this endpoint accepts both multipart/form-data (file) and
  // application/json (external_link, embed_video). For multipart, @fastify/multipart sets
  // request.body = null before preHandler runs, so AJV body validation would reject it.
  // Field validation is handled by the service layer instead.
  response: {
    201: createSuccessResponseSchema(cohortAttachmentEntitySchema, 'Attachment created'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateAttachmentSchema = {
  tags: ['Admin - Cohort Attachments'],
  summary: 'Update module attachment',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'moduleId', 'attachmentId'],
    properties: { id: { type: 'integer' }, moduleId: { type: 'integer' }, attachmentId: { type: 'integer' } },
  },
  body: {
    type: 'object',
    properties: {
      label: { type: 'string' },
      url: { type: 'string' },
      embed_provider: { type: 'string', enum: ['youtube', 'vimeo', 'google_drive', 'zoom', 'other'] },
      order: { type: 'integer', minimum: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(cohortAttachmentEntitySchema, 'Attachment updated'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteAttachmentSchema = {
  tags: ['Admin - Cohort Attachments'],
  summary: 'Delete module attachment',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'moduleId', 'attachmentId'],
    properties: { id: { type: 'integer' }, moduleId: { type: 'integer' }, attachmentId: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Attachment deleted'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// --- Enrollment Management ---

export const getEnrollmentsSchema = {
  tags: ['Admin - Cohort Enrollments'],
  summary: 'List cohort enrollments',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  querystring: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['pending', 'active', 'completed', 'dropped'] },
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: createPaginatedResponseSchema(cohortEnrollmentEntitySchema, 'List of enrollments'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const manualEnrollSchema = {
  tags: ['Admin - Cohort Enrollments'],
  summary: 'Manually enroll a student',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  body: {
    type: 'object',
    required: ['user_id'],
    properties: {
      user_id: { type: 'integer' },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(cohortEnrollmentEntitySchema, 'Student enrolled'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateEnrollmentSchema = {
  tags: ['Admin - Cohort Enrollments'],
  summary: 'Update enrollment status',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'enrollmentId'],
    properties: { id: { type: 'integer' }, enrollmentId: { type: 'integer' } },
  },
  body: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['pending', 'active', 'completed', 'dropped'] },
      completion_date: { type: 'string', format: 'date' },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(cohortEnrollmentEntitySchema, 'Enrollment updated'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// --- Mentor CRUD ---

export const createMentorSchema = {
  tags: ['Admin - Cohort Mentors'],
  summary: 'Add mentor to cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      avatar: { type: 'string' },
      job_title: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(cohortMentorEntitySchema, 'Mentor added'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const updateMentorSchema = {
  tags: ['Admin - Cohort Mentors'],
  summary: 'Update cohort mentor',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'mentorId'],
    properties: { id: { type: 'integer' }, mentorId: { type: 'integer' } },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      avatar: { type: 'string' },
      job_title: { type: 'string' },
    },
    additionalProperties: false,
  },
  response: {
    200: createSuccessResponseSchema(cohortMentorEntitySchema, 'Mentor updated'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const deleteMentorSchema = {
  tags: ['Admin - Cohort Mentors'],
  summary: 'Remove mentor from cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'mentorId'],
    properties: { id: { type: 'integer' }, mentorId: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'null' }, 'Mentor removed'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

// --- Certificate Generation ---

export const generateCertificateSchema = {
  tags: ['Admin - Cohort Certificates'],
  summary: 'Generate certificate for an enrollment',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'enrollmentId'],
    properties: {
      id: { type: 'integer' },
      enrollmentId: { type: 'integer' },
    },
  },
  body: {
    type: 'object',
    properties: {
      grades: {
        type: 'object',
        properties: {
          assignments: { type: 'number', minimum: 0, maximum: 10 },
          case_study: { type: 'number', minimum: 0, maximum: 10 },
          final_test: { type: 'number', minimum: 0, maximum: 10 },
          final_score: { type: 'number', minimum: 0, maximum: 10 },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
  response: {
    201: createSuccessResponseSchema(cohortCertificateEntitySchema, 'Certificate generated'),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    409: createErrorResponseSchema(409, 'Conflict'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
