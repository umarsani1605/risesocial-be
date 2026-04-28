/**
 * Unit Tests: AdminCohortService
 * Tests business logic with mocked dependencies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockCohortRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByIdWithDetails: vi.fn(),
  findWithPagination: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  createModule: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  createAttachment: vi.fn(),
  updateAttachment: vi.fn(),
  deleteAttachment: vi.fn(),
  createEnrollment: vi.fn(),
  findEnrollments: vi.fn(),
  updateEnrollment: vi.fn(),
  createMentor: vi.fn(),
  updateMentor: vi.fn(),
  deleteMentor: vi.fn(),
};

vi.mock('../../../../src/repositories/admin/cohortRepository.js', () => ({
  adminCohortRepository: mockCohortRepository,
}));

const mockAcademyRepository = {
  findById: vi.fn(),
};

vi.mock('../../../../src/repositories/shared/academyRepository.js', () => ({
  academyRepository: mockAcademyRepository,
}));

const mockFileUploadService = {
  generatePublicFileUrl: vi.fn(),
};

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: mockFileUploadService,
}));

const mockPrisma = {
  $transaction: vi.fn(),
  academyTopic: { findFirst: vi.fn() },
  cohortModule: { findFirst: vi.fn() },
  cohortEnrollment: { findFirst: vi.fn(), findUnique: vi.fn() },
  cohortCertificate: { findFirst: vi.fn(), create: vi.fn() },
  cohort: { update: vi.fn() },
};

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }),
}));

vi.mock('fs-extra', () => ({
  default: { ensureDir: vi.fn(), remove: vi.fn(), createWriteStream: vi.fn() },
}));

vi.mock('pdfkit', () => ({
  default: class MockPDF {
    pipe() { return this; }
    rect() { return this; }
    fill() { return this; }
    stroke() { return this; }
    fillColor() { return this; }
    fontSize() { return this; }
    font() { return this; }
    text() { return this; }
    end() {}
    page = { width: 842, height: 595 };
  },
}));

const { adminCohortService } = await import('../../../../src/services/admin/cohortService.js');

// --- Tests ---

describe('AdminCohortService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // createCohort()
  // ============================================================
  describe('createCohort()', () => {
    it('should create cohort when academy exists', async () => {
      const academy = { id: 1, title: 'Carbon Academy' };
      const created = { id: 10, academy_id: 1, name: 'Batch 1', status: 'not_started' };

      mockAcademyRepository.findById.mockResolvedValue(academy);
      mockCohortRepository.create.mockResolvedValue(created);

      const result = await adminCohortService.createCohort({ academy_id: 1, name: 'Batch 1' });

      expect(result).toEqual(created);
      expect(mockAcademyRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCohortRepository.create).toHaveBeenCalled();
    });

    it('should throw 404 when academy does not exist', async () => {
      mockAcademyRepository.findById.mockResolvedValue(null);

      await expect(adminCohortService.createCohort({ academy_id: 999, name: 'Batch 1' })).rejects.toMatchObject({
        message: 'Academy not found',
        statusCode: 404,
      });

      expect(mockCohortRepository.create).not.toHaveBeenCalled();
    });

    it('should throw 400 when start_date >= end_date', async () => {
      mockAcademyRepository.findById.mockResolvedValue({ id: 1 });

      await expect(
        adminCohortService.createCohort({
          academy_id: 1,
          name: 'Batch 1',
          start_date: '2026-06-01',
          end_date: '2026-05-01',
        }),
      ).rejects.toMatchObject({
        message: 'start_date must be before end_date',
        statusCode: 400,
      });

      expect(mockCohortRepository.create).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // deleteCohort()
  // ============================================================
  describe('deleteCohort()', () => {
    it('should throw 404 when cohort does not exist', async () => {
      mockCohortRepository.findById.mockResolvedValue(null);

      await expect(adminCohortService.deleteCohort(999)).rejects.toMatchObject({
        message: 'Cohort not found',
        statusCode: 404,
      });

      expect(mockCohortRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete cohort when it exists', async () => {
      mockCohortRepository.findById.mockResolvedValue({ id: 1, name: 'Batch 1' });
      mockCohortRepository.delete.mockResolvedValue({});

      await adminCohortService.deleteCohort(1);

      expect(mockCohortRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  // ============================================================
  // updateCohort()
  // ============================================================
  describe('updateCohort()', () => {
    const existing = { id: 1, name: 'Batch 1', status: 'not_started', start_date: null, end_date: null };

    beforeEach(() => {
      mockCohortRepository.findById.mockResolvedValue(existing);
      mockCohortRepository.update.mockResolvedValue({ ...existing, name: 'Batch Updated' });
    });

    it('should throw 404 when cohort does not exist', async () => {
      mockCohortRepository.findById.mockResolvedValue(null);

      await expect(adminCohortService.updateCohort(999, { name: 'New' })).rejects.toMatchObject({
        message: 'Cohort not found',
        statusCode: 404,
      });

      expect(mockCohortRepository.update).not.toHaveBeenCalled();
    });

    it('should update cohort name when provided', async () => {
      const result = await adminCohortService.updateCohort(1, { name: 'Batch Updated' });

      expect(mockCohortRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: 'Batch Updated' }),
      );
      expect(result.name).toBe('Batch Updated');
    });

    it('should throw 400 when new start_date >= new end_date', async () => {
      await expect(
        adminCohortService.updateCohort(1, {
          start_date: '2026-06-01',
          end_date: '2026-05-01',
        }),
      ).rejects.toMatchObject({
        message: 'start_date must be before end_date',
        statusCode: 400,
      });

      expect(mockCohortRepository.update).not.toHaveBeenCalled();
    });

    it('should throw 400 when start_date equals end_date', async () => {
      await expect(
        adminCohortService.updateCohort(1, {
          start_date: '2026-06-01',
          end_date: '2026-06-01',
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it('should validate dates against existing cohort dates when only one is updated', async () => {
      mockCohortRepository.findById.mockResolvedValue({
        ...existing,
        start_date: new Date('2026-05-01'),
        end_date: new Date('2026-07-01'),
      });

      // Providing a new end_date before existing start_date should fail
      await expect(
        adminCohortService.updateCohort(1, { end_date: '2026-04-01' }),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it('should not include undefined fields in updateData', async () => {
      await adminCohortService.updateCohort(1, { name: 'Only Name' });

      const callArg = mockCohortRepository.update.mock.calls[0][1];
      expect(callArg).toHaveProperty('name', 'Only Name');
      expect(callArg).not.toHaveProperty('status');
      expect(callArg).not.toHaveProperty('description');
    });

    it('should use $transaction and update cohortEnrollments when status becomes completed', async () => {
      const updatedCohort = { ...existing, status: 'completed' };
      mockPrisma.$transaction.mockImplementation(async (fn) => {
        const tx = {
          cohort: { update: vi.fn().mockResolvedValue(updatedCohort) },
          cohortEnrollment: { updateMany: vi.fn().mockResolvedValue({ count: 3 }) },
        };
        return fn(tx);
      });

      const result = await adminCohortService.updateCohort(1, { status: 'completed' });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.status).toBe('completed');
    });

    it('should NOT call $transaction when status is not completed', async () => {
      await adminCohortService.updateCohort(1, { status: 'ongoing' });

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(mockCohortRepository.update).toHaveBeenCalled();
    });
  });

  // ============================================================
  // createModule()
  // ============================================================

    it('should copy title and description from topic when copy_from_topic_id given', async () => {
      const cohort = { id: 5, academy_id: 2 };
      const topic = { id: 10, title: 'Intro to Carbon', description: 'Learn the basics' };
      const module = { id: 1, title: 'Intro to Carbon', description: 'Learn the basics' };

      mockCohortRepository.findById.mockResolvedValue(cohort);
      mockPrisma.academyTopic.findFirst.mockResolvedValue(topic);
      mockCohortRepository.createModule.mockResolvedValue(module);

      const result = await adminCohortService.createModule(5, { copy_from_topic_id: 10 });

      expect(result.title).toBe('Intro to Carbon');
      expect(result.description).toBe('Learn the basics');
    });

    it('should throw 404 when topic not found in this academy', async () => {
      mockCohortRepository.findById.mockResolvedValue({ id: 5, academy_id: 2 });
      mockPrisma.academyTopic.findFirst.mockResolvedValue(null);

      await expect(adminCohortService.createModule(5, { copy_from_topic_id: 999 })).rejects.toMatchObject({
        message: 'Topic not found in this academy',
        statusCode: 404,
      });
    });

    it('should throw 400 when title is missing and no topic to copy from', async () => {
      mockCohortRepository.findById.mockResolvedValue({ id: 5, academy_id: 2 });

      await expect(adminCohortService.createModule(5, {})).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  // ============================================================
  // createAttachment()
  // ============================================================
  describe('createAttachment()', () => {
    const cohort = { id: 5, academy_id: 2 };
    const module = { id: 3, cohort_id: 5 };

    beforeEach(() => {
      mockCohortRepository.findById.mockResolvedValue(cohort);
      mockPrisma.cohortModule = { findFirst: vi.fn().mockResolvedValue(module) };
    });

    it('should throw 400 when type=file but file_path is missing', async () => {
      await expect(adminCohortService.createAttachment(5, 3, { type: 'file', file_mime: 'application/pdf' })).rejects.toMatchObject({
        message: 'file_path and file_mime are required for type=file',
        statusCode: 400,
      });
    });

    it('should throw 400 when type=external_link but url is missing', async () => {
      await expect(adminCohortService.createAttachment(5, 3, { type: 'external_link' })).rejects.toMatchObject({
        message: 'url is required for type=external_link or embed_video',
        statusCode: 400,
      });
    });

    it('should create attachment when type=external_link with url', async () => {
      const attachment = { id: 1, type: 'external_link', url: 'https://example.com' };
      mockCohortRepository.createAttachment.mockResolvedValue(attachment);

      const result = await adminCohortService.createAttachment(5, 3, { type: 'external_link', url: 'https://example.com' });

      expect(result).toEqual(attachment);
    });
  });

  // ============================================================
  // manualEnroll()
  // ============================================================
  describe('manualEnroll()', () => {
    it('should throw 400 when user is already enrolled', async () => {
      mockCohortRepository.findById.mockResolvedValue({ id: 1, academy_id: 2 });
      mockPrisma.cohortEnrollment.findFirst.mockResolvedValue({ id: 99, user_id: 5, cohort_id: 1 });

      await expect(adminCohortService.manualEnroll(1, 5, null)).rejects.toMatchObject({
        message: 'User is already enrolled in this cohort',
        statusCode: 400,
      });

      expect(mockCohortRepository.createEnrollment).not.toHaveBeenCalled();
    });

    it('should enroll user when not yet enrolled', async () => {
      const enrollment = { id: 10, user_id: 5, cohort_id: 1, status: 'active' };
      mockCohortRepository.findById.mockResolvedValue({ id: 1, academy_id: 2 });
      mockPrisma.cohortEnrollment.findFirst.mockResolvedValue(null);
      mockCohortRepository.createEnrollment.mockResolvedValue(enrollment);

      const result = await adminCohortService.manualEnroll(1, 5, null);

      expect(result).toEqual(enrollment);
      expect(mockCohortRepository.createEnrollment).toHaveBeenCalledWith(1, 2, 5, null);
    });
  });

  // ============================================================
  // generateCertificates()
  // ============================================================
  describe('generateCertificates()', () => {
    it('should throw 400 when cohort is not completed', async () => {
      mockCohortRepository.findByIdWithDetails.mockResolvedValue({ id: 1, status: 'ongoing', academy_id: 2 });

      await expect(adminCohortService.generateCertificates(1)).rejects.toMatchObject({
        message: 'Certificates can only be generated when cohort status is completed',
        statusCode: 400,
      });
    });

    it('should throw 404 when cohort does not exist', async () => {
      mockCohortRepository.findByIdWithDetails.mockResolvedValue(null);

      await expect(adminCohortService.generateCertificates(999)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
