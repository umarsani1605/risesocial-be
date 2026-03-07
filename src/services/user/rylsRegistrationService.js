import { rylsRegistrationRepository } from '../../repositories/user/rylsRegistrationRepository.js';
import { fileUploadService } from '../shared/fileUploadService.js';
import { getLogger } from '../../utils/loggerContext.js';

export class RylsRegistrationService {
  constructor() {
    this.registrationRepository = rylsRegistrationRepository;
    this.fileUploadService = fileUploadService;
  }

  get logger() {
    return getLogger();
  }

  getBaseUrl() {
    return process.env.BACKEND_URL;
  }

  async createRegistration(formData) {
    this.logger.info('[rylsRegistrationService] createRegistration start');
    this.logger.debug({ formKeys: Object.keys(formData || {}) }, '[rylsRegistrationService] rawKeys');
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

      this.logger.info('[rylsRegistrationService] createRegistration success');
      return registration;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] createRegistration error');
      throw error;
    }
  }

  async submitFullyFundedRegistration(formData) {
    this.logger.info('[rylsRegistrationService] submitFullyFundedRegistration start');
    try {
      const { registration, submission } = await this.registrationRepository.createFullyFundedFlow({
        step1: formData.step1,
      });

      const result = {
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

      this.logger.info('[rylsRegistrationService] submitFullyFundedRegistration success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] submitFullyFundedRegistration error');
      throw error;
    }
  }

  async submitSelfFundedRegistration(formData, paymentOrderId = null) {
    this.logger.info('[rylsRegistrationService] submitSelfFundedRegistration start');
    try {
      const { registration, submission } = await this.registrationRepository.createSelfFundedFlow({
        step1: formData.step1,
        passportNumber: formData.passportNumber,
        needVisa: formData.needVisa,
        headshotFileId: formData.headshotFileId,
        readPolicies: formData.readPolicies,
        paymentOrderId: paymentOrderId,
      });

      const result = {
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

      this.logger.info('[rylsRegistrationService] submitSelfFundedRegistration success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] submitSelfFundedRegistration error');
      throw error;
    }
  }

  async getRegistrationBySubmissionId(submissionId) {
    this.logger.info({ submissionId }, '[rylsRegistrationService] getRegistrationBySubmissionId start');
    try {
      const registration = await this.registrationRepository.findBySubmissionId(submissionId);
      const result = registration || null;
      this.logger.info('[rylsRegistrationService] getRegistrationBySubmissionId success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrationBySubmissionId error');
      throw new Error('Failed to retrieve registration');
    }
  }

  async getRegistrationById(id) {
    this.logger.info({ id }, '[rylsRegistrationService] getRegistrationById start');
    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);
      const result = registration || null;
      this.logger.info('[rylsRegistrationService] getRegistrationById success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrationById error');
      throw new Error('Failed to retrieve registration');
    }
  }

  async getRegistrations(options = {}) {
    this.logger.info('[rylsRegistrationService] getRegistrations start');
    this.logger.debug({ options }, '[rylsRegistrationService] rawOptions');
    try {
      const result = await this.registrationRepository.getRegistrations(options);
      this.logger.info('[rylsRegistrationService] getRegistrations success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrations error');
      throw new Error('Failed to retrieve registrations');
    }
  }

  async updateRegistrationStatus(id, status) {
    this.logger.info({ id, status }, '[rylsRegistrationService] updateRegistrationStatus start');
    try {
      const updatedRegistration = await this.registrationRepository.updateStatus(id, status);
      this.logger.info('[rylsRegistrationService] updateRegistrationStatus success');
      return updatedRegistration;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] updateRegistrationStatus error');
      throw error;
    }
  }

  async getRegistrationStatistics() {
    this.logger.info('[rylsRegistrationService] getRegistrationStatistics start');
    try {
      const [basicStats, nationalityStats, sourceStats] = await Promise.all([
        this.registrationRepository.getRegistrationStats(),
        this.registrationRepository.getNationalityStats(),
        this.registrationRepository.getDiscoverSourceStats(),
      ]);

      const result = {
        ...basicStats,
        demographicBreakdown: {
          byNationality: nationalityStats.slice(0, 10),
          byDiscoverSource: sourceStats,
        },
        generatedAt: new Date().toISOString(),
      };

      this.logger.info('[rylsRegistrationService] getRegistrationStatistics success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrationStatistics error');
      throw new Error('Failed to retrieve registration statistics');
    }
  }

  async getRegistrationsByDateRange(startDate, endDate, options = {}) {
    this.logger.info({ startDate, endDate }, '[rylsRegistrationService] getRegistrationsByDateRange start');
    try {
      const registrations = await this.registrationRepository.getRegistrationsByDateRange(startDate, endDate, options);
      this.logger.info('[rylsRegistrationService] getRegistrationsByDateRange success');
      return registrations;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrationsByDateRange error');
      throw new Error('Failed to retrieve registrations by date range');
    }
  }

  async deleteRegistration(id) {
    this.logger.info({ id }, '[rylsRegistrationService] deleteRegistration start');
    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);

      if (!registration) {
        const err = new Error('Registration not found');
        this.logger.info({ id }, '[rylsRegistrationService] deleteRegistration not_found');
        throw err;
      }

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

      await Promise.all(filesToDelete.map((fileId) => this.fileUploadService.deleteFile(fileId)));

      await this.registrationRepository.deleteRegistration(id);

      this.logger.info('[rylsRegistrationService] deleteRegistration success');
      return true;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] deleteRegistration error');
      throw error;
    }
  }

  async generateExcelFile(registrations) {
    this.logger.info('[rylsRegistrationService] generateExcelFile start');
    try {
      const XLSX = await import('xlsx');

      const workbook = XLSX.utils.book_new();

      const mainSheetData = this.prepareMainSheetData(registrations);
      const fullyFundedSheetData = this.prepareFullyFundedSheetData(registrations);
      const selfFundedSheetData = this.prepareSelfFundedSheetData(registrations);
      const paymentsSheetData = this.preparePaymentsSheetData(registrations);

      const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
      const fullyFundedSheet = XLSX.utils.aoa_to_sheet(fullyFundedSheetData);
      const selfFundedSheet = XLSX.utils.aoa_to_sheet(selfFundedSheetData);
      const paymentsSheet = XLSX.utils.aoa_to_sheet(paymentsSheetData);

      mainSheet['!cols'] = this.calculateColumnWidths(mainSheetData);
      fullyFundedSheet['!cols'] = this.calculateColumnWidths(fullyFundedSheetData);
      selfFundedSheet['!cols'] = this.calculateColumnWidths(selfFundedSheetData);
      paymentsSheet['!cols'] = this.calculateColumnWidths(paymentsSheetData);

      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Registrations');
      XLSX.utils.book_append_sheet(workbook, fullyFundedSheet, 'Fully Funded');
      XLSX.utils.book_append_sheet(workbook, selfFundedSheet, 'Self Funded');
      XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      this.logger.info('[rylsRegistrationService] generateExcelFile success');
      return excelBuffer;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] generateExcelFile error');
      throw new Error('Failed to generate Excel file');
    }
  }

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
      ];
      rows.push(row);
    });
    return rows;
  }

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
          reg.self_funded_submission.headshot_file?.id ? `${this.getBaseUrl()}/api/uploads/${reg.self_funded_submission.headshot_file.id}` : '',
          reg.self_funded_submission.read_policies ? 'Yes' : 'No',
          reg.self_funded_submission.created_at ? new Date(reg.self_funded_submission.created_at).toLocaleString() : '',
        ];
        rows.push(row);
      }
    });
    return rows;
  }

  prepareFullyFundedSheetData(registrations) {
    const headers = ['Registration ID', 'Full Name', 'Essay Topic', 'Essay File ID', 'Essay File URL', 'Essay Description'];
    const rows = [headers];
    registrations.forEach((reg) => {
      if (reg.fully_funded_submission) {
        const row = [
          reg.id,
          reg.full_name || '',
          reg.fully_funded_submission.essay_topic || '',
          reg.fully_funded_submission.essay_file_id || '',
          reg.fully_funded_submission.essay_file?.file_path
            ? `${this.getBaseUrl()}/uploads/${this.extractUploadPath(reg.fully_funded_submission.essay_file.file_path)}`
            : '',
          reg.fully_funded_submission.essay_description || '',
        ];
        rows.push(row);
      }
    });
    return rows;
  }

  preparePaymentsSheetData(registrations) {
    const headers = ['Registration ID', 'Full Name', 'Amount', 'Type', 'PayPal Payment Proof', 'Midtrans Order ID', 'Paid At'];
    const rows = [headers];
    registrations.forEach((reg) => {
      if (reg.payments && reg.payments.length > 0) {
        reg.payments.forEach((payment) => {
          const row = [
            reg.id,
            reg.full_name || '',
            payment.amount || '',
            payment.type || '',
            payment.payment_proof?.file_path ? `${this.getBaseUrl()}/uploads/${this.extractUploadPath(payment.payment_proof.file_path)}` : '',
            payment.midtrans?.order_id || '',
            payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '',
          ];
          rows.push(row);
        });
      }
    });
    return rows;
  }

  extractUploadPath(filePath) {
    if (!filePath) return null;
    const uploadsIndex = filePath.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      return filePath.substring(uploadsIndex + 9);
    }
    return null;
  }

  calculateColumnWidths(sheetData) {
    if (!sheetData || sheetData.length === 0) return [];
    const numColumns = sheetData[0].length;
    const columnWidths = [];
    for (let col = 0; col < numColumns; col++) {
      let maxWidth = 0;
      if (sheetData[0] && sheetData[0][col]) {
        maxWidth = Math.max(maxWidth, String(sheetData[0][col]).length);
      }
      for (let row = 1; row < sheetData.length; row++) {
        if (sheetData[row] && sheetData[row][col]) {
          const cellValue = String(sheetData[row][col]);
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
      }
      const optimalWidth = Math.min(Math.max(maxWidth + 2, 8), 50);
      columnWidths.push({ width: optimalWidth, wch: optimalWidth });
    }
    return columnWidths;
  }
}

export const rylsRegistrationService = new RylsRegistrationService();
