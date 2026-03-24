/**
 * Unit Tests: UserCohortService
 * Focus: computeModuleStatus() logic + enrollment authorization
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

const { userCohortService, computeModuleStatus } = await import('../../../../src/services/user/cohortService.js');

// --- Tests ---

describe('computeModuleStatus()', () => {
  const now = new Date('2026-03-08T12:00:00Z');

  it('returns "hidden" when is_published is false', () => {
    expect(computeModuleStatus({ is_published: false, session_timestamp: null }, now)).toBe('hidden');
  });

  it('returns "upcoming" when is_published=true and session_timestamp is null', () => {
    expect(computeModuleStatus({ is_published: true, session_timestamp: null }, now)).toBe('upcoming');
  });

  it('returns "upcoming" when session is more than 60 min in the future', () => {
    const session = new Date('2026-03-08T14:01:00Z'); // +2h1m → > 60min
    expect(computeModuleStatus({ is_published: true, session_timestamp: session }, now)).toBe('upcoming');
  });

  it('returns "live" when session is exactly at current time (within window)', () => {
    const session = new Date('2026-03-08T12:00:00Z'); // same as now → diff=0
    expect(computeModuleStatus({ is_published: true, session_timestamp: session }, now)).toBe('live');
  });

  it('returns "live" when session started 90 min ago (within -2h window)', () => {
    const session = new Date('2026-03-08T10:30:00Z'); // -1.5h
    expect(computeModuleStatus({ is_published: true, session_timestamp: session }, now)).toBe('live');
  });

  it('returns "completed" when session is more than 2 hours in the past', () => {
    const session = new Date('2026-03-08T09:00:00Z'); // -3h
    expect(computeModuleStatus({ is_published: true, session_timestamp: session }, now)).toBe('completed');
  });

  it('returns "live" at the boundary: session starts in exactly 60 min', () => {
    // 60 min in future → diffMinutes = 60 → NOT > 60 → falls into live window
    const session = new Date('2026-03-08T13:00:00Z'); // exactly +60 min
    expect(computeModuleStatus({ is_published: true, session_timestamp: session }, now)).toBe('live');
  });
});

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

    it('should return modules with computed_status when user is enrolled', async () => {
      const enrollment = { id: 1, user_id: 42, cohort_id: 1, status: 'active' };
      const modules = [
        { id: 1, is_published: true, session_timestamp: null, attachments: [] },
        { id: 2, is_published: false, session_timestamp: null, attachments: [] },
      ];

      mockUserCohortRepository.findActiveEnrollment.mockResolvedValue(enrollment);
      mockUserCohortRepository.findPublishedModules.mockResolvedValue(modules);

      const result = await userCohortService.getCohortModules(1, 42);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('computed_status');
      expect(result[0].computed_status).toBe('upcoming'); // published + no timestamp
      expect(result[1].computed_status).toBe('hidden');   // not published
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
