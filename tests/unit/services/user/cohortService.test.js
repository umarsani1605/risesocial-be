/**
 * Unit Tests: UserCohortService
 * Focus: enrollment authorization and module retrieval
 * Note: computeModuleStatus() has been moved to the frontend (app/utils/index.ts)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockUserCohortRepository = {
  findPublicWithPagination: vi.fn(),
  findByIdPublic: vi.fn(),
  findEnrollmentByUserAndCohort: vi.fn(),
  findActiveEnrollment: vi.fn(),
  findPublishedModules: vi.fn(),
  findPublishedModuleById: vi.fn(),
  findCertificateByCohortAndUser: vi.fn(),
  findCertificateByCode: vi.fn(),
  createEnrollmentWithPayment: vi.fn(),
  findUserEnrollments: vi.fn(),
};

vi.mock('../../../../src/repositories/user/cohortRepository.js', () => ({
  userCohortRepository: mockUserCohortRepository,
}));

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: { createSnapTransaction: vi.fn() },
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: {
    cohort: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    transaction: { findFirst: vi.fn() },
    cohortModule: { findFirst: vi.fn() },
  },
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() }),
}));

vi.mock('fs-extra', () => ({ default: { pathExists: vi.fn() } }));

const { userCohortService } = await import('../../../../src/services/user/cohortService.js');

// --- Tests ---

describe('UserCohortService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCohortModules()', () => {
    it('should throw 403 when user is not enrolled', async () => {
      mockUserCohortRepository.findActiveEnrollment.mockResolvedValue(null);

      await expect(userCohortService.getCohortModules(1, 42)).rejects.toMatchObject({
        message: 'You are not enrolled in this cohort',
        statusCode: 403,
      });

      expect(mockUserCohortRepository.findPublishedModules).not.toHaveBeenCalled();
    });

    it('should return modules when user is enrolled', async () => {
      const enrollment = { id: 1, user_id: 42, cohort_id: 1, status: 'active' };
      const modules = [
        { id: 1, is_published: true, session_start_time: null, session_end_time: null, attachments: [] },
        { id: 2, is_published: false, session_start_time: null, session_end_time: null, attachments: [] },
      ];

      mockUserCohortRepository.findActiveEnrollment.mockResolvedValue(enrollment);
      mockUserCohortRepository.findPublishedModules.mockResolvedValue(modules);

      const result = await userCohortService.getCohortModules(1, 42);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('session_start_time');
      expect(result[0]).toHaveProperty('session_end_time');
      expect(result[0]).not.toHaveProperty('computed_status');
    });
  });

  describe('verifyCertificate()', () => {
    it('should throw 404 when certificate code does not exist', async () => {
      mockUserCohortRepository.findCertificateByCode.mockResolvedValue(null);

      await expect(userCohortService.verifyCertificate('CERT-INVALID-0000')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should return certificate details for valid code', async () => {
      const cert = {
        certificate_code: 'CERT-CARB-2026-0001',
        student_name: 'Budi Santoso',
        academy_title: 'Carbon Academy',
        cohort_name: 'Batch 1',
        issued_at: new Date('2026-03-01'),
        file_url: '/uploads/certificates/1/CERT-CARB-2026-0001.pdf',
      };
      mockUserCohortRepository.findCertificateByCode.mockResolvedValue(cert);

      const result = await userCohortService.verifyCertificate('CERT-CARB-2026-0001');

      expect(result.certificate_code).toBe('CERT-CARB-2026-0001');
      expect(result.student_name).toBe('Budi Santoso');
    });
  });
});
