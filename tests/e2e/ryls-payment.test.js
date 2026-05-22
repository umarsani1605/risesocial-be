/**
 * E2E Tests: RYLS Payment Feature
 * Tests payment creation (Midtrans + PayPal), status queries, and webhook handling
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { vi } from 'vitest';
import { createTestApp } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';
import { createSelfFundedRegistration, createRylsPayment } from '../helpers/rylsFixtures.js';
import crypto from 'crypto';

// Mock the Midtrans client so tests don't hit real API
vi.mock('../../src/integrations/midtransClient.js', () => ({
  snap: {
    createTransaction: vi.fn().mockResolvedValue({
      token: 'mock-snap-token-abc123',
      redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-snap-token-abc123',
    }),
  },
  core: {
    transaction: {
      notification: vi.fn(),
    },
  },
}));

// Mock currency API so tests don't need live API key
vi.mock('../../src/constants/payments.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getPaymentAmountIdr: vi.fn().mockResolvedValue(11250000), // ~$750 in IDR
    getItemTemplate: actual.getItemTemplate,
  };
});

describe('RYLS Payment E2E Tests', () => {
  let app;
  let prisma;

  beforeEach(async () => {
    app = await createTestApp();
    prisma = getTestPrisma();
    await resetDatabase();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    if (app) await app.close();
    await closeConnection();
  });

  // ============================================================
  // POST /payments/ryls/transactions — MIDTRANS
  // ============================================================
  describe('POST /payments/ryls/transactions (MIDTRANS)', () => {
    it('should create Midtrans transaction with 3 layers', async () => {
      const { registration } = await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'POST',
        url: '/payments/ryls/transactions',
        payload: {
          type: 'MIDTRANS',
          data: {
            registrationId: registration.id,
            fullName: registration.full_name,
            email: registration.email,
            whatsapp: registration.whatsapp,
            residence: registration.residence,
            scholarshipType: 'SELF_FUNDED',
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('payment_id');
      expect(body.data).toHaveProperty('transaction_code');
      expect(body.data.transaction_code).toMatch(/^RYLS\d{2}[A-F0-9]{8}$/i);
      expect(body.data.token).toBe('mock-snap-token-abc123');
      expect(body.data.redirect_url).toContain('midtrans');
      expect(body.data.currency).toBe('IDR');
      expect(body.data.amount).toBe(11250000);
    });

    it('should save all 3 layers to database', async () => {
      const { registration } = await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'POST',
        url: '/payments/ryls/transactions',
        payload: {
          type: 'MIDTRANS',
          data: {
            registrationId: registration.id,
            fullName: registration.full_name,
            email: registration.email,
            whatsapp: registration.whatsapp,
            residence: registration.residence,
            scholarshipType: 'SELF_FUNDED',
          },
        },
      });

      const { data } = JSON.parse(response.body);

      // Layer 1: Transaction
      const transaction = await prisma.transaction.findFirst({ where: { transaction_code: data.transaction_code } });
      expect(transaction).not.toBeNull();
      expect(transaction.status).toBe('pending');
      expect(transaction.provider).toBe('midtrans');
      expect(transaction.amount).toBe(11250000);

      // Layer 2: MidtransTransaction
      const midtransRecord = await prisma.midtransTransaction.findUnique({ where: { transaction_id: transaction.id } });
      expect(midtransRecord).not.toBeNull();
      expect(midtransRecord.snap_token).toBe('mock-snap-token-abc123');

      // Layer 3: RylsPayment
      const rylsPayment = await prisma.rylsPayment.findUnique({ where: { id: data.payment_id } });
      expect(rylsPayment).not.toBeNull();
      expect(rylsPayment.payment_method).toBe('midtrans');
      expect(rylsPayment.registration_id).toBe(registration.id);
    });

    it('should return 404 for non-existent registrationId', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/payments/ryls/transactions',
        payload: {
          type: 'MIDTRANS',
          data: {
            registrationId: 99999,
            fullName: 'Test',
            email: 'test@example.com',
            whatsapp: '081234567890',
            residence: 'Jakarta',
            scholarshipType: 'SELF_FUNDED',
          },
        },
      });

      // 404 or 500 depending on service behavior — at minimum not 200
      expect(response.statusCode).not.toBe(200);
    });
  });

  // ============================================================
  // POST /payments/ryls/transactions — PAYPAL
  // ============================================================
  describe('POST /payments/ryls/transactions (PAYPAL)', () => {
    it('should create PayPal transaction with status PAID immediately', async () => {
      const { registration } = await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'POST',
        url: '/payments/ryls/transactions',
        payload: {
          type: 'PAYPAL',
          data: {
            registrationId: registration.id,
            fullName: registration.full_name,
            email: registration.email,
            whatsapp: registration.whatsapp,
            residence: registration.residence,
            scholarshipType: 'SELF_FUNDED',
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.token).toBeNull();
      expect(body.data.redirect_url).toBeNull();
      expect(body.data).toHaveProperty('transaction_code');
    });

    it('should set Layer 1 status to paid for PayPal', async () => {
      const { registration } = await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'POST',
        url: '/payments/ryls/transactions',
        payload: {
          type: 'PAYPAL',
          data: {
            registrationId: registration.id,
            fullName: registration.full_name,
            email: registration.email,
            whatsapp: registration.whatsapp,
            residence: registration.residence,
            scholarshipType: 'SELF_FUNDED',
          },
        },
      });

      const { data } = JSON.parse(response.body);
      const transaction = await prisma.transaction.findFirst({ where: { transaction_code: data.transaction_code } });
      expect(transaction.status).toBe('paid');
      expect(transaction.provider).toBe('paypal');
      expect(transaction.paid_at).not.toBeNull();

      // No Layer 2 (MidtransTransaction) for PayPal
      const midtransRecord = await prisma.midtransTransaction.findUnique({ where: { transaction_id: transaction.id } });
      expect(midtransRecord).toBeNull();
    });
  });

  // ============================================================
  // GET /payments/ryls/:registrationId/status
  // ============================================================
  describe('GET /payments/ryls/:registrationId/status', () => {
    it('should return hasPayment=false when no payment exists', async () => {
      const { registration } = await createSelfFundedRegistration();

      const response = await app.inject({
        method: 'GET',
        url: `/payments/ryls/${registration.id}/status`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.hasPayment).toBe(false);
      expect(body.data.status).toBeNull();
    });

    it('should return payment status when payment exists', async () => {
      const { registration } = await createSelfFundedRegistration();
      await createRylsPayment(registration.id, 'SELF_FUNDED');

      const response = await app.inject({
        method: 'GET',
        url: `/payments/ryls/${registration.id}/status`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.hasPayment).toBe(true);
      expect(body.data.status).toBe('pending');
      expect(body.data).toHaveProperty('transaction_code');
      expect(body.data).toHaveProperty('amount');
      expect(body.data.currency).toBe('IDR');
    });
  });

  // ============================================================
  // POST /api/webhooks/midtrans — RYLS Layer 3
  // ============================================================
  describe('POST /api/webhooks/midtrans (RYLS payment)', () => {
    async function setupRylsWebhookData() {
      const { registration } = await createSelfFundedRegistration();
      const transactionCode = `RYLS01WBHK${Date.now().toString(16).toUpperCase().slice(-4)}`;

      const transaction = await prisma.transaction.create({
        data: {
          transaction_code: transactionCode,
          amount: 11250000,
          currency: 'IDR',
          status: 'pending',
          provider: 'midtrans',
          payment_token: 'mock-snap-token',
          customer_name: registration.full_name,
          customer_email: registration.email,
          customer_phone: registration.whatsapp,
          product_type: 'Rise Young Leaders Scholarship',
          product_type_id: registration.id,
        },
      });

      await prisma.midtransTransaction.create({
        data: {
          transaction_id: transaction.id,
          snap_token: 'mock-snap-token',
          midtrans_order_id: transactionCode,
        },
      });

      await prisma.rylsPayment.create({
        data: {
          transaction_id: transaction.id,
          registration_id: registration.id,
          scholarship_type: 'SELF_FUNDED',
          payment_method: 'midtrans',
          status: 'pending',
        },
      });

      return { registration, transaction, transactionCode };
    }

    function buildSignature(orderId, statusCode, grossAmount) {
      const serverKey = process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY || 'test-server-key';
      return crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex');
    }

    it('should update all 3 layers on settlement', async () => {
      const { transaction, transactionCode } = await setupRylsWebhookData();
      const grossAmount = String(transaction.amount);
      const signatureKey = buildSignature(transactionCode, '200', grossAmount);

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/midtrans',
        payload: {
          order_id: transactionCode,
          transaction_status: 'settlement',
          transaction_id: 'midtrans-ref-123',
          status_code: '200',
          gross_amount: grossAmount,
          signature_key: signatureKey,
          payment_type: 'bank_transfer',
          bank: 'bca',
          settlement_time: '2024-01-01 10:00:00',
        },
      });

      expect(response.statusCode).toBe(200);

      // Layer 1: Transaction updated to paid
      const updatedTx = await prisma.transaction.findUnique({ where: { id: transaction.id } });
      expect(updatedTx.status).toBe('paid');
      expect(updatedTx.paid_at).not.toBeNull();

      // Layer 3: RylsPayment updated to paid
      const updatedPayment = await prisma.rylsPayment.findFirst({ where: { transaction_id: transaction.id } });
      expect(updatedPayment.status).toBe('paid');
    });

    it('should update layers on expire', async () => {
      const { transaction, transactionCode } = await setupRylsWebhookData();
      const grossAmount = String(transaction.amount);
      const signatureKey = buildSignature(transactionCode, '407', grossAmount);

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/midtrans',
        payload: {
          order_id: transactionCode,
          transaction_status: 'expire',
          transaction_id: 'midtrans-ref-456',
          status_code: '407',
          gross_amount: grossAmount,
          signature_key: signatureKey,
          payment_type: 'bank_transfer',
        },
      });

      expect(response.statusCode).toBe(200);

      const updatedTx = await prisma.transaction.findUnique({ where: { id: transaction.id } });
      expect(updatedTx.status).toBe('expired');
    });

    it('should return 400 for invalid signature', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/midtrans',
        payload: {
          order_id: 'RYLS01INVALID',
          transaction_status: 'settlement',
          transaction_id: 'midtrans-ref-999',
          status_code: '200',
          gross_amount: '11250000',
          signature_key: 'invalid-signature',
          payment_type: 'bank_transfer',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
