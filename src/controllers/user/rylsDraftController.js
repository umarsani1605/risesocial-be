import { RylsDraftService } from '../../services/rylsDraftService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * User RYLS Draft Controller
 * Handles draft registration operations for users
 */
export class RylsDraftController {
  constructor() {
    this.draftService = new RylsDraftService();
  }

  /**
   * Save or update a draft
   * POST /ryls/registrations/draft
   */
  saveDraft = async (request, reply) => {
    try {
      request.log.info('[rylsDraftController] saveDraft start');

      const { email, resumeToken, step, formData } = request.body;

      const result = await this.draftService.saveDraft({ email, resumeToken, step, formData });

      request.log.info('[rylsDraftController] saveDraft success');
      return reply.send(successResponse(result, 'Draft saved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[rylsDraftController] saveDraft error');
      return reply.status(500).send(errorResponse('Failed to save draft', 500, error.message));
    }
  };

  /**
   * Get draft by resume token
   * GET /ryls/registrations/draft/resume/:token
   */
  getDraft = async (request, reply) => {
    try {
      request.log.info('[rylsDraftController] getDraft start');

      const { token } = request.params;

      const result = await this.draftService.getDraft(token);

      if (!result) {
        return reply.status(404).send(errorResponse('Draft not found or expired', 404));
      }

      request.log.info('[rylsDraftController] getDraft success');
      return reply.send(successResponse(result, 'Draft retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[rylsDraftController] getDraft error');
      return reply.status(500).send(errorResponse('Failed to retrieve draft', 500, error.message));
    }
  };

  /**
   * Delete draft by token
   * DELETE /ryls/registrations/draft/:token
   */
  deleteDraft = async (request, reply) => {
    try {
      request.log.info('[rylsDraftController] deleteDraft start');

      const { token } = request.params;

      await this.draftService.deleteDraft(token);

      request.log.info('[rylsDraftController] deleteDraft success');
      return reply.send(successResponse(null, 'Draft deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[rylsDraftController] deleteDraft error');
      return reply.status(500).send(errorResponse('Failed to delete draft', 500, error.message));
    }
  };
}

export const rylsDraftController = new RylsDraftController();
