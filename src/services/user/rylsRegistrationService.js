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

  async submitRegistration(formData) {
    this.logger.info('[rylsRegistrationService] submitRegistration start');
    const scholarshipType = formData.step1?.scholarshipType;

    // FULLY_FUNDED validation and routing
    if (scholarshipType === 'FULLY_FUNDED') {
      if (!formData.essayFileId) {
        throw new Error('essayFileId is required for FULLY_FUNDED scholarship type');
      }
      return await this.submitFullyFundedRegistration(formData);
    }

    // SELF_FUNDED validation and routing
    if (scholarshipType === 'SELF_FUNDED') {
      const missingFields = [];
      if (!formData.passportNumber) missingFields.push('passportNumber');
      if (!formData.needVisa) missingFields.push('needVisa');
      if (!formData.headshotFileId) missingFields.push('headshotFileId');
      if (!formData.readPolicies) missingFields.push('readPolicies');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields for SELF_FUNDED scholarship type: ${missingFields.join(', ')}`);
      }

      return await this.submitSelfFundedRegistration(formData);
    }

    // Invalid scholarshipType handling
    throw new Error(`Invalid scholarshipType: ${scholarshipType}`);
  }

  async submitFullyFundedRegistration(formData) {
    this.logger.info('[rylsRegistrationService] submitFullyFundedRegistration start');
    try {
      const { registration, submission } = await this.registrationRepository.createFullyFundedFlow({
        step1: formData.step1,
        essayTopic: formData.essayTopic,
        essayFileId: formData.essayFileId,
        essayDescription: formData.essayDescription,
      });

      const result = {
        registrationId: registration.id,
        submissionId: registration.id,
        email: registration.email,
        fullName: registration.full_name,
        scholarshipType: 'FULLY_FUNDED',
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

  async submitSelfFundedRegistration(formData) {
    this.logger.info('[rylsRegistrationService] submitSelfFundedRegistration start');
    try {
      const { registration, submission } = await this.registrationRepository.createSelfFundedFlow({
        step1: formData.step1,
        passportNumber: formData.passportNumber,
        needVisa: formData.needVisa,
        headshotFileId: formData.headshotFileId,
        readPolicies: formData.readPolicies,
      });

      const result = {
        registrationId: registration.id,
        submissionId: registration.id,
        email: registration.email,
        fullName: registration.full_name,
        scholarshipType: 'SELF_FUNDED',
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
      this.logger.info('[rylsRegistrationService] getRegistrationBySubmissionId success');
      return registration || null;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrationBySubmissionId error');
      throw new Error('Failed to retrieve registration');
    }
  }

  async getRegistrationById(id) {
    this.logger.info({ id }, '[rylsRegistrationService] getRegistrationById start');
    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);
      this.logger.info('[rylsRegistrationService] getRegistrationById success');
      return registration || null;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrationById error');
      throw new Error('Failed to retrieve registration');
    }
  }

  async getRegistrations(options = {}) {
    this.logger.info('[rylsRegistrationService] getRegistrations start');
    this.logger.debug({ options }, '[rylsRegistrationService] rawOptions');
    try {
      // Flatten nested filters from admin controller: { page, limit, filters: {}, sortBy, sortOrder }
      const { page, limit, filters = {}, sortBy, sortOrder } = options;
      const repoOptions = { page, limit, sortBy, sortOrder, ...filters };
      const result = await this.registrationRepository.getRegistrations(repoOptions);
      this.logger.info('[rylsRegistrationService] getRegistrations success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] getRegistrations error');
      throw new Error('Failed to retrieve registrations');
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

  async getRegistrationsByDateRange({ startDate, endDate, page, limit } = {}) {
    this.logger.info({ startDate, endDate }, '[rylsRegistrationService] getRegistrationsByDateRange start');
    try {
      const registrations = await this.registrationRepository.getRegistrationsByDateRange(startDate, endDate, { page, limit });
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
        throw new Error('Registration not found');
      }

      const filesToDelete = [];

      if (registration.fully_funded_submission?.essay_file_id) {
        filesToDelete.push(registration.fully_funded_submission.essay_file_id);
      }

      if (registration.self_funded_submission?.headshot_file_id) {
        filesToDelete.push(registration.self_funded_submission.headshot_file_id);
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

  async checkEmailExists(email) {
    this.logger.info({ email }, '[rylsRegistrationService] checkEmailExists start');
    try {
      const exists = await this.registrationRepository.emailExists(email);
      this.logger.info('[rylsRegistrationService] checkEmailExists success');
      return { exists };
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] checkEmailExists error');
      throw new Error('Failed to check email');
    }
  }

  async healthCheck() {
    this.logger.info('[rylsRegistrationService] healthCheck start');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async exportRegistrations(format = 'csv', filters = {}) {
    this.logger.info('[rylsRegistrationService] exportRegistrations start');
    try {
      const { registrations } = await this.registrationRepository.getRegistrations({
        limit: 10000,
        sortBy: 'created_at',
        sortOrder: 'desc',
        ...filters,
      });

      if (format === 'json') {
        return JSON.stringify(registrations, null, 2);
      }

      // CSV format
      const headers = [
        'id',
        'full_name',
        'email',
        'residence',
        'nationality',
        'whatsapp',
        'institution',
        'date_of_birth',
        'gender',
        'discover_source',
        'scholarship_type',
        'created_at',
      ];
      const rows = registrations.map((reg) =>
        headers
          .map((h) => {
            const val = reg[h];
            if (val == null) return '';
            const str = String(val).replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
          })
          .join(','),
      );

      this.logger.info('[rylsRegistrationService] exportRegistrations success');
      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      this.logger.error({ err: error }, '[rylsRegistrationService] exportRegistrations error');
      throw new Error('Failed to export registrations');
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
      rows.push([
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
      ]);
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
        rows.push([
          reg.id,
          reg.full_name || '',
          reg.email || '',
          reg.self_funded_submission.passport_number || '',
          reg.self_funded_submission.need_visa ? 'Yes' : 'No',
          reg.self_funded_submission.headshot_file_id || '',
          reg.self_funded_submission.headshot_file?.id ? `${this.getBaseUrl()}/api/uploads/${reg.self_funded_submission.headshot_file.id}` : '',
          reg.self_funded_submission.read_policies ? 'Yes' : 'No',
          reg.self_funded_submission.created_at ? new Date(reg.self_funded_submission.created_at).toLocaleString() : '',
        ]);
      }
    });
    return rows;
  }

  prepareFullyFundedSheetData(registrations) {
    const headers = ['Registration ID', 'Full Name', 'Essay Topic', 'Essay File ID', 'Essay File URL', 'Essay Description'];
    const rows = [headers];
    registrations.forEach((reg) => {
      if (reg.fully_funded_submission) {
        rows.push([
          reg.id,
          reg.full_name || '',
          reg.fully_funded_submission.essay_topic || '',
          reg.fully_funded_submission.essay_file_id || '',
          reg.fully_funded_submission.essay_file?.file_path
            ? `${this.getBaseUrl()}/uploads/${this.extractUploadPath(reg.fully_funded_submission.essay_file.file_path)}`
            : '',
          reg.fully_funded_submission.essay_description || '',
        ]);
      }
    });
    return rows;
  }

  preparePaymentsSheetData(registrations) {
    const headers = ['Registration ID', 'Full Name', 'Amount', 'Type', 'PayPal Payment Proof', 'Transaction Code', 'Paid At'];
    const rows = [headers];
    registrations.forEach((reg) => {
      if (reg.payments?.length > 0) {
        reg.payments.forEach((payment) => {
          rows.push([
            reg.id,
            reg.full_name || '',
            payment.transaction?.amount || '',
            payment.payment_method || '',
            payment.payment_proof?.file_path ? `${this.getBaseUrl()}/uploads/${this.extractUploadPath(payment.payment_proof.file_path)}` : '',
            payment.transaction?.transaction_code || '',
            payment.transaction?.paid_at ? new Date(payment.transaction.paid_at).toLocaleString() : '',
          ]);
        });
      }
    });
    return rows;
  }

  extractUploadPath(filePath) {
    if (!filePath) return null;
    const uploadsIndex = filePath.indexOf('/uploads/');
    return uploadsIndex !== -1 ? filePath.substring(uploadsIndex + 9) : null;
  }

  calculateColumnWidths(sheetData) {
    if (!sheetData?.length) return [];
    const numColumns = sheetData[0].length;
    const columnWidths = [];
    for (let col = 0; col < numColumns; col++) {
      let maxWidth = 0;
      for (const row of sheetData) {
        if (row?.[col]) maxWidth = Math.max(maxWidth, String(row[col]).length);
      }
      const optimalWidth = Math.min(Math.max(maxWidth + 2, 8), 50);
      columnWidths.push({ width: optimalWidth, wch: optimalWidth });
    }
    return columnWidths;
  }
}

export const rylsRegistrationService = new RylsRegistrationService();
