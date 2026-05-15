import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
const mockCohortPlacementRepository = {
  createPlacement: vi.fn(),
  findById: vi.fn(),
  findByEnrollmentId: vi.fn(),
  findByUserCohort: vi.fn(),
  findByCohort: vi.fn(),
  deletePlacement: vi.fn(),
  replacePlacement: vi.fn(),
  hasCertificate: vi.fn(),
};

const mockAcademyEnrollmentRepository = {
  findById: vi.fn(),
};

const mockPrisma = {
  cohort: { findUnique: vi.fn() },
  cohortPlacement: { findUnique: vi.fn() },
  academyEnrollment: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock('../../../../src/repositories/cohorts/cohortPlacementRepository.js', () => ({
  cohortPlacementRepository: mockCohortPlacementRepository,
}));

vi.mock('../../../../src/repositories/cohorts/academyEnrollmentRepository.js', () => ({
  academyEnrollmentRepository: mockAcademyEnrollmentRepository,
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));


const { AdminPlacementService } = await import('../../../../src/services/admin/placementService.js');

// --- Fixtures ---
const baseEnrollment = {
  id: 10,
  user_id: 100,
  academy_id: 1,
  status: 'active',
  transaction: { status: 'paid', paid_at: new Date() },
  placement: null,
  user: { id: 100, first_name: 'Budi', last_name: 'Santoso', email: 'budi@test.com' },
  academy: { id: 1, title: 'Web Dev Bootcamp' },
};

const baseCohort = {
  id: 5,
  academy_id: 1,
  name: 'Cohort A',
  status: 'not_started',
};

const basePlacement = {
  id: 20,
  academy_enrollment_id: 10,
  cohort_id: 5,
  user_id: 100,
  academy_id: 1,
  notes: null,
};

// ============================================================
describe('AdminPlacementService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminPlacementService();
  });

  // ----------------------------------------------------------
  describe('assignToCohort', () => {
    beforeEach(() => {
      mockAcademyEnrollmentRepository.findById.mockResolvedValue(baseEnrollment);
      mockPrisma.cohort.findUnique.mockResolvedValue(baseCohort);
      mockCohortPlacementRepository.findByEnrollmentId.mockResolvedValue(null);
      mockCohortPlacementRepository.findByUserCohort.mockResolvedValue(null);
      mockCohortPlacementRepository.createPlacement.mockResolvedValue(basePlacement);
    });

    it('creates placement for active enrollment with no prior placement', async () => {
      const result = await service.assignToCohort(10, 5, { notes: 'Late join', adminId: 1 });

      expect(result).toMatchObject({ id: 20, cohort_id: 5, academy_enrollment_id: 10 });
      expect(mockCohortPlacementRepository.createPlacement).toHaveBeenCalledWith(
        expect.objectContaining({ academyEnrollmentId: 10, cohortId: 5, userId: 100, academyId: 1 }),
      );
      expect(mockCohortPlacementRepository.replacePlacement).not.toHaveBeenCalled();
    });

    it('re-assigns (replaces) placement when enrollment already has one', async () => {
      const newCohortPlacement = { ...basePlacement, id: 21, cohort_id: 6 };
      mockCohortPlacementRepository.findByEnrollmentId.mockResolvedValue(basePlacement);
      mockCohortPlacementRepository.replacePlacement.mockResolvedValue(newCohortPlacement);

      const result = await service.assignToCohort(10, 6, { adminId: 1 });

      expect(result.cohort_id).toBe(6);
      expect(mockCohortPlacementRepository.replacePlacement).toHaveBeenCalledWith(
        basePlacement.id,
        expect.objectContaining({ cohortId: 6, userId: 100, academyId: 1, academyEnrollmentId: 10 }),
      );
      expect(mockCohortPlacementRepository.createPlacement).not.toHaveBeenCalled();
    });

    it('throws 404 when enrollment not found', async () => {
      mockAcademyEnrollmentRepository.findById.mockResolvedValue(null);

      await expect(service.assignToCohort(999, 5, { adminId: 1 })).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 422 when enrollment status is pending', async () => {
      mockAcademyEnrollmentRepository.findById.mockResolvedValue({ ...baseEnrollment, status: 'pending' });

      await expect(service.assignToCohort(10, 5, { adminId: 1 })).rejects.toMatchObject({ statusCode: 422 });
    });

    it('throws 422 when enrollment status is cancelled', async () => {
      mockAcademyEnrollmentRepository.findById.mockResolvedValue({ ...baseEnrollment, status: 'cancelled' });

      await expect(service.assignToCohort(10, 5, { adminId: 1 })).rejects.toMatchObject({ statusCode: 422 });
    });

    it('throws 404 when cohort not found', async () => {
      mockPrisma.cohort.findUnique.mockResolvedValue(null);

      await expect(service.assignToCohort(10, 999, { adminId: 1 })).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 422 when cohort belongs to different academy', async () => {
      mockPrisma.cohort.findUnique.mockResolvedValue({ ...baseCohort, academy_id: 99 });

      await expect(service.assignToCohort(10, 5, { adminId: 1 })).rejects.toMatchObject({ statusCode: 422 });
    });

    it('throws 422 when cohort status is completed', async () => {
      mockPrisma.cohort.findUnique.mockResolvedValue({ ...baseCohort, status: 'completed' });

      await expect(service.assignToCohort(10, 5, { adminId: 1 })).rejects.toMatchObject({ statusCode: 422 });
    });

    it('throws 409 when user already placed in target cohort', async () => {
      mockCohortPlacementRepository.findByUserCohort.mockResolvedValue(basePlacement);

      await expect(service.assignToCohort(10, 5, { adminId: 1 })).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ----------------------------------------------------------
  describe('dropPlacement', () => {
    it('hard deletes placement, enrollment stays active', async () => {
      mockCohortPlacementRepository.deletePlacement.mockResolvedValue(basePlacement);

      // simulate finding placement via enrollment
      mockAcademyEnrollmentRepository.findById.mockResolvedValue({
        ...baseEnrollment,
        placement: basePlacement,
      });

      await service.dropPlacement(20, { reason: 'Wrong cohort', adminId: 1 });

      expect(mockCohortPlacementRepository.deletePlacement).toHaveBeenCalledWith(20);
    });

    it('throws 404 when placement not found', async () => {
      mockCohortPlacementRepository.deletePlacement.mockRejectedValue(Object.assign(new Error('Not found'), { code: 'P2025' }));

      await expect(service.dropPlacement(999, { adminId: 1 })).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ----------------------------------------------------------
  describe('listAcademyEnrollments', () => {
    it('returns paginated enrollments with filters', async () => {
      mockPrisma.academyEnrollment.findMany.mockResolvedValue([baseEnrollment]);
      mockPrisma.academyEnrollment.count.mockResolvedValue(1);

      const result = await service.listAcademyEnrollments({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
    });

    it('filters by status', async () => {
      mockPrisma.academyEnrollment.findMany.mockResolvedValue([]);
      mockPrisma.academyEnrollment.count.mockResolvedValue(0);

      await service.listAcademyEnrollments({ status: 'active' });

      expect(mockPrisma.academyEnrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'active' }) }),
      );
    });

    it('filters by placed=false (no placement)', async () => {
      mockPrisma.academyEnrollment.findMany.mockResolvedValue([]);
      mockPrisma.academyEnrollment.count.mockResolvedValue(0);

      await service.listAcademyEnrollments({ placed: false });

      expect(mockPrisma.academyEnrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ placement: { is: null } }) }),
      );
    });
  });
});
