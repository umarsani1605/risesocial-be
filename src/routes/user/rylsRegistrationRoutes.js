import { userRylsRegistrationController } from '../../controllers/user/rylsRegistrationController.js';
import {
  getRegistrationBySubmissionIdSchema,
  checkEmailExistsSchema,
  userRegistrationHealthCheckSchema,
  submitRegistrationSchema,
} from '../../schemas/admin/rylsRegistrationSchemas.js';

export default async function userRylsRegistrationRoutes(fastify) {
  fastify.post('/submit', {
    schema: submitRegistrationSchema,
    handler: userRylsRegistrationController.submitRegistration,
  });

  fastify.get('/submission/:submissionId', {
    schema: getRegistrationBySubmissionIdSchema,
    handler: userRylsRegistrationController.getRegistrationBySubmissionId,
  });

  fastify.get('/check-email/:email', {
    schema: checkEmailExistsSchema,
    handler: userRylsRegistrationController.checkEmailExists,
  });

  fastify.get('/health', {
    schema: userRegistrationHealthCheckSchema,
    handler: userRylsRegistrationController.healthCheck,
  });
}
