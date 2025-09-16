import { RylsRegistrationService } from '../../services/rylsRegistrationService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User RYLS Registration Controller
 * Handles user registration submissions and queries
 */
export class UserRylsRegistrationController {
  constructor() {
    this.registrationService = new RylsRegistrationService();
  }

  /**
   * Create registration
   * POST /api/ryls/registrations
   */
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

  /**
   * Submit fully funded registration
   * POST /api/ryls/registrations/fully-funded
   */
  submitFullyFundedRegistration = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] submitFullyFundedRegistration start');
      request.log.debug({ body: request.body }, '[userRylsRegistrationController] rawBody');
      const formData = request.body;

      // Validate required data structure
      if (!formData.step1 || !formData.essayTopic || !formData.essayFileId) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.submitFullyFundedRegistration(formData);

      request.log.info('[userRylsRegistrationController] submitFullyFundedRegistration success');
      return reply.status(201).send(successResponse(result, 'Fully funded registration submitted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] submitFullyFundedRegistration error');

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to submit fully funded registration', 500, error.message));
    }
  };

  /**
   * Submit self funded registration
   * POST /api/ryls/registrations/self-funded
   */
  submitSelfFundedRegistration = async (request, reply) => {
    try {
      request.log.info('[userRylsRegistrationController] submitSelfFundedRegistration start');
      request.log.debug({ body: request.body }, '[userRylsRegistrationController] rawBody');
      const formData = request.body;

      // Validate required data structure
      if (!formData.step1 || !formData.essayTopic || !formData.essayFileId || !formData.paymentProofFileId) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.submitSelfFundedRegistration(formData);

      request.log.info('[userRylsRegistrationController] submitSelfFundedRegistration success');
      return reply.status(201).send(successResponse(result, 'Self funded registration submitted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userRylsRegistrationController] submitSelfFundedRegistration error');

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to submit self funded registration', 500, error.message));
    }
  };

  /**
   * Get registration by submission ID
   * GET /api/ryls/registrations/submission/:submissionId
   */
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

  /**
   * Check if email exists in registrations
   * GET /api/ryls/registrations/check-email/:email
   */
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

  /**
   * Health check for registration service
   * GET /api/ryls/registrations/health
   */
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

// Export instance
export const userRylsRegistrationController = new UserRylsRegistrationController();
