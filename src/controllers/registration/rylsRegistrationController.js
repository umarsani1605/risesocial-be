import { RylsRegistrationService } from '../../services/rylsRegistrationService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * RYLS Registration Controller
 * Handles HTTP requests for RYLS registration system
 */
export class RylsRegistrationController {
  constructor() {
    this.registrationService = new RylsRegistrationService();
  }

  async createRegistration(request, reply) {
    try {
      const formData = request.body;
      console.log('Backend received data:', JSON.stringify(formData, null, 2));

      if (!formData.step1) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.createRegistration(formData);

      return reply.status(201).send(successResponse(result, 'Registration created successfully'));
    } catch (error) {
      console.error('Error creating registration:', error);

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to create registration', 500, error.message));
    }
  }

  /**
   * Submit fully funded registration
   * POST /api/registrations/fully-funded
   */
  async submitFullyFundedRegistration(request, reply) {
    try {
      const formData = request.body;
      console.log('Backend received data:', JSON.stringify(formData, null, 2));

      // Validate required data structure
      if (!formData.step1 || !formData.essayTopic || !formData.essayFileId) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.submitFullyFundedRegistration(formData);

      return reply.status(201).send(successResponse(result, 'Fully funded registration submitted successfully'));
    } catch (error) {
      console.error('Error submitting fully funded registration:', error);

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to submit registration', 500, error.message));
    }
  }

