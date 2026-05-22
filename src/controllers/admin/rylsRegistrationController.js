import { rylsRegistrationService } from '../../services/user/rylsRegistrationService.js';
import { rylsDraftService } from '../../services/rylsDraftService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminRylsRegistrationController {
  constructor() {
    this.registrationService = rylsRegistrationService;
  }

  getRegistrations = async (request, reply) => {
    try {

      const { page = 1, limit, scholarshipType, sortBy = 'created_at', sortOrder = 'desc', search, startDate, endDate } = request.query;

      const filters = {
        scholarshipType,
        search,
        startDate,
        endDate,
      };

      const result = await this.registrationService.getRegistrations({
        page: Number(page),
        limit: limit ? Number(limit) : undefined,
        filters,
        sortBy,
        sortOrder,
      });

      return reply.send(successResponse(result, 'Registrations retrieved successfully'));
    } catch (error) {
      throw error;
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
      throw error;
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

      throw error;
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

      throw error;
    }
  };

  getRegistrationStatistics = async (request, reply) => {
    try {
      const result = await this.registrationService.getRegistrationStatistics();

      return reply.send(successResponse(result, 'Registration statistics retrieved successfully'));
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  };

  getDrafts = async (request, reply) => {
    try {
      const { page = 1, limit } = request.query;
      const numericLimit = limit ? Number(limit) : undefined;
      const result = await rylsDraftService.getDrafts({ page: Number(page), limit: numericLimit });
      return reply.send(
        successResponse(
          { drafts: result.data, pagination: { total: result.total, page: Number(page), limit: numericLimit ?? result.total } },
          'Drafts retrieved',
        ),
      );
    } catch (error) {
      throw error;
    }
  };

  getDraftStats = async (request, reply) => {
    try {
      const result = await rylsDraftService.getDraftStats();
      return reply.send(successResponse(result, 'Draft stats retrieved'));
    } catch (error) {
      throw error;
    }
  };

  exportDraftsExcel = async (request, reply) => {
    try {
      const drafts = await rylsDraftService.getDraftsForExport();
      const excelBuffer = await rylsDraftService.generateExcelFile(drafts);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ryls-drafts-${timestamp}.xlsx`;

      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', excelBuffer.length);

      return reply.send(excelBuffer);
    } catch (error) {
      throw error;
    }
  };

  getAnalyticsSummary = async (request, reply) => {
    try {
      const { period, startDate, endDate } = request.query;
      const result = await this.registrationService.getAnalyticsSummary({ period, startDate, endDate });
      return reply.send(successResponse(result, 'Summary retrieved'));
    } catch (error) {
      throw error;
    }
  };

  getAnalyticsTrend = async (request, reply) => {
    try {
      const { period, startDate, endDate } = request.query;
      const result = await this.registrationService.getAnalyticsTrend({ period, startDate, endDate });
      return reply.send(successResponse(result, 'Trend retrieved'));
    } catch (error) {
      throw error;
    }
  };

  getAnalyticsDemographics = async (request, reply) => {
    try {
      const { period, startDate, endDate } = request.query;
      const result = await this.registrationService.getAnalyticsDemographics({ period, startDate, endDate });
      return reply.send(successResponse(result, 'Demographics retrieved'));
    } catch (error) {
      throw error;
    }
  };
}

export const adminRylsRegistrationController = new AdminRylsRegistrationController();
