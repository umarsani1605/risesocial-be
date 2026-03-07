import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { rylsPaymentService } from '../../../src/services/user/rylsPaymentService.js';
import { transactionRepository } from '../../../src/repositories/shared/transactionRepository.js';
import { midtransTransactionRepository } from '../../../src/repositories/shared/midtransTransactionRepository.js';
import { rylsPaymentRepository } from '../../../src/repositories/user/rylsPaymentRepository.js';

// Force Prisma to use test database by creating new instance with explicit datasource
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

describe('Payment Flow Integration Tests', () => {
  let testRegistration;

  beforeAll(async () => {
    // Create test registration
    testRegistration = await prisma.rylsRegistration.create({
      data: {
        full_name: 'Test User',
        email: 'test@example.com',
        residence: 'Jakarta, Indonesia',
        nationality: 'Indonesian',
        whatsapp: '08123456789',
        institution: 'Test University',
        date_of_birth: new Date('2000-01-01'),
        gender: 'MALE',
        discover_source: 'RISE_INSTAGRAM',
        scholarship_type: 'SELF_FUNDED',
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.rylsPayment.deleteMany({});
    await prisma.transactionItem.deleteMany({});
    await prisma.midtransTransaction.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.rylsRegistration.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Complete Payment Flow', () => {
    it('should create payment with all 3 layers', async () => {
      // Arrange
      const paymentData = {
        type: 'MIDTRANS',
        data: {
          registrationId: testRegistration.id,
          fullName: testRegistration.full_name,
          email: testRegistration.email,
          whatsapp: testRegistration.whatsapp,
          residence: testRegistration.residence,
          scholarshipType: testRegistration.scholarship_type,
        },
      };

      // Act
      const result = await rylsPaymentService.createTransaction(paymentData);

      // Assert
      expect(result).toHaveProperty('payment_id');
      expect(result).toHaveProperty('transaction_code');
      expect(result.transaction_code).toHaveLength(14);
      expect(result.transaction_code).toMatch(/^RYLS\d{2}[A-F0-9]{8}$/);

      // Verify Layer 1: Transaction
      const transaction = await transactionRepository.findByTransactionCode(result.transaction_code);
      expect(transaction).toBeDefined();
      expect(transaction.status).toBe('pending');
      expect(transaction.provider).toBe('midtrans');

      // Verify Layer 2: Midtrans Transaction
      const midtransTransaction = await midtransTransactionRepository.findByTransactionId(transaction.id);
      expect(midtransTransaction).toBeDefined();
      expect(midtransTransaction.snap_token).toBeDefined();

      // Verify Layer 3: RYLS Payment
      const rylsPayment = await rylsPaymentRepository.findByTransactionId(transaction.id);
      expect(rylsPayment).toBeDefined();
      expect(rylsPayment.registration_id).toBe(testRegistration.id);
      expect(rylsPayment.status).toBe('pending');
    });

    it('should rollback all layers on error', async () => {
      // Arrange - Invalid data that will cause error
      const paymentData = {
        type: 'MIDTRANS',
        data: {
          registrationId: 999999, // Non-existent
          fullName: 'Test Rollback',
          email: 'rollback@example.com',
          whatsapp: '08123456789',
          residence: 'Jakarta',
          scholarshipType: 'SELF_FUNDED',
        },
      };

      // Act & Assert
      await expect(rylsPaymentService.createTransaction(paymentData)).rejects.toThrow();

      // Verify no partial data created for this specific email
      const transactions = await prisma.transaction.findMany({
        where: { customer_email: 'rollback@example.com' },
      });
      expect(transactions).toHaveLength(0);
    });
  });

  describe('Payment Status Query', () => {
    it('should retrieve payment status correctly', async () => {
      // Arrange - Create a payment first
      const paymentData = {
        type: 'MIDTRANS',
        data: {
          registrationId: testRegistration.id,
          fullName: testRegistration.full_name,
          email: testRegistration.email,
          whatsapp: testRegistration.whatsapp,
          residence: testRegistration.residence,
          scholarshipType: testRegistration.scholarship_type,
        },
      };

      await rylsPaymentService.createTransaction(paymentData);

      // Act
      const status = await rylsPaymentService.getPaymentStatus(testRegistration.id);

      // Assert
      expect(status.hasPayment).toBe(true);
      expect(status.status).toBe('pending');
      expect(status.transactionCode).toBeDefined();
      expect(status.amount).toBeGreaterThan(0);
    });

    it('should return no payment for registration without payment', async () => {
      // Arrange - Create registration without payment
      const newRegistration = await prisma.rylsRegistration.create({
        data: {
          full_name: 'No Payment User',
          email: 'nopayment@example.com',
          residence: 'Jakarta',
          nationality: 'Indonesian',
          whatsapp: '08123456789',
          institution: 'Test University',
          date_of_birth: new Date('2000-01-01'),
          gender: 'FEMALE',
          discover_source: 'FRIENDS',
          scholarship_type: 'FULLY_FUNDED',
        },
      });

      // Act
      const status = await rylsPaymentService.getPaymentStatus(newRegistration.id);

      // Assert
      expect(status.hasPayment).toBe(false);
      expect(status.status).toBeNull();

      // Cleanup
      await prisma.rylsRegistration.delete({ where: { id: newRegistration.id } });
    });
  });
});
