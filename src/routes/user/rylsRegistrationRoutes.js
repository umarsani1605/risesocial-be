import { userRylsRegistrationController } from '../../controllers/user/rylsRegistrationController.js';
import {
  getRegistrationBySubmissionIdSchema,
  checkEmailExistsSchema,
  userRegistrationHealthCheckSchema,
  submitRegistrationSchema,
} from '../../schemas/admin/rylsRegistrationSchemas.js';
import { rylsDraftController } from '../../controllers/user/rylsDraftController.js';
import { saveDraftSchema, getDraftSchema, deleteDraftSchema } from '../../schemas/rylsDraftSchemas.js';

export default async function userRylsRegistrationRoutes(fastify) {
  // Draft routes
  fastify.post('/draft', {
    schema: saveDraftSchema,
    handler: rylsDraftController.saveDraft,
  });

  fastify.get('/draft/resume/:token', {
    schema: getDraftSchema,
    handler: rylsDraftController.getDraft,
  });

  fastify.delete('/draft/:token', {
    schema: deleteDraftSchema,
    handler: rylsDraftController.deleteDraft,
  });

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
