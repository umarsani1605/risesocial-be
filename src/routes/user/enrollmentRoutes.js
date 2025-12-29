import { userEnrollmentController } from '../../controllers/user/enrollmentController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import {
  getEnrollmentByIdSchema,
  getEnrollmentByUserAndAcademySchema,
  getUserEnrollmentsSchema,
  updateProgressSchema,
} from '../../schemas/enrollmentSchemas.js';

export default async function userEnrollmentRoutes(fastify) {
  fastify.get('/:id', {
    schema: getEnrollmentByIdSchema,
    preHandler: optionalAuthMiddleware,
    handler: userEnrollmentController.getEnrollmentById,
  });

  fastify.get('/user/:userId/academy/:academyId', {
    schema: getEnrollmentByUserAndAcademySchema,
    preHandler: optionalAuthMiddleware,
    handler: userEnrollmentController.getEnrollmentByUserAndAcademy,
  });

  fastify.get('/user/:userId', {
    schema: getUserEnrollmentsSchema,
    preHandler: optionalAuthMiddleware,
    handler: userEnrollmentController.getUserEnrollments,
  });

  fastify.put('/:id/progress', {
    schema: updateProgressSchema,
    preHandler: optionalAuthMiddleware,
    handler: userEnrollmentController.updateProgress,
  });
}
