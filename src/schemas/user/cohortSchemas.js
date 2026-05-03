import { createSuccessResponseSchema, createPaginatedResponseSchema, createErrorResponseSchema } from '../shared/baseSchemas.js';

const cohortPublicSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    academy_id: { type: 'integer' },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    status: { type: 'string' },
    start_date: { type: ['string', 'null'] },
    end_date: { type: ['string', 'null'] },
    enrollment_count: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

const cohortDetailSchema = {
  type: 'object',
  properties: {
    ...cohortPublicSchema.properties,
    current_students: { type: 'integer' },
    academy: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'integer' },
        title: { type: 'string' },
        slug: { type: ['string', 'null'] },
        image_url: { type: ['string', 'null'] },
        description: { type: ['string', 'null'] },
        duration: { type: ['string', 'null'] },
        certificate: { type: 'boolean' },
        portfolio: { type: 'boolean' },
        format: { type: ['string', 'null'] },
      },
    },
    mentors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          job_title: { type: ['string', 'null'] },
          avatar: { type: ['string', 'null'] },
        },
      },
    },
  },
};

const moduleWithStatusSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_id: { type: 'integer' },
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
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          label: { type: ['string', 'null'] },
          type: { type: 'string' },
          url: { type: ['string', 'null'] },
          file_url: { type: ['string', 'null'] },
          file_path: { type: ['string', 'null'] },
          file_mime: { type: ['string', 'null'] },
          order: { type: 'integer' },
        },
      },
    },
  },
};

const enrollmentSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    cohort_id: { type: ['integer', 'null'] },
    status: { type: 'string' },
    enrolled_at: { type: ['string', 'null'] },
    completion_date: { type: ['string', 'null'] },
    next_session: { type: ['string', 'null'] },
    total_modules: { type: 'integer' },
    completed_modules: { type: 'integer' },
    has_certificate: { type: 'boolean' },
    certificate_url: { type: ['string', 'null'] },
    created_at: { type: 'string', format: 'date-time' },
    academy: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        title: { type: 'string' },
        slug: { type: ['string', 'null'] },
        image_url: { type: ['string', 'null'] },
        duration: { type: ['string', 'null'] },
        format: { type: ['string', 'null'] },
        certificate: { type: ['boolean', 'null'] },
        description: { type: ['string', 'null'] },
      },
    },
    cohort: {
      type: ['object', 'null'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        status: { type: 'string' },
        start_date: { type: ['string', 'null'] },
        end_date: { type: ['string', 'null'] },
      },
    },
  },
};

const certificateSchema = {
  type: 'object',
  properties: {
    certificate_code: { type: 'string' },
    student_name: { type: 'string' },
    academy_title: { type: 'string' },
    cohort_name: { type: 'string' },
    grades_transcript: { type: ['object', 'null'] },
    issued_at: { type: 'string', format: 'date-time' },
    file_url: { type: ['string', 'null'] },
  },
};

export const getUserCohortsSchema = {
  tags: ['User - Cohorts'],
  summary: 'List available cohorts',
  querystring: {
    type: 'object',
    properties: {
      academy_id: { type: 'integer' },
      status: { type: 'string', enum: ['not_started', 'ongoing', 'completed'] },
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: createPaginatedResponseSchema(cohortPublicSchema, 'List of cohorts'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getCohortStudentsSchema = {
  tags: ['User - Cohorts'],
  summary: 'Get students enrolled in a cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          status: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              avatar: { type: ['string', 'null'] },
            },
          },
        },
      },
    }, 'List of students'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getUserCohortByIdSchema = {
  tags: ['User - Cohorts'],
  summary: 'Get cohort details',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema(cohortDetailSchema, 'Cohort details'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const enrollInCohortSchema = {
  tags: ['User - Cohorts'],
  summary: 'Enroll in a cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    201: createSuccessResponseSchema(
      {
        type: 'object',
        properties: {
          enrollment_id: { type: 'integer' },
          snap_token: { type: 'string' },
          redirect_url: { type: 'string' },
          transaction_code: { type: 'string' },
        },
      },
      'Enrollment created with payment',
    ),
    400: createErrorResponseSchema(400, 'Bad Request'),
    404: createErrorResponseSchema(404, 'Not Found'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getMyEnrollmentsSchema = {
  tags: ['User - Cohorts'],
  summary: "Get current user's enrollments",
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: createPaginatedResponseSchema(enrollmentSchema, 'My enrollments'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getCohortModulesSchema = {
  tags: ['User - Cohort Modules'],
  summary: 'List modules for enrolled cohort',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: moduleWithStatusSchema }, 'Cohort modules'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Not enrolled'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getCohortModuleByIdSchema = {
  tags: ['User - Cohort Modules'],
  summary: 'Get single module details',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id', 'moduleId'],
    properties: { id: { type: 'integer' }, moduleId: { type: 'integer' } },
  },
  response: {
    200: createSuccessResponseSchema(moduleWithStatusSchema, 'Module details'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    403: createErrorResponseSchema(403, 'Forbidden - Not enrolled'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const downloadCertificateSchema = {
  tags: ['User - Certificates'],
  summary: 'Download certificate PDF',
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
};

const upcomingSessionItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    type: { type: 'string', enum: ['session', 'assignment'] },
    title: { type: 'string' },
    link: { type: 'string' },
    cohort_id: { type: 'integer' },
    session_start_time: { type: ['string', 'null'], format: 'date-time' },
    session_end_time: { type: ['string', 'null'], format: 'date-time' },
    assignment_deadline: { type: ['string', 'null'], format: 'date-time' },
  },
};

export const getUpcomingSessionsSchema = {
  tags: ['User - Cohorts'],
  summary: 'Get upcoming sessions and assignments across all active enrollments',
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 20, default: 7 },
    },
  },
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: upcomingSessionItemSchema }, 'Upcoming sessions list'),
    401: createErrorResponseSchema(401, 'Unauthorized'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const verifyCertificateSchema = {
  tags: ['Public - Certificates'],
  summary: 'Verify certificate by code (public)',
  params: {
    type: 'object',
    required: ['code'],
    properties: { code: { type: 'string' } },
  },
  response: {
    200: createSuccessResponseSchema(certificateSchema, 'Certificate details'),
    404: createErrorResponseSchema(404, 'Not Found'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
