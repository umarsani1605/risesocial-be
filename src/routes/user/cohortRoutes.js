import { userCohortController } from '../../controllers/user/cohortController.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  getUserCohortsSchema,
  getUserCohortByIdSchema,
  enrollInCohortSchema,
  getMyEnrollmentsSchema,
  getCohortModulesSchema,
  getCohortModuleByIdSchema,
  getCohortStudentsSchema,
  downloadCertificateSchema,
  verifyCertificateSchema,
} from '../../schemas/user/cohortSchemas.js';

export default async function userCohortRoutes(fastify) {
  // Public cohort listing
  fastify.get('/', { schema: getUserCohortsSchema, handler: userCohortController.getAllCohorts });
  fastify.get('/:id', { schema: getUserCohortByIdSchema, handler: userCohortController.getCohortById });

  // Authenticated enrollment
  fastify.post('/:id/enroll', {
    schema: enrollInCohortSchema,
    preHandler: [authMiddleware],
    handler: userCohortController.enrollInCohort,
  });

  // My enrollments
  fastify.get('/my', {
    schema: getMyEnrollmentsSchema,
    preHandler: [authMiddleware],
    handler: userCohortController.getMyEnrollments,
  });

  // Students in cohort (enrollment required)
  fastify.get('/:id/students', {
    schema: getCohortStudentsSchema,
    preHandler: [authMiddleware],
    handler: userCohortController.getCohortStudents,
  });

  // Module access (enrollment required)
  fastify.get('/:id/modules', {
    schema: getCohortModulesSchema,
    preHandler: [authMiddleware],
    handler: userCohortController.getCohortModules,
  });

  fastify.get('/:id/modules/:moduleId', {
    schema: getCohortModuleByIdSchema,
    preHandler: [authMiddleware],
    handler: userCohortController.getCohortModuleById,
  });

  // Certificate download (authenticated)
  fastify.get('/:id/certificate/download', {
    schema: downloadCertificateSchema,
    preHandler: [authMiddleware],
    handler: userCohortController.downloadCertificate,
  });
}

// Public certificate verification - registered separately in config/routes.js
export async function certificateVerifyRoutes(fastify) {
  fastify.get('/verify/:code', {
    schema: verifyCertificateSchema,
    handler: userCohortController.verifyCertificate,
  });
}
