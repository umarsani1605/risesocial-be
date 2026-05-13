import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/repositories/admin/cohortRepository.js', () => ({
  adminCohortRepository: {
    findByIdWithDetails: vi.fn().mockResolvedValue({ id: 1, academy_id: 10, name: 'Batch 1' }),
  },
}));

vi.mock('../../../../src/repositories/shared/academyRepository.js', () => ({
  academyRepository: {
    findById: vi.fn().mockResolvedValue({ id: 10, title: 'UI/UX Design' }),
  },
}));

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: {},
}));

vi.mock('../../../../src/services/shared/emailService.js', () => ({
  emailService: {
    sendCertificateReady: vi.fn().mockResolvedValue({}),
  },
}));


vi.mock('../../../../src/utils/certificateHelpers.js', () => ({
  formatCertificateCode: vi.fn().mockReturnValue('CERT-2026-0001'),
  safeFilename: vi.fn().mockReturnValue('CERT-2026-0001.pdf'),
  formatIssuedDate: vi.fn().mockReturnValue('1 April 2026'),
}));

vi.mock('../../../../src/utils/response.js', () => ({
  toFileUrl: vi.fn().mockReturnValue('http://localhost:8000/uploads/certificates/1/CERT-2026-0001.pdf'),
}));

vi.mock('fs-extra', () => ({
  default: { ensureDir: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: {
    cohortPlacement: {
      findUnique: vi.fn().mockResolvedValue({
        id: 5,
        cohort_id: 1,
        user_id: 42,
        user: { first_name: 'Siti', last_name: 'Rahayu', email: 'siti@example.com' },
      }),
    },
    $transaction: vi.fn().mockImplementation(async (fn) => {
      const tx = {
        cohortCertificate: {
          deleteMany: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 1, created_at: new Date('2026-04-01') }),
          update: vi.fn().mockResolvedValue({
            id: 1,
            certificate_code: 'CERT-2026-0001',
            file_path: 'certificates/1/CERT-2026-0001.pdf',
          }),
        },
      };
      return fn(tx);
    }),
  },
}));

describe('AdminCohortService — certificate email hook', () => {
  let service;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { AdminCohortService } = await import('../../../../src/services/admin/cohortService.js');
    const emailModule = await import('../../../../src/services/shared/emailService.js');
    service = new AdminCohortService();
    emailService = emailModule.emailService;
    service._generatePDF = vi.fn().mockResolvedValue(undefined);
  });

  it('should fire certificate ready email after PDF generation', async () => {
    await service.generateCertificate(1, 5);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendCertificateReady).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'siti@example.com',
        certCode: 'CERT-2026-0001',
        cohortName: 'Batch 1',
        academyTitle: 'UI/UX Design',
      }),
    );
  });

  it('should not throw if certificate email fails', async () => {
    emailService.sendCertificateReady.mockRejectedValueOnce(new Error('Brevo down'));

    await expect(service.generateCertificate(1, 5)).resolves.toBeDefined();
  });
});
