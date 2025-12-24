import { userEnrollmentController } from '../../controllers/user/enrollmentController.js';
import { optionalAuthMiddleware } from '../../middleware/auth.js';
import {
  getEnrollmentByIdSchema,
  getUserEnrollmentsSchema,
  getEnrollmentByUserAndAcademySchema,
  updateProgressSchema,
} from '../../schemas/enrollmentSchemas.js';

export default async function userEnrollmentRoutes(fastify) {
  fastify.get('/:id', {
    preHandler: optionalAuthMiddleware,
    schema: getEnrollmentByIdSchema,
    handler: userEnrollmentController.getEnrollmentById,
  });

  fastify.get('/user/:userId', {
    preHandler: optionalAuthMiddleware,
    schema: getUserEnrollmentsSchema,
    handler: userEnrollmentController.getUserEnrollments,
  });

  fastify.get('/user/:userId/academy/:academyId', {
    preHandler: optionalAuthMiddleware,
    schema: getEnrollmentByUserAndAcademySchema,
    handler: userEnrollmentController.getEnrollmentByUserAndAcademy,
  });

  fastify.put('/:id/progress', {
    preHandler: optionalAuthMiddleware,
    schema: updateProgressSchema,
    handler: userEnrollmentController.updateProgress,
  });
}
