import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---
const mockAdminCohortRepository = {
  findById: vi.fn(),
  findByIdWithDetails: vi.fn(),
  update: vi.fn(),
};

const mockAcademyRepository = {
  findById: vi.fn(),
};

const mockTx = {
  cohort: { update: vi.fn() },
  academyEnrollment: { update: vi.fn() },
  cohortCertificate: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const mockPrisma = {
  cohortPlacement: { findMany: vi.fn() },
  cohortCertificate: { update: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock('../../../../src/repositories/admin/cohortRepository.js', () => ({
  adminCohortRepository: mockAdminCohortRepository,
}));

vi.mock('../../../../src/repositories/shared/academyRepository.js', () => ({
  academyRepository: mockAcademyRepository,
}));

vi.mock('../../../../src/config/database.js', () => ({ default: mockPrisma }));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn(), warn: vi.fn() }),
}));

vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(Buffer.from('')),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
  ensureDir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: { generatePublicFileUrl: vi.fn() },
}));

vi.mock('../../../../src/services/shared/emailService.js', () => ({
  emailService: { sendCertificateReady: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../../../src/utils/certificateHelpers.js', () => ({
  formatCertificateCode: vi.fn((id) => `RISE-2026-${String(id).padStart(6, '0')}`),
  safeFilename: vi.fn((code) => `${code}.pdf`),
  formatIssuedDate: vi.fn(() => 'April 28, 2026'),
}));

const { AdminCohortService } = await import('../../../../src/services/admin/cohortService.js');

// --- Fixtures ---
const baseCohort = {
  id: 5,
  academy_id: 1,
  name: 'Cohort A',
  status: 'in_progress',
  end_date: null,
};

const baseAcademy = { id: 1, title: 'Web Dev Bootcamp' };

const basePlacements = [
  {
    id: 10,
    cohort_id: 5,
    user_id: 100,
    academy_id: 1,
    academy_enrollment_id: 1001,
    user: { id: 100, first_name: 'Budi', last_name: 'Santoso', email: 'budi@test.com' },
  },
  {
    id: 11,
    cohort_id: 5,
    user_id: 101,
    academy_id: 1,
    academy_enrollment_id: 1002,
    user: { id: 101, first_name: 'Ani', last_name: 'Wijaya', email: 'ani@test.com' },
  },
];

const makeCertRecord = (placementId) => ({
  id: 200 + placementId,
  certificate_code: `PENDING-${placementId}`,
  student_name: 'Budi Santoso',
  created_at: new Date('2026-04-28'),
});

// ============================================================
describe('AdminCohortService.completeCohort', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminCohortService();

    mockAdminCohortRepository.findByIdWithDetails.mockResolvedValue(baseCohort);
    mockPrisma.cohortPlacement.findMany.mockResolvedValue(basePlacements);
    mockAcademyRepository.findById.mockResolvedValue(baseAcademy);

    mockPrisma.$transaction.mockImplementation((cb) => cb(mockTx));
    mockTx.cohort.update.mockResolvedValue({ ...baseCohort, status: 'completed' });
    mockTx.academyEnrollment.update.mockResolvedValue({});
    mockTx.cohortCertificate.findFirst.mockResolvedValue(null);
    mockTx.cohortCertificate.create.mockImplementation(({ data }) =>
      Promise.resolve(makeCertRecord(data.placement_id)),
    );
    mockPrisma.cohortCertificate.update.mockResolvedValue({});

    vi.spyOn(service, '_generatePDF').mockResolvedValue(undefined);
  });

  it('marks cohort as completed and cascades all AcademyEnrollments', async () => {
    const result = await service.completeCohort(5);

    expect(mockTx.cohort.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 }, data: expect.objectContaining({ status: 'completed' }) }),
    );
    expect(mockTx.academyEnrollment.update).toHaveBeenCalledTimes(2);
    expect(mockTx.academyEnrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1001 }, data: expect.objectContaining({ status: 'completed' }) }),
    );
    expect(mockTx.academyEnrollment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1002 }, data: expect.objectContaining({ status: 'completed' }) }),
    );
    expect(result.certificatesGenerated).toBe(2);
  });

  it('sets completed_at on each AcademyEnrollment', async () => {
    await service.completeCohort(5);

    const calls = mockTx.academyEnrollment.update.mock.calls;
    for (const [arg] of calls) {
      expect(arg.data.completed_at).toBeInstanceOf(Date);
    }
  });

  it('generates a certificate record per placement with placement_id', async () => {
    await service.completeCohort(5);

    expect(mockTx.cohortCertificate.create).toHaveBeenCalledTimes(2);
    expect(mockTx.cohortCertificate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ placement_id: 10, cohort_id: 5, user_id: 100 }),
      }),
    );
    expect(mockTx.cohortCertificate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ placement_id: 11, cohort_id: 5, user_id: 101 }),
      }),
    );
  });

  it('generates PDF and updates certificate record with code + file_path', async () => {
    await service.completeCohort(5);

    expect(service._generatePDF).toHaveBeenCalledTimes(2);
    expect(mockPrisma.cohortCertificate.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.cohortCertificate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          certificate_code: expect.stringMatching(/^RISE-/),
          file_path: expect.stringContaining('.pdf'),
        }),
      }),
    );
  });

  it('is idempotent: skips placements that already have a certificate', async () => {
    mockTx.cohortCertificate.findFirst
      .mockResolvedValueOnce({ id: 50 })  // placement 10 already has cert
      .mockResolvedValueOnce(null);        // placement 11 does not

    const result = await service.completeCohort(5);

    expect(mockTx.cohortCertificate.create).toHaveBeenCalledTimes(1);
    expect(service._generatePDF).toHaveBeenCalledTimes(1);
    expect(result.certificatesGenerated).toBe(1);
  });

  it('still cascades enrollments even when all certs already exist', async () => {
    mockTx.cohortCertificate.findFirst.mockResolvedValue({ id: 50 });

    await service.completeCohort(5);

    expect(mockTx.academyEnrollment.update).toHaveBeenCalledTimes(2);
    expect(mockTx.cohortCertificate.create).not.toHaveBeenCalled();
  });

  it('handles cohort with no placements: updates cohort status, generates no certs', async () => {
    mockPrisma.cohortPlacement.findMany.mockResolvedValue([]);

    const result = await service.completeCohort(5);

    expect(mockTx.cohort.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }),
    );
    expect(mockTx.academyEnrollment.update).not.toHaveBeenCalled();
    expect(mockTx.cohortCertificate.create).not.toHaveBeenCalled();
    expect(result.certificatesGenerated).toBe(0);
  });

  it('sets end_date when cohort has none', async () => {
    await service.completeCohort(5);

    const [arg] = mockTx.cohort.update.mock.calls[0];
    expect(arg.data.end_date).toBeInstanceOf(Date);
  });

  it('does not overwrite existing end_date', async () => {
    const existingEndDate = new Date('2026-06-01');
    mockAdminCohortRepository.findByIdWithDetails.mockResolvedValue({
      ...baseCohort,
      end_date: existingEndDate,
    });

    await service.completeCohort(5);

    const [arg] = mockTx.cohort.update.mock.calls[0];
    expect(arg.data).not.toHaveProperty('end_date');
  });

  it('throws 404 when cohort not found', async () => {
    mockAdminCohortRepository.findByIdWithDetails.mockResolvedValue(null);

    await expect(service.completeCohort(999)).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ----------------------------------------------------------
describe('AdminCohortService.updateCohort with status=completed', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminCohortService();

    mockAdminCohortRepository.findById.mockResolvedValue(baseCohort);
    vi.spyOn(service, 'completeCohort').mockResolvedValue({
      cohort: { ...baseCohort, status: 'completed' },
      certificatesGenerated: 2,
    });
  });

  it('delegates cascade to completeCohort when status is completed', async () => {
    await service.updateCohort(5, { status: 'completed' });

    expect(service.completeCohort).toHaveBeenCalledWith(5);
  });

  it('returns the updated cohort from completeCohort result', async () => {
    const result = await service.updateCohort(5, { status: 'completed' });

    expect(result.status).toBe('completed');
  });

  it('applies other field updates via repository before calling completeCohort', async () => {
    mockAdminCohortRepository.update.mockResolvedValue({ ...baseCohort, name: 'Updated Name' });

    await service.updateCohort(5, { status: 'completed', name: 'Updated Name' });

    expect(mockAdminCohortRepository.update).toHaveBeenCalledWith(
      5,
      expect.objectContaining({ name: 'Updated Name' }),
    );
    expect(service.completeCohort).toHaveBeenCalledWith(5);
  });
});
