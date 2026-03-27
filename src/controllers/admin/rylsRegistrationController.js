import { RylsRegistrationService } from '../../services/rylsRegistrationService.js';
import { RylsDraftService } from '../../services/rylsDraftService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Admin RYLS Registration Controller
 * Handles admin management and monitoring of registrations
 */
export class AdminRylsRegistrationController {
  constructor() {
    this.registrationService = new RylsRegistrationService();
    this.draftService = new RylsDraftService();
  }

  /**
   * Get all registrations with pagination and filters (Admin only)
   * GET /api/admin/ryls/registrations
   */
  getRegistrations = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] getRegistrations start');
      request.log.debug({ query: request.query }, '[adminRylsRegistrationController] rawQuery');

      const { page = 1, limit = 1000, status, registrationType, sortBy = 'createdAt', sortOrder = 'desc', search, startDate, endDate } = request.query;

      const filters = {
        status,
        registrationType,
        search,
        startDate,
        endDate,
      };

      const result = await this.registrationService.getRegistrations({
        page: parseInt(page),
        limit: parseInt(limit),
        filters,
        sortBy,
        sortOrder,
      });

      request.log.info('[adminRylsRegistrationController] getRegistrations success');
      return reply.send(successResponse(result, 'Registrations retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] getRegistrations error');
      return reply.status(500).send(errorResponse('Failed to retrieve registrations', 500, error.message));
    }
  };

  /**
   * Get registration by ID (Admin only)
   * GET /api/admin/ryls/registrations/:id
   */
  getRegistrationById = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] getRegistrationById start');
      request.log.debug({ params: request.params }, '[adminRylsRegistrationController] rawParams');
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid registration ID', 400, 'ID must be a valid number'));
      }

      const result = await this.registrationService.getRegistrationById(parseInt(id));

      if (!result) {
        return reply.status(404).send(errorResponse('Registration not found', 404, 'No registration found with this ID'));
      }

      request.log.info('[adminRylsRegistrationController] getRegistrationById success');
      return reply.send(successResponse(result, 'Registration retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] getRegistrationById error');
      return reply.status(500).send(errorResponse('Failed to retrieve registration', 500, error.message));
    }
  };

  /**
   * Update registration status (Admin only)
   * PATCH /api/admin/ryls/registrations/:id/status
   */
  updateRegistrationStatus = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] updateRegistrationStatus start');
      request.log.debug({ params: request.params, body: request.body }, '[adminRylsRegistrationController] raw');
      const { id } = request.params;
      const { status, notes } = request.body;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid registration ID', 400, 'ID must be a valid number'));
      }

      if (!status) {
        return reply.status(400).send(errorResponse('Status is required', 400, 'Missing status field'));
      }

      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'];
      if (!validStatuses.includes(status)) {
        return reply.status(400).send(errorResponse('Invalid status', 400, `Status must be one of: ${validStatuses.join(', ')}`));
      }

      const result = await this.registrationService.updateRegistrationStatus(parseInt(id), status, notes);

      request.log.info('[adminRylsRegistrationController] updateRegistrationStatus success');
      return reply.send(successResponse(result, 'Registration status updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] updateRegistrationStatus error');

      if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to update registration status', 500, error.message));
    }
  };

  /**
   * Delete registration (Admin only)
   * DELETE /api/admin/ryls/registrations/:id
   */
  deleteRegistration = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] deleteRegistration start');
      request.log.debug({ params: request.params }, '[adminRylsRegistrationController] rawParams');
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Invalid registration ID', 400, 'ID must be a valid number'));
      }

      await this.registrationService.deleteRegistration(parseInt(id));

      request.log.info('[adminRylsRegistrationController] deleteRegistration success');
      return reply.send(successResponse(null, 'Registration deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] deleteRegistration error');

      if (error.message.includes('not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to delete registration', 500, error.message));
    }
  };

  /**
   * Get registration statistics (Admin only)
   * GET /api/admin/ryls/registrations/stats
   */
  getRegistrationStatistics = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] getRegistrationStatistics start');
      const result = await this.registrationService.getRegistrationStatistics();

      request.log.info('[adminRylsRegistrationController] getRegistrationStatistics success');
      return reply.send(successResponse(result, 'Registration statistics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] getRegistrationStatistics error');
      return reply.status(500).send(errorResponse('Failed to retrieve statistics', 500, error.message));
    }
  };

  /**
   * Get registrations by date range (Admin only)
   * GET /api/admin/ryls/registrations/date-range
   */
  getRegistrationsByDateRange = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] getRegistrationsByDateRange start');
      request.log.debug({ query: request.query }, '[adminRylsRegistrationController] rawQuery');
      const { startDate, endDate, page = 1, limit = 50 } = request.query;

      if (!startDate || !endDate) {
        return reply.status(400).send(errorResponse('Date range required', 400, 'Both startDate and endDate are required'));
      }

      const result = await this.registrationService.getRegistrationsByDateRange({
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      request.log.info('[adminRylsRegistrationController] getRegistrationsByDateRange success');
      return reply.send(successResponse(result, 'Registrations retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] getRegistrationsByDateRange error');
      return reply.status(500).send(errorResponse('Failed to retrieve registrations by date range', 500, error.message));
    }
  };

  /**
   * Export registrations (Admin only)
   * GET /api/admin/ryls/registrations/export
   */
  exportRegistrations = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] exportRegistrations start');
      request.log.debug({ query: request.query }, '[adminRylsRegistrationController] rawQuery');

      const { format = 'csv', startDate, endDate, status } = request.query;

      const filters = {
        startDate,
        endDate,
        status,
      };

      const result = await this.registrationService.exportRegistrations(format, filters);

      request.log.info('[adminRylsRegistrationController] exportRegistrations success');

      // Set appropriate headers for file download
      const filename = `registrations_${new Date().toISOString().split('T')[0]}.${format}`;
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');

      return reply.send(result);
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] exportRegistrations error');
      return reply.status(500).send(errorResponse('Failed to export registrations', 500, error.message));
    }
  };

  /**
   * Export registrations to Excel (Admin only)
   * GET /api/admin/ryls/registrations/export-excel
   */
  exportRegistrationsExcel = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] exportRegistrationsExcel start');
      request.log.debug({ query: request.query }, '[adminRylsRegistrationController] rawQuery');

      const result = await this.registrationService.getRegistrations({
        limit: 1000,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      const excelBuffer = await this.registrationService.generateExcelFile(result.registrations);

      request.log.info('[adminRylsRegistrationController] exportRegistrationsExcel success');

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ryls-registrations-${timestamp}.xlsx`;

      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', excelBuffer.length);

      return reply.send(excelBuffer);
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] exportRegistrationsExcel error');
      return reply.status(500).send(errorResponse('Failed to export registrations to Excel', 500, error.message));
    }
  };
  /**
   * Get all drafts (Admin only)
   * GET /api/admin/ryls/registrations/drafts
   */
  getDrafts = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] getDrafts start');
      const { page = 1, limit = 50, search } = request.query;

      const result = await this.draftService.getDrafts({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });

      request.log.info('[adminRylsRegistrationController] getDrafts success');
      return reply.send(successResponse(result, 'Drafts retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] getDrafts error');
      return reply.status(500).send(errorResponse('Failed to retrieve drafts', 500, error.message));
    }
  };

  /**
   * Get draft statistics (Admin only)
   * GET /api/admin/ryls/registrations/drafts/stats
   */
  getDraftStats = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] getDraftStats start');
      const result = await this.draftService.getDraftStats();
      request.log.info('[adminRylsRegistrationController] getDraftStats success');
      return reply.send(successResponse(result, 'Draft stats retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] getDraftStats error');
      return reply.status(500).send(errorResponse('Failed to retrieve draft stats', 500, error.message));
    }
  };

  /**
   * Cleanup expired drafts (Admin only)
   * DELETE /api/admin/ryls/registrations/drafts/cleanup
   */
  cleanupExpiredDrafts = async (request, reply) => {
    try {
      request.log.info('[adminRylsRegistrationController] cleanupExpiredDrafts start');
      const count = await this.draftService.cleanupExpired();
      request.log.info({ count }, '[adminRylsRegistrationController] cleanupExpiredDrafts success');
      return reply.send(successResponse({ deletedCount: count }, `${count} expired drafts deleted`));
    } catch (error) {
      request.log.error({ err: error }, '[adminRylsRegistrationController] cleanupExpiredDrafts error');
      return reply.status(500).send(errorResponse('Failed to cleanup expired drafts', 500, error.message));
    }
  };
}

// Export instance
export const adminRylsRegistrationController = new AdminRylsRegistrationController();
