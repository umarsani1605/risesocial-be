import crypto from 'crypto';
import { rylsDraftRepository } from '../repositories/rylsDraftRepository.js';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export class RylsDraftService {
  constructor() {
    this.repo = rylsDraftRepository;
  }


  async saveDraft({ email, resumeToken, step, formData, scholarshipType }) {
    try {
      if (resumeToken) {
        const existing = await this.repo.findByResumeToken(resumeToken);
        if (existing) {
          const updated = await this.repo.updateByToken(resumeToken, {
            email,
            currentStep: step,
            formData,
            scholarshipType: scholarshipType ?? null,
          });
          return { resumeToken, currentStep: updated.current_step, savedAt: updated.updated_at };
        }
      }

      const token = generateToken();
      const created = await this.repo.createDraft({
        email,
        resumeToken: token,
        currentStep: step,
        formData,
        scholarshipType: scholarshipType ?? null,
      });
      return { resumeToken: token, currentStep: created.current_step, savedAt: created.created_at };
    } catch (error) {
      throw error;
    }
  }

  async getDraft(resumeToken) {
    try {
      const draft = await this.repo.findByResumeToken(resumeToken);
      if (!draft) return null;

      return {
        resumeToken: draft.resume_token,
        currentStep: draft.current_step,
        formData: draft.form_data,
        scholarshipType: draft.scholarship_type,
        email: draft.email,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteDraft(resumeToken) {
    try {
      await this.repo.deleteByToken(resumeToken);
    } catch (error) {
      if (error.code === 'P2025') return; // record not found — not an error
      throw error;
    }
  }

  async getDrafts(options) {
    try {
      const result = await this.repo.getDrafts(options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getDraftStats() {
    try {
      const count = await this.repo.model.count();
      return { count };
    } catch (error) {
      throw error;
    }
  }

  async getDraftsForExport() {
    try {
      return await this.repo.getDraftsForExport();
    } catch (error) {
      throw error;
    }
  }

  async generateExcelFile(drafts) {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const sheetData = this.prepareDraftExportSheetData(drafts);
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);

      sheet['!cols'] = this.calculateColumnWidths(sheetData);

      XLSX.utils.book_append_sheet(workbook, sheet, 'Drafts');

      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      throw new Error('Failed to generate draft Excel file');
    }
  }

  prepareDraftExportSheetData(drafts) {
    const headers = [
      'Full Name',
      'Email',
      'Whatsapp',
      'Gender',
      'Date of Birth',
      'Residence',
      'Nationality',
      'Second Nationality',
      'Institution',
      'Discover Source',
      'Scholarship Type',
      'Progress',
      'Last Updated',
    ];
    const rows = [headers];

    drafts.forEach((draft) => {
      const step1 = draft.form_data?.step1 ?? {};
      rows.push([
        this.getCellValue(step1.fullName),
        this.getCellValue(draft.email),
        this.getCellValue(step1.whatsapp),
        this.formatGender(step1.gender),
        this.formatDateOnly(step1.dateOfBirth),
        this.getCellValue(step1.residence),
        this.getCellValue(step1.nationality),
        this.getCellValue(step1.secondNationality),
        this.getCellValue(step1.institution),
        this.formatDiscoverSource(step1.discoverSource, step1.discoverOtherText),
        this.formatScholarshipType(draft.scholarship_type),
        this.formatStep(draft.current_step),
        this.formatDateCell(draft.updated_at),
      ]);
    });

    return rows;
  }

  formatGender(gender) {
    if (!gender) return '-';
    if (gender === 'FEMALE') return 'Female';
    if (gender === 'MALE') return 'Male';
    if (gender === 'PREFER_NOT_TO_SAY') return 'Prefer not to say';
    return gender;
  }

  formatDiscoverSource(source, otherText) {
    if (!source) return '-';
    if (source === 'OTHER') return (otherText && String(otherText).trim()) || 'Other';
    const labels = {
      INSTAGRAM: 'Instagram',
      TWITTER: 'Twitter / X',
      LINKEDIN: 'LinkedIn',
      TIKTOK: 'TikTok',
      FACEBOOK: 'Facebook',
      YOUTUBE: 'YouTube',
      FRIEND: 'Friend',
      SCHOOL: 'School / Campus',
      WEBSITE: 'Website',
    };
    return labels[source] ?? source;
  }

  formatScholarshipType(type) {
    if (!type) return '-';
    if (type === 'FULLY_FUNDED') return 'Fully Funded';
    if (type === 'SELF_FUNDED') return 'Self Funded';
    return type;
  }

  formatStep(step) {
    if (step == null) return '-';
    return `Step ${step}`;
  }

  formatDateOnly(value) {
    if (!value) return '-';
    try {
      return new Date(value).toISOString().split('T')[0];
    } catch {
      return String(value);
    }
  }

  getCellValue(value) {
    return value == null || value === '' ? '-' : value;
  }

  formatDateCell(value) {
    return value ? new Date(value).toISOString() : '-';
  }

  calculateColumnWidths(sheetData) {
    if (!sheetData?.length) return [];

    const numColumns = sheetData[0].length;
    const columnWidths = [];

    for (let col = 0; col < numColumns; col++) {
      let maxWidth = 0;

      for (const row of sheetData) {
        if (row?.[col]) {
          maxWidth = Math.max(maxWidth, String(row[col]).length);
        }
      }

      const optimalWidth = Math.min(Math.max(maxWidth + 2, 8), 50);
      columnWidths.push({ width: optimalWidth, wch: optimalWidth });
    }

    return columnWidths;
  }
}

export const rylsDraftService = new RylsDraftService();
