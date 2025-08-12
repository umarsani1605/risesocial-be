import { RylsRegistrationRepository } from '../repositories/rylsRegistrationRepository.js';
import { FileUploadService } from './fileUploadService.js';

/**
 * RYLS Registration Service
 * Business logic for RYLS registration system
 */
export class RylsRegistrationService {
  constructor() {
    this.registrationRepository = new RylsRegistrationRepository();
    this.fileUploadService = new FileUploadService();
  }

  async createRegistration(formData) {
    try {
      const step1 = formData.step1;
      const payment = formData.payment;

      const registration = await this.registrationRepository.createRegistration(step1, payment.id);

      if (!registration) {
        throw new Error('Failed to create registration');
      }

      let submission;

      if (step1.scholarshipType === 'FULLY_FUNDED') {
        submission = await this.registrationRepository.createFullyFundedSubmission(registration.id, {
          essayTopic: formData.essayTopic,
          essayFile: formData.essayFile,
          essayDescription: formData.essayDescription,
        });
      } else {
        submission = await this.registrationRepository.createSelfFundedSubmission(registration.id, {
          passportNumber: formData.passportNumber,
          needVisa: formData.needVisa,
          headshotFile: formData.headshotFile,
          readPolicies: formData.readPolicies,
        });
      }

      if (!submission) {
        throw new Error('Failed to create submission');
      }

      return registration;
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  }

  /**
   * Submit fully funded registration
   * @param {Object} formData - Complete form data
   * @returns {Promise<Object>} Registration result
   */
  async submitFullyFundedRegistration(formData) {
    try {
      const { registration, submission } = await this.registrationRepository.createFullyFundedFlow({
        step1: formData.step1,
      });

      return {
        registrationId: registration.id,
        submissionId: registration.submission_id,
        email: registration.email,
        fullName: registration.full_name,
        scholarshipType: 'FULLY_FUNDED',
        status: registration.payment_status,
        createdAt: registration.created_at,
        submission: {
          id: submission.id,
          essayTopic: submission.essay_topic,
          essayDescription: submission.essay_description,
        },
      };
    } catch (error) {
      console.error('Error submitting fully funded registration:', error);
      throw error;
    }
  }

  /**
   * Submit self funded registration
   * @param {Object} formData - Complete form data
   * @param {string} [paymentOrderId] - Optional payment order ID to link
   * @returns {Promise<Object>} Registration result
   */
  async submitSelfFundedRegistration(formData, paymentOrderId = null) {
    try {
      // Atomic create using transaction
      const { registration, submission } = await this.registrationRepository.createSelfFundedFlow({
        step1: formData.step1,
        passportNumber: formData.passportNumber,
        needVisa: formData.needVisa,
        headshotFileId: formData.headshotFileId,
        readPolicies: formData.readPolicies,
        paymentOrderId: paymentOrderId,
      });

      return {
        registrationId: registration.id,
        submissionId: registration.submission_id,
        email: registration.email,
        fullName: registration.full_name,
        scholarshipType: 'SELF_FUNDED',
        status: registration.payment_status,
        createdAt: registration.created_at,
        submission: {
          id: submission.id,
          passportNumber: submission.passport_number,
          needVisa: submission.need_visa,
          readPolicies: submission.read_policies,
        },
      };
    } catch (error) {
      console.error('Error submitting self funded registration:', error);
      throw error;
    }
  }

  /**
   * Get registration by submission ID
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Object|null>} Registration details
   */
  async getRegistrationBySubmissionId(submissionId) {
    try {
      const registration = await this.registrationRepository.findBySubmissionId(submissionId);

      if (!registration) {
        return null;
      }

      return registration;
    } catch (error) {
      console.error('Error getting registration by submission ID:', error);
      throw new Error('Failed to retrieve registration');
    }
  }

  /**
   * Get registration by ID
   * @param {number} id - Registration ID
   * @returns {Promise<Object|null>} Registration details
   */
  async getRegistrationById(id) {
    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        return null;
      }

      return registration;
    } catch (error) {
      console.error('Error getting registration by ID:', error);
      throw new Error('Failed to retrieve registration');
    }
  }

  /**
   * Get all registrations with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated registrations
   */
  async getRegistrations(options = {}) {
    try {
      console.log('🔵 [RylsService] getRegistrations called');
      console.log('📝 [RylsService] Options received:', JSON.stringify(options, null, 2));
      console.log('🔄 [RylsService] Calling repository.getRegistrations...');

      const result = await this.registrationRepository.getRegistrations(options);

      console.log('✅ [RylsService] Repository returned result');
      console.log('📊 [RylsService] Result structure:', {
        registrationsCount: result?.registrations?.length || 0,
        pagination: result?.pagination || 'missing',
      });

      return result;
    } catch (error) {
      console.error('❌ [RylsService] Error getting registrations:', error);
      console.error('❌ [RylsService] Error stack:', error.stack);
      throw new Error('Failed to retrieve registrations');
    }
  }

  /**
   * Get registration by ID
   * @param {number} id - Registration ID
   * @returns {Object|null} Raw registration object or null if not found
   */
  async getRegistrationById(id) {
    console.log('🔵 [RylsService] getRegistrationById called for ID:', id);

    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        console.log('❌ [RylsService] Registration not found for ID:', id);
        return null;
      }

      console.log('✅ [RylsService] Registration found for ID:', id);
      return registration;
    } catch (error) {
      console.error('❌ [RylsService] Error getting registration by ID:', error);
      console.error('❌ [RylsService] Error stack:', error.stack);
      throw new Error('Failed to get registration');
    }
  }

  /**
   * Update registration status
   * @param {number} id - Registration ID
   * @param {string} status - New status (PENDING, APPROVED, REJECTED)
   * @returns {Promise<Object>} Updated registration
   */
  async updateRegistrationStatus(id, status) {
    try {
      // Validate status
      const validStatuses = ['PENDING', 'PAID', 'FAILED', 'EXPIRED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }

      const updatedRegistration = await this.registrationRepository.updateStatus(id, status);
      return updatedRegistration;
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  }

  /**
   * Get registration statistics
   * @returns {Promise<Object>} Registration statistics
   */
  async getRegistrationStatistics() {
    try {
      const [basicStats, nationalityStats, sourceStats] = await Promise.all([
        this.registrationRepository.getRegistrationStats(),
        this.registrationRepository.getNationalityStats(),
        this.registrationRepository.getDiscoverSourceStats(),
      ]);

      return {
        ...basicStats,
        demographicBreakdown: {
          byNationality: nationalityStats.slice(0, 10), // Top 10 nationalities
          byDiscoverSource: sourceStats,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting registration statistics:', error);
      throw new Error('Failed to retrieve registration statistics');
    }
  }

  /**
   * Get registrations by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Registrations in date range
   */
  async getRegistrationsByDateRange(startDate, endDate, options = {}) {
    try {
      const registrations = await this.registrationRepository.getRegistrationsByDateRange(startDate, endDate, options);

      return registrations;
    } catch (error) {
      console.error('Error getting registrations by date range:', error);
      throw new Error('Failed to retrieve registrations by date range');
    }
  }

  /**
   * Delete registration
   * @param {number} id - Registration ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRegistration(id) {
    try {
      // Get registration first to check files
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        throw new Error('Registration not found');
      }

      // Delete associated files
      const filesToDelete = [];

      if (registration.fully_funded_submission) {
        if (registration.fully_funded_submission.essay_file_id) {
          filesToDelete.push(registration.fully_funded_submission.essay_file_id);
        }
      }

      if (registration.self_funded_submission) {
        if (registration.self_funded_submission.headshot_file_id) {
          filesToDelete.push(registration.self_funded_submission.headshot_file_id);
        }
      }

      // Delete files
      await Promise.all(filesToDelete.map((fileId) => this.fileUploadService.deleteFile(fileId)));

      // Delete registration
      await this.registrationRepository.deleteRegistration(id);

      return true;
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  }
}
