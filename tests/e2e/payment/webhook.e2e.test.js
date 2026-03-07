import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { build } from '../../helpers/testServer.js';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Force Prisma to use test database by creating new instance with explicit datasource
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

describe('Webhook E2E Tests', () => {
  let app;
  let testTransaction;
  let testRegistration;

  beforeAll(async () => {
    app = await build();

    // Create test data
    testRegistration = await prisma.rylsRegistration.create({
      data: {
        full_name: 'Webhook Test User',
        email: 'webhook@example.com',
        residence: 'Jakarta',
        nationality: 'Indonesian',
        whatsapp: '08123456789',
        institution: 'Test University',
        date_of_birth: new Date('2000-01-01'),
        gender: 'MALE',
        discover_source: 'RISE_INSTAGRAM',
        scholarship_type: 'SELF_FUNDED',
      },
    });

    // Create transaction
    testTransaction = await prisma.transaction.create({
      data: {
        transaction_code: 'RYLS01TEST1234',
        amount: 100000,
        currency: 'IDR',
        status: 'pending',
        provider: 'midtrans',
        customer_name: 'Webhook Test User',
        customer_email: 'webhook@example.com',
        customer_phone: '08123456789',
        product_type: 'Rise Young Leaders Scholarship',
        product_type_id: testRegistration.id,
      },
    });

    // Create midtrans transaction
    await prisma.midtransTransaction.create({
      data: {
        transaction_id: testTransaction.id,
        snap_token: 'test-token',
        midtrans_order_id: 'RYLS01TEST1234',
      },
    });

    // Create RYLS payment
    await prisma.rylsPayment.create({
      data: {
        transaction_id: testTransaction.id,
        registration_id: testRegistration.id,
        scholarship_type: 'SELF_FUNDED',
        payment_method: 'midtrans',
        status: 'pending',
      },
    });
  });

  afterAll(async () => {
    await prisma.rylsPayment.deleteMany({});
    await prisma.transactionItem.deleteMany({});
    await prisma.midtransTransaction.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.rylsRegistration.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/webhooks/midtrans', () => {
    it('should process valid webhook and update all 3 layers', async () => {
      // Arrange
      const serverKey = process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY || 'test-server-key';
      const orderId = 'RYLS01TEST1234';
      const statusCode = '200';
      const grossAmount = '100000';

      const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const signatureKey = crypto.createHash('sha512').update(signatureString).digest('hex');

      const webhookPayload = {
        order_id: orderId,
        transaction_status: 'settlement',
        transaction_id: 'midtrans-txn-123',
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        payment_type: 'bank_transfer',
        bank: 'bca',
        settlement_time: '2024-01-01 10:00:00',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/midtrans',
        payload: webhookPayload,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.order_id).toBe(orderId);

      // Verify Layer 1: Transaction updated
      const transaction = await prisma.transaction.findUnique({
        where: { transaction_code: orderId },
      });
      expect(transaction.status).toBe('paid');
      expect(transaction.payment_method).toBe('bca_va');
      expect(transaction.provider_reference).toBe('midtrans-txn-123');
      expect(transaction.paid_at).toBeDefined();

      // Verify Layer 2: Midtrans transaction updated
      const midtransTransaction = await prisma.midtransTransaction.findUnique({
        where: { transaction_id: transaction.id },
      });
      expect(midtransTransaction.transaction_status).toBe('settlement');
      expect(midtransTransaction.payment_type).toBe('bank_transfer');
      expect(midtransTransaction.bank).toBe('bca');
      expect(midtransTransaction.last_notification).toBeDefined();

      // Verify Layer 3: RYLS payment updated
      const rylsPayment = await prisma.rylsPayment.findUnique({
        where: { transaction_id: transaction.id },
      });
      expect(rylsPayment.status).toBe('paid');
    });

    it('should reject webhook with invalid signature', async () => {
      // Arrange
      const webhookPayload = {
        order_id: 'RYLS01TEST1234',
        transaction_status: 'settlement',
        transaction_id: 'midtrans-txn-456',
        status_code: '200',
        gross_amount: '100000',
        signature_key: 'invalid-signature',
        payment_type: 'gopay',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/midtrans',
        payload: webhookPayload,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toContain('Invalid signature');
    });

    it('should handle webhook for non-existent transaction', async () => {
      // Arrange
      const serverKey = process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY || 'test-server-key';
      const orderId = 'RYLS99NOTFOUND';
      const statusCode = '200';
      const grossAmount = '100000';

      const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const signatureKey = crypto.createHash('sha512').update(signatureString).digest('hex');

      const webhookPayload = {
        order_id: orderId,
        transaction_status: 'settlement',
        transaction_id: 'midtrans-txn-789',
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        payment_type: 'qris',
      };

      // Act
      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks/midtrans',
        payload: webhookPayload,
      });

      // Assert
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });
});
