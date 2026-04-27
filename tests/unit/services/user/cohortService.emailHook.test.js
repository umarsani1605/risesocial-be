import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../src/repositories/user/cohortRepository.js', () => ({
  userCohortRepository: {
    findEnrollmentByUserAndCohort: vi.fn().mockResolvedValue(null),
    createEnrollmentWithPayment: vi.fn().mockResolvedValue({
      enrollment: { id: 1 },
    }),
  },
}));

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: {},
}));

vi.mock('../../../../src/constants/paymentHelpers.js', () => ({
  generateTransactionCode: vi.fn().mockReturnValue('ACK01TEST0001'),
  TRANSACTION_CODE_CONFIG: { ACADEMY_PREFIX: 'ACK' },
}));

vi.mock('../../../../src/services/shared/emailService.js', () => ({
  emailService: {
    sendCohortEnrollment: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}));

vi.mock('../../../../src/utils/response.js', () => ({ toFileUrl: vi.fn() }));

vi.mock('../../../../src/config/database.js', () => ({
  default: {
    cohort: {
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Batch 3',
        academy: { id: 1, title: 'Data Science Fundamentals' },
      }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '08123456789',
      }),
    },
    transaction: {
      findFirst: vi.fn().mockResolvedValue({ id: 0 }),
    },
  },
}));

describe('UserCohortService — cohort enrollment email hook', () => {
  let service;
  let emailService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    const { UserCohortService } = await import('../../../../src/services/user/cohortService.js');
    const emailModule = await import('../../../../src/services/shared/emailService.js');
    service = new UserCohortService();
    emailService = emailModule.emailService;
  });

  it('should fire cohort enrollment email for free cohort', async () => {
    await service.enrollInCohort(1, 42);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emailService.sendCohortEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'john@example.com',
        cohortName: 'Batch 3',
        academyTitle: 'Data Science Fundamentals',
      }),
    );
  });

  it('should not throw if enrollment email fails', async () => {
    emailService.sendCohortEnrollment.mockRejectedValueOnce(new Error('Brevo down'));

    await expect(service.enrollInCohort(1, 42)).resolves.toBeDefined();
  });
});
