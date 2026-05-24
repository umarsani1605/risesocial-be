import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockMidtransService = {
  verifyWebhookSignature: vi.fn(),
};

const mockAcademyEnrollmentRepository = {
  ensureForPaidTransaction: vi.fn(),
};

const mockPrisma = {
  transaction: { findUnique: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock('../../../../src/services/shared/MidtransService.js', () => ({
  midtransService: mockMidtransService,
}));

vi.mock('../../../../src/repositories/cohorts/academyEnrollmentRepository.js', () => ({
  academyEnrollmentRepository: mockAcademyEnrollmentRepository,
}));

vi.mock('../../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../../../src/config/posthog.js', () => ({
  default: { captureException: vi.fn() },
  captureEvent: vi.fn(),
}));

const { WebhookController } = await import('../../../../src/controllers/shared/webhookController.js');

function makeReply() {
  return {
    _status: 200,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    send(body) {
      this._body = body;
      return this;
    },
  };
}

describe('WebhookController', () => {
  let controller;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new WebhookController();
    mockMidtransService.verifyWebhookSignature.mockReturnValue(true);
    mockPrisma.transaction.findUnique.mockResolvedValue({ id: 20, status: 'pending' });
    mockAcademyEnrollmentRepository.ensureForPaidTransaction.mockResolvedValue({ id: 50 });
  });

  it('creates academy enrollment when webhook settles academy payment', async () => {
    let capturedTx;
    mockPrisma.$transaction.mockImplementation(async (fn) => {
      capturedTx = {
        transaction: { update: vi.fn().mockResolvedValue({}) },
        midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
        rylsPayment: { findUnique: vi.fn().mockResolvedValue(null) },
        academyEnrollment: { findFirst: vi.fn().mockResolvedValue(null) },
      };
      return fn(capturedTx);
    });

    const reply = makeReply();
    await controller.handleMidtransWebhook({
      body: {
        order_id: 'ACAD0001',
        transaction_status: 'settlement',
        transaction_id: 'mid-1',
        payment_type: 'bank_transfer',
        fraud_status: 'accept',
        status_code: '200',
      },
    }, reply);

    expect(reply._status).toBe(200);
    expect(mockAcademyEnrollmentRepository.ensureForPaidTransaction).toHaveBeenCalledWith(capturedTx, 20);
  });

  it('does not create academy enrollment when webhook marks payment expired', async () => {
    mockPrisma.$transaction.mockImplementation(async (fn) => fn({
      transaction: { update: vi.fn().mockResolvedValue({}) },
      midtransTransaction: { update: vi.fn().mockResolvedValue({}) },
      rylsPayment: { findUnique: vi.fn().mockResolvedValue(null) },
      academyEnrollment: { findFirst: vi.fn().mockResolvedValue(null) },
    }));

    const reply = makeReply();
    await controller.handleMidtransWebhook({
      body: {
        order_id: 'ACAD0002',
        transaction_status: 'expire',
        transaction_id: 'mid-2',
        payment_type: 'bank_transfer',
        status_code: '200',
      },
    }, reply);

    expect(reply._status).toBe(200);
    expect(mockAcademyEnrollmentRepository.ensureForPaidTransaction).not.toHaveBeenCalled();
  });
});
