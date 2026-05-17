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
  upload: vi.fn(),
};

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: mockFileUploadService,
}));

const mockPrisma = {
  academyTopic: { findFirst: vi.fn() },
  cohortEnrollment: { findFirst: vi.fn() },
  cohortPlacement: { findUnique: vi.fn() },
  cohortCertificate: { findFirst: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
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
        message: 'Please set the start date before the end date',
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

  describe('updateCohort()', () => {
    it('should throw 400 with a friendly date-range message when start_date >= end_date', async () => {
      mockCohortRepository.findById.mockResolvedValue({
        id: 1,
        start_date: new Date('2026-05-01'),
        end_date: new Date('2026-06-01'),
      });

      await expect(
        adminCohortService.updateCohort(1, {
          start_date: '2026-06-01',
          end_date: '2026-06-01',
        }),
      ).rejects.toMatchObject({
        message: 'Please set the start date before the end date',
        statusCode: 400,
      });

      expect(mockCohortRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('createMentor()', () => {
    it('should upload the mentor avatar and persist the returned public URL', async () => {
      const cohort = { id: 7, academy_id: 3 };
      const mentor = { id: 11, cohort_id: 7, academy_id: 3, name: 'Jane Mentor', avatar: 'https://api.example.com/uploads/instructors/mentor.jpg' };
      const avatarFile = { originalName: 'mentor.jpg' };

      mockCohortRepository.findById.mockResolvedValue(cohort);
      mockFileUploadService.upload.mockResolvedValue({
        publicUrl: 'https://api.example.com/uploads/instructors/mentor.jpg',
      });
      mockCohortRepository.createMentor.mockResolvedValue(mentor);

      const result = await adminCohortService.createMentor(7, {
        name: 'Jane Mentor',
        job_title: 'Senior Consultant',
        avatarFile,
      });

      expect(result).toEqual(mentor);
      expect(mockFileUploadService.upload).toHaveBeenCalledWith(avatarFile);
      expect(mockCohortRepository.createMentor).toHaveBeenCalledWith(
        7,
        3,
        expect.objectContaining({
          name: 'Jane Mentor',
          job_title: 'Senior Consultant',
          avatar: 'https://api.example.com/uploads/instructors/mentor.jpg',
        }),
      );
      expect(mockCohortRepository.createMentor).toHaveBeenCalledWith(
        7,
        3,
        expect.not.objectContaining({ avatarFile: expect.anything() }),
      );
    });
  });

  describe('updateMentor()', () => {
    it('should upload the replacement avatar and persist the returned public URL', async () => {
      const mentor = { id: 11, cohort_id: 7, academy_id: 3, name: 'Jane Mentor', avatar: 'https://api.example.com/uploads/instructors/mentor-2.jpg' };
      const avatarFile = { originalName: 'mentor-2.jpg' };

      mockFileUploadService.upload.mockResolvedValue({
        publicUrl: 'https://api.example.com/uploads/instructors/mentor-2.jpg',
      });
      mockCohortRepository.updateMentor.mockResolvedValue(mentor);

      const result = await adminCohortService.updateMentor(7, 11, {
        name: 'Jane Mentor',
        avatarFile,
      });

      expect(result).toEqual(mentor);
      expect(mockFileUploadService.upload).toHaveBeenCalledWith(avatarFile);
      expect(mockCohortRepository.updateMentor).toHaveBeenCalledWith(
        7,
        11,
        expect.objectContaining({
          name: 'Jane Mentor',
          avatar: 'https://api.example.com/uploads/instructors/mentor-2.jpg',
        }),
      );
      expect(mockCohortRepository.updateMentor).toHaveBeenCalledWith(
        7,
        11,
        expect.not.objectContaining({ avatarFile: expect.anything() }),
      );
    });
  });

  // ============================================================
  // createModule()
  // ============================================================
  describe('createModule()', () => {
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
  // generateCertificate()
  // ============================================================
  describe('generateCertificate()', () => {
    const mockCohort = { id: 1, academy_id: 2, name: 'Batch 1', status: 'completed' };
    const mockAcademy = { id: 2, title: 'Web Dev Bootcamp' };
    const mockPlacement = {
      id: 20,
      cohort_id: 1,
      user_id: 5,
      user: { first_name: 'Budi', last_name: 'Santoso', email: 'budi@test.com' },
    };
    const mockCertRecord = {
      id: 100,
      certificate_code: 'PENDING-123',
      student_name: 'Budi Santoso',
      file_path: 'certificates/1/RISE-2026-000100.pdf',
      created_at: new Date('2026-04-28'),
    };

    beforeEach(() => {
      mockCohortRepository.findByIdWithDetails.mockResolvedValue(mockCohort);
      mockAcademyRepository.findById.mockResolvedValue(mockAcademy);
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue(mockPlacement);
      mockPrisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          cohortCertificate: {
            deleteMany: vi.fn().mockResolvedValue({}),
            create: vi.fn().mockResolvedValue(mockCertRecord),
            update: vi.fn().mockResolvedValue({ ...mockCertRecord, certificate_code: 'RISE-2026-000100' }),
          },
        };
        return cb(tx);
      });
      vi.spyOn(adminCohortService, '_generatePDF').mockResolvedValue(undefined);
    });

    it('should throw 404 when cohort does not exist', async () => {
      mockCohortRepository.findByIdWithDetails.mockResolvedValue(null);

      await expect(adminCohortService.generateCertificate(999, 20, {})).rejects.toMatchObject({
        statusCode: 404,
        message: 'Cohort not found',
      });
    });

    it('should throw 404 when placement does not exist', async () => {
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue(null);

      await expect(adminCohortService.generateCertificate(1, 999, {})).rejects.toMatchObject({
        statusCode: 404,
        message: 'Placement not found',
      });
    });

    it('should throw 404 when placement belongs to a different cohort', async () => {
      mockPrisma.cohortPlacement.findUnique.mockResolvedValue({ ...mockPlacement, cohort_id: 99 });

      await expect(adminCohortService.generateCertificate(1, 20, {})).rejects.toMatchObject({
        statusCode: 404,
        message: 'Placement not found',
      });
    });

    it('should generate certificate with placement_id and return cert with file_url', async () => {
      const result = await adminCohortService.generateCertificate(1, 20, {});

      expect(mockPrisma.cohortPlacement.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 20 } }),
      );
      expect(result).toHaveProperty('file_url');
    });
  });
});