  /**
   * Submit self funded registration
   * POST /api/registrations/self-funded
   */
  async submitSelfFundedRegistration(request, reply) {
    try {
      const formData = request.body;

      // Validate required data structure
      if (!formData.step1 || !formData.passportNumber || !formData.needVisa || !formData.headshotFileId || !formData.readPolicies) {
        return reply.status(400).send(errorResponse('Missing required form data', 400, 'Incomplete form submission'));
      }

      const result = await this.registrationService.submitSelfFundedRegistration(formData);

      return reply.status(201).send(
        successResponse(result, 'Self funded registration submitted successfully', {
          registrationType: 'SELF_FUNDED',
          submissionId: result.submissionId,
        })
      );
    } catch (error) {
      console.error('Error submitting self funded registration:', error);

      if (error.message.includes('Missing required fields') || error.message.includes('Invalid')) {
        return reply.status(400).send(errorResponse('Validation failed', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to submit registration', 500, error.message));
    }
  }

  /**
   * Get registration by submission ID
   * GET /api/registrations/submission/:submissionId
   */
  async getRegistrationBySubmissionId(request, reply) {
    try {
      const { submissionId } = request.params;

      if (!submissionId) {
        return reply.status(400).send(errorResponse('Submission ID is required', 400));
      }

      const registration = await this.registrationService.getRegistrationBySubmissionId(submissionId);

      if (!registration) {
        return reply.status(404).send(errorResponse('Registration not found', 404));
      }

      return reply.status(200).send(successResponse(registration, 'Registration retrieved successfully'));
    } catch (error) {
      console.error('Error getting registration by submission ID:', error);
      return reply.status(500).send(errorResponse('Failed to retrieve registration', 500, error.message));
    }
  }

  /**
   * Get registration by ID
   * GET /api/registrations/:id
   */
  async getRegistrationById(request, reply) {
    try {
      console.log('[RylsController] getRegistrationById called');
      console.log('[RylsController] Registration ID:', request.params.id);

      const registrationId = parseInt(request.params.id, 10);

      if (isNaN(registrationId)) {
        return reply.status(400).send(errorResponse('Invalid registration ID', 400));
      }

      console.log('[RylsController] Calling registrationService.getRegistrationById...');
      const result = await this.registrationService.getRegistrationById(registrationId);

      if (!result) {
        return reply.status(404).send(errorResponse('Registration not found', 404));
      }

      console.log('[RylsController] Service returned result');
      return reply.status(200).send(successResponse(result, 'Registration retrieved successfully'));
    } catch (error) {
      console.error('[RylsController] Error getting registration by ID:', error);
      console.error('[RylsController] Error stack:', error.stack);
      return reply.status(500).send(errorResponse('Failed to retrieve registration', 500, error.message));
    }
  }

  /**
   * Get all registrations with pagination and filters
   * GET /api/registrations
   */
  async getRegistrations(request, reply) {
    try {
      console.log('[RylsController] getRegistrations called');
      console.log('[RylsController] Request query:', JSON.stringify(request.query, null, 2));

      const { page = 1, limit = 10, status, scholarshipType, sortBy = 'created_at', sortOrder = 'desc', search } = request.query;

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // Max 100 per page
        status,
        scholarshipType,
        sortBy,
        sortOrder,
        search,
      };

      console.log('[RylsController] Processed options:', JSON.stringify(options, null, 2));
      console.log('[RylsController] Calling registrationService.getRegistrations...');

      const result = await this.registrationService.getRegistrations(options);

      console.log('[RylsController] Service returned result');
      console.log('[RylsController] Result structure:', {
        registrationsCount: result?.registrations?.length || 0,
        pagination: result?.pagination || 'missing',
      });

      return reply.status(200).send(
        successResponse(result, 'Registrations retrieved successfully', {
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.page,
          totalRecords: result.pagination.total,
        })
      );
    } catch (error) {
      console.error('[RylsController] Error getting registrations:', error);
      console.error('[RylsController] Error stack:', error.stack);
      return reply.status(500).send(errorResponse('Failed to retrieve registrations', 500, error.message));
    }
  }

  /**
   * Update registration status
   * PATCH /api/registrations/:id/status
   */
  async updateRegistrationStatus(request, reply) {
    try {
      const { id } = request.params;
      const { status } = request.body;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Valid registration ID is required', 400));
      }

      if (!status) {
        return reply.status(400).send(errorResponse('Status is required', 400));
      }

      const updatedRegistration = await this.registrationService.updateRegistrationStatus(parseInt(id), status);

      return reply.status(200).send(
        successResponse(updatedRegistration, 'Registration status updated successfully', {
          previousStatus: updatedRegistration.applicationInfo.status,
          newStatus: status,
        })
      );
    } catch (error) {
      console.error('Error updating registration status:', error);

      if (error.message.includes('Invalid status')) {
        return reply.status(400).send(errorResponse('Invalid status', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to update registration status', 500, error.message));
    }
  }

  /**
   * Get registration statistics
   * GET /api/registrations/stats
   */
  async getRegistrationStatistics(request, reply) {
    try {
      const stats = await this.registrationService.getRegistrationStatistics();

      return reply.status(200).send(
        successResponse(stats, 'Registration statistics retrieved successfully', {
          generatedAt: stats.generatedAt,
        })
      );
    } catch (error) {
      console.error('Error getting registration statistics:', error);
      return reply.status(500).send(errorResponse('Failed to retrieve registration statistics', 500, error.message));
    }
  }

  /**
   * Get registrations by date range
   * GET /api/registrations/date-range
   */
  async getRegistrationsByDateRange(request, reply) {
    try {
      const { startDate, endDate, status, scholarshipType, sortBy = 'created_at', sortOrder = 'desc' } = request.query;

      if (!startDate || !endDate) {
        return reply.status(400).send(errorResponse('Start date and end date are required', 400));
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return reply.status(400).send(errorResponse('Invalid date format', 400));
      }

      if (start > end) {
        return reply.status(400).send(errorResponse('Start date must be before end date', 400));
      }

      const options = {
        status,
        scholarshipType,
        sortBy,
        sortOrder,
      };

      const registrations = await this.registrationService.getRegistrationsByDateRange(start, end, options);

      return reply.status(200).send(
        successResponse({ registrations, dateRange: { startDate: start, endDate: end } }, 'Registrations retrieved successfully', {
          totalRecords: registrations.length,
          dateRange: `${startDate} to ${endDate}`,
        })
      );
    } catch (error) {
      console.error('Error getting registrations by date range:', error);
      return reply.status(500).send(errorResponse('Failed to retrieve registrations by date range', 500, error.message));
    }
  }

  /**
   * Delete registration
   * DELETE /api/registrations/:id
   */
  async deleteRegistration(request, reply) {
    try {
      const { id } = request.params;

      if (!id || isNaN(parseInt(id))) {
        return reply.status(400).send(errorResponse('Valid registration ID is required', 400));
      }

      const success = await this.registrationService.deleteRegistration(parseInt(id));

      if (!success) {
        return reply.status(404).send(errorResponse('Registration not found', 404));
      }

      return reply.status(200).send(
        successResponse({ deleted: true, registrationId: parseInt(id) }, 'Registration deleted successfully', {
          registrationId: parseInt(id),
          deletedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Error deleting registration:', error);

      if (error.message.includes('Registration not found')) {
        return reply.status(404).send(errorResponse('Registration not found', 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete registration', 500, error.message));
    }
  }

  /**
   * Check if email is already registered
   * GET /api/registrations/check-email/:email
   */
  async checkEmailExists(request, reply) {
    try {
      const { email } = request.params;

      if (!email) {
        return reply.status(400).send(errorResponse('Email is required', 400));
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return reply.status(400).send(errorResponse('Invalid email format', 400));
      }

      const exists = await this.registrationService.registrationRepository.emailExists(email);

      return reply.status(200).send(successResponse({ emailExists: exists, email }, exists ? 'Email is already registered' : 'Email is available'));
    } catch (error) {
      console.error('Error checking email existence:', error);
      return reply.status(500).send(errorResponse('Failed to check email existence', 500, error.message));
    }
  }

  /**
   * Health check for registration service
   * GET /api/registrations/health
   */
  async healthCheck(request, reply) {
    try {
      // Get basic stats to verify database connectivity
      const stats = await this.registrationService.getRegistrationStatistics();

      const health = {
        status: 'healthy',
        service: 'RYLS Registration System',
        database: 'connected',
        totalRegistrations: stats.totalRegistrations,
        timestamp: new Date().toISOString(),
      };

      return reply.status(200).send(successResponse(health, 'Registration service is healthy'));
    } catch (error) {
      console.error('Error in registration health check:', error);

      const health = {
        status: 'unhealthy',
        service: 'RYLS Registration System',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };

      return reply.status(503).send(errorResponse('Registration service is unhealthy', 503, health));
    }
  }

  /**
   * Export registrations to CSV (for admin use)
   * GET /api/registrations/export
   */
  async exportRegistrations(request, reply) {
    try {
      const { status, scholarshipType, startDate, endDate } = request.query;

      const options = {
        status,
        scholarshipType,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      let registrations;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        registrations = await this.registrationService.getRegistrationsByDateRange(start, end, options);
      } else {
        const result = await this.registrationService.getRegistrations({ ...options, limit: 10000 });
        registrations = result.registrations;
      }

      // Convert to CSV format
      const csvData = this.convertToCSV(registrations);

      // Set CSV headers
      reply.type('text/csv');
      reply.header('Content-Disposition', `attachment; filename="ryls_registrations_${Date.now()}.csv"`);

      return reply.send(csvData);
    } catch (error) {
      console.error('Error exporting registrations:', error);
      return reply.status(500).send(errorResponse('Failed to export registrations', 500, error.message));
    }
  }

  /**
   * Export registrations to Excel with multiple sheets (for admin use)
   * GET /api/registrations/export-excel
   */
  async exportRegistrationsExcel(request, reply) {
    try {
      console.log('[RylsController] exportRegistrationsExcel called');

      // Get all registrations with relations (max 1000)
      const result = await this.registrationService.getRegistrations({
        limit: 1000,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      if (!result || !result.registrations) {
        throw new Error('No registrations found');
      }

      console.log(`[RylsController] Found ${result.registrations.length} registrations for export`);

      // Generate Excel file with multiple sheets
      const excelBuffer = await this.registrationService.generateExcelFile(result.registrations);

      // Set Excel headers
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `ryls-registrations-${timestamp}.xlsx`;

      reply.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      reply.header('Content-Length', excelBuffer.length);

      return reply.send(excelBuffer);
    } catch (error) {
      console.error('[RylsController] Error exporting registrations to Excel:', error);
      return reply.status(500).send(errorResponse('Failed to export registrations to Excel', 500, error.message));
    }
  }

  /**
   * Convert registrations to CSV format
   * @private
   * @param {Array} registrations - Array of registration objects
   * @returns {string} CSV formatted string
   */
  convertToCSV(registrations) {
    const headers = [
      'Submission ID',
      'Full Name',
      'Email',
      'Residence',
      'Nationality',
      'Second Nationality',
      'WhatsApp',
      'Institution',
      'Date of Birth',
      'Age',
      'Gender',
      'Discover Source',
      'Scholarship Type',
      'Status',
      'Created At',
    ];

    const csvRows = [headers.join(',')];

    registrations.forEach((reg) => {
      const row = [
        reg.submissionId,
        `"${reg.personalInfo.fullName}"`,
        reg.personalInfo.email,
        `"${reg.personalInfo.residence}"`,
        reg.personalInfo.nationality,
        reg.personalInfo.secondNationality || '',
        reg.personalInfo.whatsapp,
        `"${reg.personalInfo.institution}"`,
        reg.personalInfo.dateOfBirth,
        reg.personalInfo.age,
        reg.personalInfo.gender,
        reg.applicationInfo.discoverSource,
        reg.applicationInfo.scholarshipType,
        reg.applicationInfo.status,
        reg.timestamps.createdAt,
      ];

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}
