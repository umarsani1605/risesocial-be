import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
const mockUserCohortRepository = {
  findPublicWithPagination: vi.fn(),
  findByIdPublic: vi.fn(),
  findPlacementByUserCohort: vi.fn(),
  findStudentsByCohort: vi.fn(),
  findPublishedModules: vi.fn(),
  findPublishedModuleById: vi.fn(),
  findCertificateByCohortAndUser: vi.fn(),
  findCertificateByCode: vi.fn(),
  findUserEnrollments: vi.fn(),
  countCompletedModules: vi.fn(),
  findUpcomingModulesForUser: vi.fn(),
};

const mockPrisma = {
  cohort: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
  transaction: { findFirst: vi.fn() },
  cohortModule: { findFirst: vi.fn() },
  cohortCertificate: { findFirst: vi.fn() },
};

vi.mock('../../../../src/repositories/user/cohortRepository.js', () => ({
  userCohortRepository: mockUserCohortRepository,
}));

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: { createSnapTransaction: vi.fn() },
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));


vi.mock('fs-extra', () => ({ default: { pathExists: vi.fn() } }));

const { userCohortService } = await import('../../../../src/services/user/cohortService.js');

// --- Fixtures ---
const basePlacement = { id: 20, cohort_id: 5, user_id: 100, academy_enrollment_id: 10, academy_id: 1 };

const baseCohort = {
  id: 5,
  name: 'Cohort A',
  status: 'in_progress',
  start_date: new Date('2026-01-01'),
  end_date: new Date('2026-06-01'),
  _count: { modules: 8 },
  academy: { id: 1, title: 'Web Dev Bootcamp', slug: 'web-dev', image_url: null, duration: '6 months', format: 'online', certificate: true, description: 'desc' },
};

const baseAcademyEnrollment = {
  id: 10,
  user_id: 100,
  academy_id: 1,
  status: 'active',
  transaction: { id: 1, transaction_code: 'AE0001', status: 'paid', amount: 3000000, expired_at: null, paid_at: new Date() },
  placement: { ...basePlacement, cohort: baseCohort },
};

// ============================================================
describe('UserCohortService (RS-29)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  describe('getCohortModules()', () => {
    it('returns modules when user has placement in cohort', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(basePlacement);
      mockUserCohortRepository.findPublishedModules.mockResolvedValue([
        { id: 1, is_published: true, session_start_time: null, attachments: [] },
      ]);

      const result = await userCohortService.getCohortModules(5, 100);

      expect(mockUserCohortRepository.findPlacementByUserCohort).toHaveBeenCalledWith(100, 5);
      expect(result).toHaveLength(1);
    });

    it('throws 403 when user has no placement in cohort', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(null);

      await expect(userCohortService.getCohortModules(5, 100)).rejects.toMatchObject({
        statusCode: 403,
      });
      expect(mockUserCohortRepository.findPublishedModules).not.toHaveBeenCalled();
    });

    it('throws 403 when user has placement in different cohort', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(null);

      await expect(userCohortService.getCohortModules(99, 100)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('allows access when AcademyEnrollment is completed (placement still exists)', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(basePlacement);
      mockUserCohortRepository.findPublishedModules.mockResolvedValue([]);

      const result = await userCohortService.getCohortModules(5, 100);
      expect(result).toEqual([]);
    });
  });

  // ----------------------------------------------------------
  describe('getCohortModuleById()', () => {
    it('returns module when user has placement', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(basePlacement);
      mockUserCohortRepository.findPublishedModuleById.mockResolvedValue({ id: 7, title: 'Modul 1', attachments: [] });

      const result = await userCohortService.getCohortModuleById(5, 7, 100);

      expect(result).toMatchObject({ id: 7 });
    });

    it('throws 403 when user has no placement', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(null);

      await expect(userCohortService.getCohortModuleById(5, 7, 100)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('throws 404 when module not found', async () => {
      mockUserCohortRepository.findPlacementByUserCohort.mockResolvedValue(basePlacement);
      mockUserCohortRepository.findPublishedModuleById.mockResolvedValue(null);

      await expect(userCohortService.getCohortModuleById(5, 999, 100)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ----------------------------------------------------------
  describe('getMyEnrollments()', () => {
    it('returns cohort=null when enrollment has no placement yet', async () => {
      const enrollmentWithoutPlacement = { ...baseAcademyEnrollment, placement: null };
      mockUserCohortRepository.findUserEnrollments.mockResolvedValue({
        data: [enrollmentWithoutPlacement],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      mockPrisma.cohortCertificate.findFirst.mockResolvedValue(null);

      const result = await userCohortService.getMyEnrollments(100);

      expect(result.data[0].cohort).toBeNull();
      expect(result.data[0].has_certificate).toBe(false);
      expect(result.data[0].total_modules).toBe(0);
    });

    it('returns cohort info when enrollment has placement', async () => {
      mockUserCohortRepository.findUserEnrollments.mockResolvedValue({
        data: [baseAcademyEnrollment],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      mockUserCohortRepository.countCompletedModules.mockResolvedValue(3);
      mockPrisma.cohortModule.findFirst.mockResolvedValue(null);
      mockPrisma.cohortCertificate.findFirst.mockResolvedValue(null);

      const result = await userCohortService.getMyEnrollments(100);

      expect(result.data[0].cohort).not.toBeNull();
      expect(result.data[0].cohort.id).toBe(5);
      expect(result.data[0].total_modules).toBe(8);
      expect(result.data[0].completed_modules).toBe(3);
    });

    it('returns certificate_url when certificate exists', async () => {
      mockUserCohortRepository.findUserEnrollments.mockResolvedValue({
        data: [baseAcademyEnrollment],
        meta: { page: 1, limit: 10, total: 1 },
      });
      mockUserCohortRepository.countCompletedModules.mockResolvedValue(8);
      mockPrisma.cohortModule.findFirst.mockResolvedValue(null);
      mockPrisma.cohortCertificate.findFirst.mockResolvedValue({ id: 1, file_path: '/uploads/cert.pdf' });

      const result = await userCohortService.getMyEnrollments(100);

      expect(result.data[0].has_certificate).toBe(true);
      expect(result.data[0].certificate_url).toContain('cert.pdf');
    });
  });

  // ----------------------------------------------------------
  describe('getCohortStudents()', () => {
    it('returns student list from placements', async () => {
      const students = [
        { id: 20, user: { id: 100, first_name: 'Budi', last_name: 'S', avatar: null } },
      ];
      mockUserCohortRepository.findStudentsByCohort.mockResolvedValue(students);

      const result = await userCohortService.getCohortStudents(5);

      expect(mockUserCohortRepository.findStudentsByCohort).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(1);
    });
  });

  // ----------------------------------------------------------
  describe('verifyCertificate()', () => {
    it('throws 404 when certificate code does not exist', async () => {
      mockUserCohortRepository.findCertificateByCode.mockResolvedValue(null);

      await expect(userCohortService.verifyCertificate('CERT-INVALID')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('returns certificate details for valid code', async () => {
      const cert = {
        certificate_code: 'CERT-CARB-2026-0001',
        student_name: 'Budi Santoso',
        academy_title: 'Carbon Academy',
        cohort_name: 'Batch 1',
        created_at: new Date('2026-03-01'),
        file_path: null,
      };
      mockUserCohortRepository.findCertificateByCode.mockResolvedValue(cert);

      const result = await userCohortService.verifyCertificate('CERT-CARB-2026-0001');

      expect(result.certificate_code).toBe('CERT-CARB-2026-0001');
      expect(result.student_name).toBe('Budi Santoso');
    });
  });
});
