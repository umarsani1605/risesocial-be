import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection } from '../../helpers/testDb.js';
import { createTestUser } from '../../helpers/userFixtures.js';
import { seedAcademy } from '../../helpers/academyFixtures.js';

// Mock external services before importing controller
vi.mock('../../../src/services/shared/MidtransService.js', () => ({
  midtransService: {
    verifyWebhookSignature: vi.fn(),
  },
}));

vi.mock('../../../src/services/shared/emailService.js', () => ({
  emailService: {
    sendPaymentConfirmation: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() }),
}));

import { midtransService } from '../../../src/services/shared/MidtransService.js';
import { emailService } from '../../../src/services/shared/emailService.js';
import { WebhookController } from '../../../src/controllers/shared/webhookController.js';

// --- Request/reply helpers ---
function makeRequest(body) {
  return { body };
}

function makeReply() {
  const reply = {
    _status: 200,
    _body: null,
    status(code) { this._status = code; return this; },
    send(body) { this._body = body; return this; },
  };
  return reply;
}

// --- DB setup ---
let prisma;
let user;
let academy;

async function createTransaction(overrides = {}) {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prisma.transaction.create({
    data: {
      transaction_code: `AE01${rand}`,
      amount: 3000000,
      currency: 'IDR',
      status: 'pending',
      provider: 'midtrans',
      customer_name: 'Budi Santoso',
      customer_email: 'budi@test.com',
      product_type: 'academy_enrollment',
      product_type_id: 0, // placeholder; updated after enrollment is created
      user_id: user.id,
      ...overrides,
    },
  });
}

async function createMidtransTransaction(transactionId, overrides = {}) {
  return prisma.midtransTransaction.create({
    data: {
      transaction_id: transactionId,
      snap_token: 'snap-token-xyz',
      redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-xyz',
      midtrans_order_id: 'AE01TEST01',
      create_response: {},
      ...overrides,
    },
  });
}

async function createAcademyEnrollment(transactionId, overrides = {}) {
  return prisma.academyEnrollment.create({
    data: {
      user_id: user.id,
      academy_id: academy.id,
      transaction_id: transactionId,
      ...overrides,
    },
  });
}

