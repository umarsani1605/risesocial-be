import { rylsRegistrationService } from '../../services/user/rylsRegistrationService.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { captureEvent } from '../../config/posthog.js';

export class UserRylsRegistrationController {
  constructor() {
    this.registrationService = rylsRegistrationService;
  }

  createRegistration = async (request, reply) => {
    try {
      const formData = request.body;

      if (!formData.step1) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.createRegistration(formData);

      const distinctId = result.id ?? `anon:${formData.step1?.email || 'unknown'}`;
      captureEvent(distinctId, 'ryls.registration_created', {
        registration_id: result.id,
      });

      return reply.status(201).send(successResponse(result, 'Registration created successfully'));
    } catch (error) {

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      throw error;
    }
  };

  submitRegistration = async (request, reply) => {
    try {
      const formData = request.body;

      if (!formData.step1) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.submitRegistration(formData);

      const distinctId = result.id ?? `anon:${formData.step1?.email || 'unknown'}`;
      captureEvent(distinctId, 'ryls.registration_submitted', {
        registration_id: result.id,
      });

      return reply.status(201).send(successResponse(result, 'Registration submitted successfully'));
    } catch (error) {

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      throw error;
    }
  };

  getRegistrationBySubmissionId = async (request, reply) => {
    try {
      const { submissionId } = request.params;

      if (!submissionId) {
        return reply.status(400).send(errorResponse('Submission ID is required', 400, 'Missing submission ID'));
      }

      const result = await this.registrationService.getRegistrationBySubmissionId(submissionId);

      if (!result) {
        return reply.status(404).send(errorResponse('Registration not found', 404, 'No registration found with this submission ID'));
      }

      return reply.send(successResponse(result, 'Registration retrieved successfully'));
    } catch (error) {
      throw error;
    }
  };

  checkEmailExists = async (request, reply) => {
    try {
      const { email } = request.params;

      if (!email) {
        return reply.status(400).send(errorResponse('Email is required', 400, 'Missing email parameter'));
      }

      const result = await this.registrationService.checkEmailExists(email);

      return reply.send(successResponse(result, 'Email check completed'));
    } catch (error) {
      throw error;
    }
  };

  healthCheck = async (request, reply) => {
    try {
      const result = await this.registrationService.healthCheck();

      return reply.send(successResponse(result, 'Registration service is healthy'));
    } catch (error) {
      throw error;
    }
  };
}

export const userRylsRegistrationController = new UserRylsRegistrationController();
