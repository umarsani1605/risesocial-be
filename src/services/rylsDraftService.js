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
    const headers = ['Email', 'Full Name', 'Current Step', 'Scholarship Type', 'Updated At'];
    const rows = [headers];

    drafts.forEach((draft) => {
      rows.push([
        this.getCellValue(draft.email),
        this.getCellValue(draft.form_data?.step1?.fullName),
        this.getCellValue(draft.current_step),
        this.getCellValue(draft.scholarship_type),
        this.formatDateCell(draft.updated_at),
      ]);
    });

    return rows;
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
