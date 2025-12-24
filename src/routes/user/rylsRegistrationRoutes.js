import { userRylsRegistrationController } from '../../controllers/user/rylsRegistrationController.js';
import {
  createRegistrationSchema,
  submitFullyFundedRegistrationSchema,
  submitSelfFundedRegistrationSchema,
  healthCheckSchema,
  checkEmailExistsSchema,
  getRegistrationBySubmissionIdSchema,
} from '../../schemas/rylsRegistrationSchemas.js';

export default async function userRylsRegistrationRoutes(fastify) {
  fastify.post('/', {
    schema: createRegistrationSchema,
    handler: userRylsRegistrationController.createRegistration,
  });

  fastify.post('/fully-funded', {
    schema: submitFullyFundedRegistrationSchema,
    handler: userRylsRegistrationController.submitFullyFundedRegistration,
  });

  fastify.post('/self-funded', {
    schema: submitSelfFundedRegistrationSchema,
    handler: userRylsRegistrationController.submitSelfFundedRegistration,
  });

  fastify.get('/health', {
    schema: healthCheckSchema,
    handler: userRylsRegistrationController.healthCheck,
  });

  fastify.get('/check-email/:email', {
    schema: checkEmailExistsSchema,
    handler: userRylsRegistrationController.checkEmailExists,
  });

  fastify.get('/submission/:submissionId', {
    schema: getRegistrationBySubmissionIdSchema,
    handler: userRylsRegistrationController.getRegistrationBySubmissionId,
  });
}
