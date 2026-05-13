import { rylsDraftService } from '../../services/rylsDraftService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserRylsDraftController {
  constructor() {
    this.service = rylsDraftService;
  }

  saveDraft = async (request, reply) => {
    try {
      const { email, resumeToken, step, formData, scholarshipType } = request.body;

      const result = await this.service.saveDraft({ email, resumeToken, step, formData, scholarshipType });

      return reply.status(200).send(successResponse(result, 'Draft saved'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to save draft', 500, error.message));
    }
  };

  getDraft = async (request, reply) => {
    try {
      const { token } = request.params;

      const result = await this.service.getDraft(token);
      if (!result) {
        return reply.status(404).send(errorResponse('Draft not found or expired', 404));
      }

      return reply.status(200).send(successResponse(result, 'Draft retrieved'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to get draft', 500, error.message));
    }
  };

  deleteDraft = async (request, reply) => {
    try {
      const { token } = request.params;

      const existing = await this.service.getDraft(token);
      if (!existing) {
        return reply.status(404).send(errorResponse('Draft not found or expired', 404));
      }

      await this.service.deleteDraft(token);

      return reply.status(200).send(successResponse({}, 'Draft deleted'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to delete draft', 500, error.message));
    }
  };
}

export const rylsDraftController = new UserRylsDraftController();
