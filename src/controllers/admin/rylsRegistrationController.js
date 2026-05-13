import { rylsRegistrationService } from '../../services/user/rylsRegistrationService.js';
import { rylsDraftService } from '../../services/rylsDraftService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminRylsRegistrationController {
  constructor() {
    this.registrationService = rylsRegistrationService;
  }

  getRegistrations = async (request, reply) => {
    try {

      const { page = 1, limit = 10, scholarshipType, sortBy = 'created_at', sortOrder = 'desc', search, startDate, endDate } = request.query;

      const filters = {
        scholarshipType,
        search,
        startDate,
        endDate,
      };

      const result = await this.registrationService.getRegistrations({
        page: Number(page),
        limit: Number(limit),
        filters,
        sortBy,
        sortOrder,
      });

      return reply.send(successResponse(result, 'Registrations retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve registrations', 500, error.message));
    }
  };

  getRegistrationById = async (request, reply) => {
    try {
      const { id } = request.params;

      const result = await this.registrationService.getRegistrationById(Number(id));

      if (!result) {
        return reply.status(404).send(errorResponse('Registration not found', 404, 'No registration found with this ID'));
      }

      return reply.send(successResponse(result, 'Registration retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve registration', 500, error.message));
    }
  };

  updateRegistrationStatus = async (request, reply) => {
    try {
      const { id } = request.params;
      const { status, notes } = request.body;

      const result = await this.registrationService.updateRegistrationStatus(Number(id), status, notes);

      return reply.send(successResponse(result, 'Registration status updated successfully'));
    } catch (error) {

      if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to update registration status', 500, error.message));
    }
  };

  deleteRegistration = async (request, reply) => {
    try {
      const { id } = request.params;

      await this.registrationService.deleteRegistration(Number(id));

      return reply.send(successResponse(null, 'Registration deleted successfully'));
    } catch (error) {

      if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to delete registration', 500, error.message));
    }
  };

  getRegistrationStatistics = async (request, reply) => {
    try {
      const result = await this.registrationService.getRegistrationStatistics();

      return reply.send(successResponse(result, 'Registration statistics retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve statistics', 500, error.message));
    }
  };

  getRegistrationsByDateRange = async (request, reply) => {
    try {
      const { startDate, endDate, page = 1, limit = 50 } = request.query;

      if (!startDate || !endDate) {
        return reply.status(400).send(errorResponse('Date range required', 400, 'Both startDate and endDate are required'));
      }

      const result = await this.registrationService.getRegistrationsByDateRange({
        startDate,
        endDate,
        page: Number(page),
        limit: Number(limit),
      });

      return reply.send(successResponse(result, 'Registrations retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve registrations by date range', 500, error.message));
    }
  };

  exportRegistrations = async (request, reply) => {
    try {

      const { format = 'csv', startDate, endDate } = request.query;

      const filters = { startDate, endDate };

      const result = await this.registrationService.exportRegistrations(format, filters);


      const filename = `registrations_${new Date().toISOString().split('T')[0]}.${format}`;
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');

      return reply.send(result);
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to export registrations', 500, error.message));
    }
  };

  exportRegistrationsExcel = async (request, reply) => {
    try {

      const result = await this.registrationService.getRegistrations({
        limit: 1000,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      const excelBuffer = await this.registrationService.generateExcelFile(result.registrations);


      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ryls-registrations-${timestamp}.xlsx`;

      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', excelBuffer.length);

      return reply.send(excelBuffer);
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to export registrations to Excel', 500, error.message));
    }
  };

  getDrafts = async (request, reply) => {
    try {
      const { page = 1, limit = 20 } = request.query;
      const result = await rylsDraftService.getDrafts({ page: Number(page), limit: Number(limit) });
      return reply.send(
        successResponse(
          { drafts: result.data, pagination: { total: result.total, page: Number(page), limit: Number(limit) } },
          'Drafts retrieved',
        ),
      );
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve drafts', 500, error.message));
    }
  };

  getDraftStats = async (request, reply) => {
    try {
      const result = await rylsDraftService.getDraftStats();
      return reply.send(successResponse(result, 'Draft stats retrieved'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve draft stats', 500, error.message));
    }
  };

  cleanupExpiredDrafts = async (request, reply) => {
    try {
      const count = await rylsDraftService.cleanupExpired();
      return reply.send(successResponse({ deleted: count }, 'Expired drafts cleaned up'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to cleanup expired drafts', 500, error.message));
    }
  };
  getAnalyticsSummary = async (request, reply) => {
    try {
      const { period, startDate, endDate } = request.query;
      const result = await this.registrationService.getAnalyticsSummary({ period, startDate, endDate });
      return reply.send(successResponse(result, 'Summary retrieved'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve analytics summary', 500, error.message));
    }
  };

  getAnalyticsTrend = async (request, reply) => {
    try {
      const { period, startDate, endDate } = request.query;
      const result = await this.registrationService.getAnalyticsTrend({ period, startDate, endDate });
      return reply.send(successResponse(result, 'Trend retrieved'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve analytics trend', 500, error.message));
    }
  };

  getAnalyticsDemographics = async (request, reply) => {
    try {
      const { period, startDate, endDate } = request.query;
      const result = await this.registrationService.getAnalyticsDemographics({ period, startDate, endDate });
      return reply.send(successResponse(result, 'Demographics retrieved'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to retrieve analytics demographics', 500, error.message));
    }
  };
}

export const adminRylsRegistrationController = new AdminRylsRegistrationController();
