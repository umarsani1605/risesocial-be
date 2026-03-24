import { rylsRegistrationService } from '../../services/user/rylsRegistrationService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserRylsRegistrationController {
  constructor() {
    this.registrationService = rylsRegistrationService;
  }

  createRegistration = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] createRegistration start');
      request.log.debug({ body: request.body }, '[userRylsRegistrationController] rawBody');
      const formData = request.body;

      if (!formData.step1) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.createRegistration(formData);

      request.log.info('[userRylsRegistrationController] createRegistration success');
      return reply.status(201).send(successResponse(result, 'Registration created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] createRegistration error');

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to create registration', 500, error.message));
    }
  };

  submitRegistration = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] submitRegistration start');
      request.log.debug({ body: request.body }, '[userRylsRegistrationController] rawBody');
      const formData = request.body;

      if (!formData.step1) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.submitRegistration(formData);

      request.log.info('[userRylsRegistrationController] submitRegistration success');
      return reply.status(201).send(successResponse(result, 'Registration submitted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] submitRegistration error');

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to submit registration', 500, error.message));
    }
  };

  getRegistrationBySubmissionId = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] getRegistrationBySubmissionId start');
      request.log.debug({ params: request.params }, '[userRylsRegistrationController] rawParams');
      const { submissionId } = request.params;

      if (!submissionId) {
        return reply.status(400).send(errorResponse('Submission ID is required', 400, 'Missing submission ID'));
      }

      const result = await this.registrationService.getRegistrationBySubmissionId(submissionId);

      if (!result) {
        return reply.status(404).send(errorResponse('Registration not found', 404, 'No registration found with this submission ID'));
      }

      request.log.info('[userRylsRegistrationController] getRegistrationBySubmissionId success');
      return reply.send(successResponse(result, 'Registration retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] getRegistrationBySubmissionId error');
      return reply.status(500).send(errorResponse('Failed to retrieve registration', 500, error.message));
    }
  };

  checkEmailExists = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] checkEmailExists start');
      request.log.debug({ params: request.params }, '[userRylsRegistrationController] rawParams');
      const { email } = request.params;

      if (!email) {
        return reply.status(400).send(errorResponse('Email is required', 400, 'Missing email parameter'));
      }

      const result = await this.registrationService.checkEmailExists(email);

      request.log.info('[userRylsRegistrationController] checkEmailExists success');
      return reply.send(successResponse(result, 'Email check completed'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] checkEmailExists error');
      return reply.status(500).send(errorResponse('Failed to check email', 500, error.message));
    }
  };

  healthCheck = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] healthCheck start');
      const result = await this.registrationService.healthCheck();

      request.log.info('[userRylsRegistrationController] healthCheck success');
      return reply.send(successResponse(result, 'Registration service is healthy'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] healthCheck error');
      return reply.status(500).send(errorResponse('Registration service health check failed', 500, error.message));
    }
  };
}

export const userRylsRegistrationController = new UserRylsRegistrationController();
