import { rylsRegistrationRepository } from '../../repositories/user/rylsRegistrationRepository.js';
import { fileUploadService } from '../shared/fileUploadService.js';
import { rylsDraftService } from '../rylsDraftService.js';
import { periodToDateRange } from '../../utils/periodToDateRange.js';

export class RylsRegistrationService {
  constructor() {
    this.registrationRepository = rylsRegistrationRepository;
    this.fileUploadService = fileUploadService;
  }


  getBaseUrl() {
    return process.env.BACKEND_URL;
  }

  async submitRegistration(formData) {
    const scholarshipType = formData.step1?.scholarshipType;

    let result;
    // FULLY_FUNDED validation and routing
    if (scholarshipType === 'FULLY_FUNDED') {
      result = await this.submitFullyFundedRegistration(formData);
    } else if (scholarshipType === 'SELF_FUNDED') {
      // SELF_FUNDED validation and routing
      const missingFields = [];
      if (!formData.passportNumber) missingFields.push('passportNumber');
      if (!formData.needVisa) missingFields.push('needVisa');
      if (!formData.headshotFileId) missingFields.push('headshotFileId');
      if (!formData.readPolicies) missingFields.push('readPolicies');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields for SELF_FUNDED scholarship type: ${missingFields.join(', ')}`);
      }

      result = await this.submitSelfFundedRegistration(formData);
    } else {
      throw new Error(`Invalid scholarshipType: ${scholarshipType}`);
    }

    if (formData.resumeToken) {
      try {
        await rylsDraftService.deleteDraft(formData.resumeToken);
      } catch (err) {
      }
    }

    return result;
  }

  async submitFullyFundedRegistration(formData) {
    try {
      const { registration, submission } = await this.registrationRepository.createFullyFundedFlow({
        step1: formData.step1,
        essayTopic: formData.essayTopic,
        essayFileId: formData.essayFileId,
        essayDescription: formData.essayDescription,
        paymentId: formData.paymentId,
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

      return result;
    } catch (error) {
      throw error;
    }
  }

  async submitSelfFundedRegistration(formData) {
    try {
      const { registration, submission } = await this.registrationRepository.createSelfFundedFlow({
        step1: formData.step1,
        passportNumber: formData.passportNumber,
        needVisa: formData.needVisa,
        headshotFileId: formData.headshotFileId,
        readPolicies: formData.readPolicies,
        paymentId: formData.paymentId,
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

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRegistrationBySubmissionId(submissionId) {
    try {
      const registration = await this.registrationRepository.findBySubmissionId(submissionId);
      return registration || null;
    } catch (error) {
      throw new Error('Failed to retrieve registration');
    }
  }

  async getRegistrationById(id) {
    try {
      const registration = await this.registrationRepository.findByIdWithRelations(id);
      return registration || null;
    } catch (error) {
      throw new Error('Failed to retrieve registration');
    }
  }

  async getRegistrations(options = {}) {
    try {
      // Flatten nested filters from admin controller: { page, limit, filters: {}, sortBy, sortOrder }
      const { page, limit, filters = {}, sortBy, sortOrder } = options;
      const repoOptions = { page, limit, sortBy, sortOrder, ...filters };
      const result = await this.registrationRepository.getRegistrations(repoOptions);
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve registrations');
    }
  }

  async getRegistrationStatistics() {
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

      return result;
    } catch (error) {
      throw new Error('Failed to retrieve registration statistics');
    }
  }

  async getRegistrationsByDateRange({ startDate, endDate, page, limit } = {}) {
    try {
      const registrations = await this.registrationRepository.getRegistrationsByDateRange(startDate, endDate, { page, limit });
      return registrations;
    } catch (error) {
      throw new Error('Failed to retrieve registrations by date range');
    }
  }

  async deleteRegistration(id) {
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

      return true;
    } catch (error) {
      throw error;
    }
  }

  async checkEmailExists(email) {
    try {
      const exists = await this.registrationRepository.emailExists(email);
      return { exists };
    } catch (error) {
      throw new Error('Failed to check email');
    }
  }

  async healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async exportRegistrations(format = 'csv', filters = {}) {
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

      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      throw new Error('Failed to export registrations');
    }
  }

  async generateExcelFile(registrations) {
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

      return excelBuffer;
    } catch (error) {
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

  async getAnalyticsSummary({ period, startDate, endDate } = {}) {
    try {
      const range = periodToDateRange(period, startDate, endDate);
      const whereClause = range.start ? { created_at: { gte: range.start, lte: range.end } } : {};

      const [submitted, drafts] = await Promise.all([
        this.registrationRepository.model.count({ where: whereClause }),
        rylsDraftService.repo.model.count(),
      ]);

      return { submitted, drafts };
    } catch (error) {
      throw new Error('Failed to retrieve analytics summary');
    }
  }

  async getAnalyticsTrend({ period, startDate, endDate } = {}) {
    try {
      const effectivePeriod = period ?? '1m';
      const range = periodToDateRange(effectivePeriod, startDate, endDate);
      const whereClause = range.start ? { created_at: { gte: range.start, lte: range.end } } : {};

      const regs = await this.registrationRepository.model.findMany({
        where: whereClause,
        select: { created_at: true },
        orderBy: { created_at: 'asc' },
      });

      const byDate = {};
      for (const r of regs) {
        const day = r.created_at.toISOString().split('T')[0];
        byDate[day] = (byDate[day] ?? 0) + 1;
      }

      return Object.entries(byDate).map(([date, count]) => ({ date, count }));
    } catch (error) {
      throw new Error('Failed to retrieve analytics trend');
    }
  }

  async getAnalyticsDemographics({ period, startDate, endDate } = {}) {
    try {
      const range = periodToDateRange(period, startDate, endDate);
      const whereClause = range.start ? { created_at: { gte: range.start, lte: range.end } } : {};

      const [nationalityGroups, sourceGroups, genderGroups, scholarshipGroups, allDobs] = await Promise.all([
        this.registrationRepository.model.groupBy({
          by: ['nationality'],
          where: whereClause,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        this.registrationRepository.model.groupBy({
          by: ['discover_source'],
          where: whereClause,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        this.registrationRepository.model.groupBy({
          by: ['gender'],
          where: whereClause,
          _count: { id: true },
        }),
        this.registrationRepository.model.groupBy({
          by: ['scholarship_type'],
          where: whereClause,
          _count: { id: true },
        }),
        this.registrationRepository.model.findMany({
          where: whereClause,
          select: { date_of_birth: true },
        }),
      ]);

      const AGE_RANGES = ['<18', '18-22', '23-26', '27-30', '30+'];
      const ageBuckets = Object.fromEntries(AGE_RANGES.map((r) => [r, 0]));
      const now = new Date();
      for (const { date_of_birth } of allDobs) {
        const age = Math.floor((now - new Date(date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) ageBuckets['<18']++;
        else if (age <= 22) ageBuckets['18-22']++;
        else if (age <= 26) ageBuckets['23-26']++;
        else if (age <= 30) ageBuckets['27-30']++;
        else ageBuckets['30+']++;
      }

      return {
        byNationality: nationalityGroups.slice(0, 10).map((n) => ({ name: n.nationality, count: n._count.id })),
        byDiscoverSource: sourceGroups.map((s) => ({ name: s.discover_source, count: s._count.id })),
        byGender: genderGroups.map((g) => ({ name: g.gender, count: g._count.id })),
        byAgeRange: AGE_RANGES.map((r) => ({ name: r, count: ageBuckets[r] })),
        byScholarshipType: scholarshipGroups.map((s) => ({ name: s.scholarship_type, count: s._count.id })),
      };
    } catch (error) {
      throw new Error('Failed to retrieve analytics demographics');
    }
  }
}

export const rylsRegistrationService = new RylsRegistrationService();