// ============================================================
describe('WebhookController — handleMidtransWebhook (RS-27)', () => {
  let controller;

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.clearAllMocks();
    controller = new WebhookController();
    midtransService.verifyWebhookSignature.mockReturnValue(true);
    emailService.sendPaymentConfirmation.mockResolvedValue({});

    user = await createTestUser();
    academy = await seedAcademy();
  });

  afterAll(async () => {
    await closeConnection();
  });

  // ----------------------------------------------------------
  describe('signature validation', () => {
    it('returns 200 when signature is valid', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'settlement', transaction_id: 'mid-001', payment_type: 'bank_transfer' });
      const reply = makeReply();

      await controller.handleMidtransWebhook(req, reply);

      expect(reply._status).toBe(200);
      expect(reply._body.success).toBe(true);
    });

    it('returns 400 when signature is invalid', async () => {
      midtransService.verifyWebhookSignature.mockReturnValue(false);

      const req = makeRequest({ order_id: 'AE01FAKE', transaction_status: 'settlement', transaction_id: 'mid-001', payment_type: 'bank_transfer' });
      const reply = makeReply();

      await controller.handleMidtransWebhook(req, reply);

      expect(reply._status).toBe(400);
      expect(reply._body.success).toBe(false);
    });
  });

  // ----------------------------------------------------------
  describe('AcademyEnrollment Layer 3 update', () => {
    it('enrollment record persists when payment is paid (settlement)', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      const enrollment = await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'settlement', transaction_id: 'mid-001', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      const updated = await prisma.academyEnrollment.findUnique({ where: { id: enrollment.id } });
      expect(updated).not.toBeNull();
      expect(updated.completed_at).toBeNull();
    });

    it('enrollment record persists when payment expired', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      const enrollment = await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'expire', transaction_id: 'mid-002', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      const updated = await prisma.academyEnrollment.findUnique({ where: { id: enrollment.id } });
      expect(updated).not.toBeNull();
    });

    it('enrollment record persists when payment failed', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      const enrollment = await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'deny', transaction_id: 'mid-003', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      const updated = await prisma.academyEnrollment.findUnique({ where: { id: enrollment.id } });
      expect(updated).not.toBeNull();
    });

    it('also updates Layer 1 (Transaction) status', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'settlement', transaction_id: 'mid-001', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      const updated = await prisma.transaction.findUnique({ where: { id: tx.id } });
      expect(updated.status).toBe('paid');
    });

    it('also updates Layer 2 (MidtransTransaction)', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'settlement', transaction_id: 'mid-txn-999', payment_type: 'gopay' });
      await controller.handleMidtransWebhook(req, makeReply());

      const midtransTx = await prisma.midtransTransaction.findUnique({ where: { transaction_id: tx.id } });
      expect(midtransTx.midtrans_transaction_id).toBe('mid-txn-999');
      expect(midtransTx.transaction_status).toBe('settlement');
    });
  });

  // ----------------------------------------------------------
  describe('RYLS payment — AcademyEnrollment not touched', () => {
    it('does not update AcademyEnrollment when webhook is for RYLS payment', async () => {
      // Create a RYLS registration + payment (no academy enrollment)
      const registration = await prisma.rylsRegistration.create({
        data: {
          full_name: 'Test Ryls',
          email: 'ryls@test.com',
          residence: 'Jakarta',
          nationality: 'Indonesian',
          whatsapp: '081234567890',
          institution: 'Univ Test',
          date_of_birth: new Date('2000-01-01'),
          gender: 'MALE',
          discover_source: 'FRIENDS',
          scholarship_type: 'SELF_FUNDED',
        },
      });

      const tx = await createTransaction({ customer_email: 'ryls@test.com', product_type: 'ryls_payment' });
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      await prisma.rylsPayment.create({
        data: {
          registration_id: registration.id,
          transaction_id: tx.id,
          status: 'pending',
          scholarship_type: 'SELF_FUNDED',
          payment_method: 'midtrans',
        },
      });

      // Create an unrelated academy enrollment to verify it's not touched
      const otherTx = await createTransaction();
      await createMidtransTransaction(otherTx.id, { midtrans_order_id: otherTx.transaction_code });
      const unrelatedEnrollment = await createAcademyEnrollment(otherTx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'settlement', transaction_id: 'mid-ryls-001', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      // Unrelated enrollment untouched
      const stillPending = await prisma.academyEnrollment.findUnique({ where: { id: unrelatedEnrollment.id } });
      expect(stillPending).not.toBeNull();
    });
  });

  // ----------------------------------------------------------
  describe('email confirmation', () => {
    it('fires payment confirmation email on paid status', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'settlement', transaction_id: 'mid-001', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      // Give fire-and-forget a tick to run
      await new Promise((r) => setTimeout(r, 50));
      expect(emailService.sendPaymentConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'budi@test.com' }),
      );
    });

    it('does not fire email on non-paid status', async () => {
      const tx = await createTransaction();
      await createMidtransTransaction(tx.id, { midtrans_order_id: tx.transaction_code });
      await createAcademyEnrollment(tx.id);

      const req = makeRequest({ order_id: tx.transaction_code, transaction_status: 'expire', transaction_id: 'mid-002', payment_type: 'bank_transfer' });
      await controller.handleMidtransWebhook(req, makeReply());

      await new Promise((r) => setTimeout(r, 50));
      expect(emailService.sendPaymentConfirmation).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  describe('atomicity', () => {
    it('returns 500 when transaction_code not found (no partial update)', async () => {
      const req = makeRequest({ order_id: 'AE01NONEXISTENT', transaction_status: 'settlement', transaction_id: 'mid-999', payment_type: 'bank_transfer' });
      const reply = makeReply();

      await controller.handleMidtransWebhook(req, reply);

      expect(reply._status).toBe(500);
    });
  });
});
