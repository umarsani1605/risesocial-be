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

  /**
   * Get base URL for file uploads
   * @private
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return process.env.BACKEND_URL || 'http://localhost:8000';
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
      console.log('[RylsService] getRegistrations called');
      console.log('[RylsService] Options received:', JSON.stringify(options, null, 2));
      console.log('[RylsService] Calling repository.getRegistrations...');

      const result = await this.registrationRepository.getRegistrations(options);

      console.log('[RylsService] Repository returned result');
      console.log('[RylsService] Result structure:', {
        registrationsCount: result?.registrations?.length || 0,
        pagination: result?.pagination || 'missing',
      });

      return result;
    } catch (error) {
      console.error('[RylsService] Error getting registrations:', error);
      console.error('[RylsService] Error stack:', error.stack);
      throw new Error('Failed to retrieve registrations');
    }
  }

  /**
   * Get registration by ID
   * @param {number} id - Registration ID
   * @returns {Object|null} Raw registration object or null if not found
   */
  async getRegistrationById(id) {
    console.log('[RylsService] getRegistrationById called for ID:', id);

    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        console.log('[RylsService] Registration not found for ID:', id);
        return null;
      }

      console.log('[RylsService] Registration found for ID:', id);
      return registration;
    } catch (error) {
      console.error('[RylsService] Error getting registration by ID:', error);
      console.error('[RylsService] Error stack:', error.stack);
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

  /**
   * Generate Excel file with multiple sheets for RYLS registrations
   * @param {Array} registrations - Array of registration objects with relations
   * @returns {Promise<Buffer>} Excel file buffer
   */
  async generateExcelFile(registrations) {
    try {
      console.log('[RylsService] generateExcelFile called');
      console.log(`[RylsService] Processing ${registrations.length} registrations`);

      // Import xlsx library
      const XLSX = await import('xlsx');

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare data for each sheet
      const mainSheetData = this.prepareMainSheetData(registrations);
      const selfFundedSheetData = this.prepareSelfFundedSheetData(registrations);
      const fullyFundedSheetData = this.prepareFullyFundedSheetData(registrations);
      const paymentsSheetData = this.preparePaymentsSheetData(registrations);

      // Create worksheets
      const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
      const selfFundedSheet = XLSX.utils.aoa_to_sheet(selfFundedSheetData);
      const fullyFundedSheet = XLSX.utils.aoa_to_sheet(fullyFundedSheetData);
      const paymentsSheet = XLSX.utils.aoa_to_sheet(paymentsSheetData);

      // Apply auto-width to all sheets
      mainSheet['!cols'] = this.calculateColumnWidths(mainSheetData);
      selfFundedSheet['!cols'] = this.calculateColumnWidths(selfFundedSheetData);
      fullyFundedSheet['!cols'] = this.calculateColumnWidths(fullyFundedSheetData);
      paymentsSheet['!cols'] = this.calculateColumnWidths(paymentsSheetData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Registrations');
      XLSX.utils.book_append_sheet(workbook, selfFundedSheet, 'Self Funded');
      XLSX.utils.book_append_sheet(workbook, fullyFundedSheet, 'Fully Funded');
      XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');

      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      console.log('[RylsService] Excel file generated successfully');
      return excelBuffer;
    } catch (error) {
      console.error('[RylsService] Error generating Excel file:', error);
      throw new Error('Failed to generate Excel file');
    }
  }

  /**
   * Prepare data for main registrations sheet
   * @private
   */
  prepareMainSheetData(registrations) {
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Residence',
      'Nationality',
      'Second Nationality',
      'WhatsApp',
      'Institution',
      'Date of Birth',
      'Gender',
      'Discover Source',
      'Discover Other Text',
      'Scholarship Type',
      'Created At',
      'Updated At',
    ];

    const rows = [headers];

    registrations.forEach((reg) => {
      const row = [
        reg.id,
        reg.full_name || '',
        reg.email || '',
        reg.residence || '',
        reg.nationality || '',
        reg.second_nationality || '',
        reg.whatsapp || '',
        reg.institution || '',
        reg.date_of_birth ? new Date(reg.date_of_birth).toLocaleDateString() : '',
        reg.gender || '',
        reg.discover_source || '',
        reg.discover_other_text || '',
        reg.scholarship_type || '',
        reg.created_at ? new Date(reg.created_at).toLocaleString() : '',
        reg.updated_at ? new Date(reg.updated_at).toLocaleString() : '',
      ];
      rows.push(row);
    });

    return rows;
  }

  /**
   * Prepare data for self funded submissions sheet
   * @private
   */
  prepareSelfFundedSheetData(registrations) {
    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Passport Number',
      'Need Visa',
      'Headshot File ID',
      'Headshot File URL',
      'Read Policies',
      'Created At',
    ];

    const rows = [headers];

    registrations.forEach((reg) => {
      if (reg.self_funded_submission) {
        const row = [
          reg.id,
          reg.full_name || '',
          reg.email || '',
          reg.self_funded_submission.passport_number || '',
          reg.self_funded_submission.need_visa ? 'Yes' : 'No',
          reg.self_funded_submission.headshot_file_id || '',
          reg.self_funded_submission.headshot_file?.id
            ? `${this.getBaseUrl()}/api/uploads/${reg.self_funded_submission.headshot_file.id}`
            : 'No file uploaded',
          reg.self_funded_submission.read_policies ? 'Yes' : 'No',
          reg.self_funded_submission.created_at ? new Date(reg.self_funded_submission.created_at).toLocaleString() : '',
        ];
        rows.push(row);
      }
    });

    return rows;
  }

  /**
   * Prepare data for fully funded submissions sheet
   * @private
   */
  prepareFullyFundedSheetData(registrations) {
    const headers = ['Registration ID', 'Full Name', 'Email', 'Essay Topic', 'Essay File ID', 'Essay File URL', 'Essay Description', 'Created At'];

    const rows = [headers];

    registrations.forEach((reg) => {
      if (reg.fully_funded_submission) {
        const row = [
          reg.id,
          reg.full_name || '',
          reg.email || '',
          reg.fully_funded_submission.essay_topic || '',
          reg.fully_funded_submission.essay_file_id || '',
          reg.fully_funded_submission.essay_file?.file_path
            ? `${this.getBaseUrl()}/uploads/${this.extractUploadPath(reg.fully_funded_submission.essay_file.file_path)}`
            : 'No file uploaded',
          reg.fully_funded_submission.essay_description || '',
          reg.fully_funded_submission.created_at ? new Date(reg.fully_funded_submission.created_at).toLocaleString() : '',
        ];
        rows.push(row);
      }
    });

    return rows;
  }

  /**
   * Prepare data for payments sheet
   * @private
   */
  preparePaymentsSheetData(registrations) {
    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Payment ID',
      'Amount',
      'Status',
      'Type',
      'Paid At',
      'Created At',
      'Midtrans ID',
      'Payment Proof ID',
      'Payment Proof URL',
    ];

    const rows = [headers];

    registrations.forEach((reg) => {
      if (reg.payments && reg.payments.length > 0) {
        reg.payments.forEach((payment) => {
          const row = [
            reg.id,
            reg.full_name || '',
            reg.email || '',
            payment.id || '',
            payment.amount || '',
            payment.status || '',
            payment.type || '',
            payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '',
            payment.created_at ? new Date(payment.created_at).toLocaleString() : '',
            payment.midtrans_id || '',
            payment.payment_proof_id || '',
            payment.payment_proof?.file_path
              ? `${this.getBaseUrl()}/uploads/${this.extractUploadPath(payment.payment_proof.file_path)}`
              : 'No proof uploaded',
          ];
          rows.push(row);
        });
      }
    });

    return rows;
  }

  /**
   * Extract upload path from full file path for URL generation
   * @param {string} filePath - Full file path from database
   * @returns {string|null} Upload path relative to uploads folder
   * @private
   */
  extractUploadPath(filePath) {
    if (!filePath) return null;

    const uploadsIndex = filePath.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      return filePath.substring(uploadsIndex + 9); // +9 untuk skip '/uploads/'
    }
    return null;
  }

  /**
   * Calculate optimal column widths based on content
   * @param {Array} sheetData - 2D array of sheet data (headers + rows)
   * @returns {Array} Array of column width objects
   * @private
   */
  calculateColumnWidths(sheetData) {
    if (!sheetData || sheetData.length === 0) return [];

    const numColumns = sheetData[0].length;
    const columnWidths = [];

    // Calculate width for each column
    for (let col = 0; col < numColumns; col++) {
      let maxWidth = 0;

      // Check header width
      if (sheetData[0] && sheetData[0][col]) {
        maxWidth = Math.max(maxWidth, String(sheetData[0][col]).length);
      }

      // Check data width in each row
      for (let row = 1; row < sheetData.length; row++) {
        if (sheetData[row] && sheetData[row][col]) {
          const cellValue = String(sheetData[row][col]);
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
      }

      // Add padding and set minimum/maximum width
      const optimalWidth = Math.min(Math.max(maxWidth + 2, 8), 50);

      columnWidths.push({
        width: optimalWidth,
        wch: optimalWidth, // Excel column width unit
      });
    }

    return columnWidths;
  }
}
