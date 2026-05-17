import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../helpers/testDb.js';
import { createDraftRegistration } from '../../helpers/rylsFixtures.js';
import { RylsDraftService } from '../../../src/services/rylsDraftService.js';
import XLSX from 'xlsx';

describe('RylsDraftService Integration Tests', { concurrent: false }, () => {
  let service;
  let prisma;

  beforeAll(async () => {
    expect(isTestDatabase()).toBe(true);
    prisma = getTestPrisma();
    service = new RylsDraftService();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('saveDraft', () => {
    it('membuat draft baru dan generate token 64-char jika tidak ada resumeToken', async () => {
      const result = await service.saveDraft({
        email: 'new@test.com',
        step: 1,
        formData: { step1: { fullName: 'X' } },
      });
      expect(result.resumeToken).toHaveLength(64);
      expect(result.currentStep).toBe(1);
      expect(result.savedAt).toBeDefined();
      const saved = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: result.resumeToken } });
      expect(saved).not.toBeNull();
      expect(saved.email).toBe('new@test.com');
    });

    it('mengupdate draft existing dan mengembalikan token yang sama', async () => {
      const existing = await createDraftRegistration({ resume_token: 'existing-tok', email: 'ex@test.com' });
      const result = await service.saveDraft({
        email: existing.email,
        resumeToken: 'existing-tok',
        step: 2,
        formData: { step2: { passportNumber: 'A123' } },
        scholarshipType: 'SELF_FUNDED',
      });
      expect(result.resumeToken).toBe('existing-tok');
      const updated = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'existing-tok' } });
      expect(updated.current_step).toBe(2);
      expect(updated.scholarship_type).toBe('SELF_FUNDED');
    });

    it('membuat draft BARU jika resumeToken tidak ditemukan di DB', async () => {
      const result = await service.saveDraft({
        email: 'ghost@test.com',
        resumeToken: 'token-yang-tidak-ada',
        step: 1,
        formData: {},
      });
      expect(result.resumeToken).not.toBe('token-yang-tidak-ada');
      expect(result.resumeToken).toHaveLength(64);
    });

    it('membuat draft baru jika resumeToken tidak ada meski email yang sama sudah punya draft', async () => {
      const existing = await createDraftRegistration({ resume_token: 'email-tok', email: 'same@test.com' });
      const result = await service.saveDraft({
        email: 'same@test.com',
        step: 2,
        formData: { step2: { passportNumber: 'A123' } },
      });

      expect(result.resumeToken).not.toBe('email-tok');
      const created = await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: result.resumeToken } });
      expect(created.email).toBe('same@test.com');
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: existing.resume_token } })).not.toBeNull();
    });
  });

  describe('getDraft', () => {
    it('mengembalikan formData, currentStep, scholarshipType untuk token valid', async () => {
      const draft = await createDraftRegistration({ resume_token: 'get-tok' });
      const result = await service.getDraft('get-tok');
      expect(result).not.toBeNull();
      expect(result.currentStep).toBe(draft.current_step);
      expect(result.formData).toBeDefined();
      expect(result.email).toBe(draft.email);
    });

    it('mengembalikan null jika token tidak ditemukan', async () => {
      expect(await service.getDraft('tidak-ada')).toBeNull();
    });

    it('tidak menghapus draft hanya karena sudah lama dibuat', async () => {
      await createDraftRegistration({ resume_token: 'old-get', created_at: new Date('2025-01-01T00:00:00.000Z') });
      const result = await service.getDraft('old-get');
      expect(result).not.toBeNull();
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'old-get' } })).not.toBeNull();
    });
  });

  describe('deleteDraft', () => {
    it('menghapus draft dari DB', async () => {
      await createDraftRegistration({ resume_token: 'del-svc' });
      await service.deleteDraft('del-svc');
      expect(await prisma.rylsDraftRegistration.findUnique({ where: { resume_token: 'del-svc' } })).toBeNull();
    });

    it('tidak throw jika token tidak ada di DB', async () => {
      await expect(service.deleteDraft('tidak-ada')).resolves.not.toThrow();
    });
  });

  describe('getDraftStats', () => {
    it('count menghitung semua draft', async () => {
      await createDraftRegistration({ resume_token: 'stat-valid-1' });
      await createDraftRegistration({ resume_token: 'stat-valid-2' });

      const stats = await service.getDraftStats();
      expect(stats.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('export helpers', () => {
    it('getDraftsForExport mengembalikan semua draft', async () => {
      await createDraftRegistration({ resume_token: 'svc-export-active', email: 'active@test.com' });
      await createDraftRegistration({ resume_token: 'svc-export-second', email: 'second@test.com' });

      const drafts = await service.getDraftsForExport();

      expect(drafts.map((draft) => draft.email).sort()).toEqual(['active@test.com', 'second@test.com']);
    });

    it('generateExcelFile menghasilkan header dan fallback row yang benar', async () => {
      const buffer = await service.generateExcelFile([
        {
          email: 'draft@test.com',
          form_data: { step1: {} },
          current_step: 3,
          scholarship_type: null,
          updated_at: new Date('2026-05-14T10:00:00.000Z'),
        },
      ]);

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets.Drafts;
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      expect(rows[0]).toEqual(['Email', 'Full Name', 'Current Step', 'Scholarship Type', 'Updated At']);
      expect(rows[1]).toEqual([
        'draft@test.com',
        '-',
        3,
        '-',
        '2026-05-14T10:00:00.000Z',
      ]);
    });

    it('generateExcelFile tetap menulis full name dan scholarship type jika tersedia', async () => {
      const buffer = await service.generateExcelFile([
        {
          email: 'complete@test.com',
          form_data: { step1: { fullName: 'Complete User' } },
          current_step: 1,
          scholarship_type: 'SELF_FUNDED',
          updated_at: new Date('2026-05-14T11:00:00.000Z'),
        },
      ]);

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Drafts, { header: 1 });

      expect(rows[1][1]).toBe('Complete User');
      expect(rows[1][3]).toBe('SELF_FUNDED');
    });
  });
});
