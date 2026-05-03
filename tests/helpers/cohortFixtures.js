/**
 * Cohort Placement Test Fixtures
 * Seeding helpers for cohort-placement e2e tests
 */

import { getTestPrisma } from './testDb.js';
import crypto from 'crypto';

/**
 * Build a valid Midtrans webhook signature
 */
export function buildMidtransSignature(orderId, statusCode, grossAmount) {
  const serverKey =
    process.env.MIDTRANS_SANDBOX_SERVER_KEY ||
    process.env.MIDTRANS_SERVER_KEY ||
    'test-server-key';
  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(raw).digest('hex');
}

/**
 * Build a settlement webhook payload for a given order
 */
export function buildSettlementWebhook(orderId, grossAmount = '1500000') {
  const statusCode = '200';
  return {
    order_id: orderId,
    transaction_status: 'settlement',
    transaction_id: `midtrans-${Date.now()}`,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: buildMidtransSignature(orderId, statusCode, grossAmount),
    payment_type: 'bank_transfer',
    bank: 'bca',
    settlement_time: new Date().toISOString(),
  };
}

/**
 * Seed a minimal user (admin or regular)
 */
export async function createUser(overrides = {}) {
  const prisma = getTestPrisma();
  const ts = Date.now();
  return prisma.user.create({
    data: {
      username: `user_${ts}`,
      first_name: 'Test',
      last_name: 'User',
      email: `user_${ts}@cohorttest.com`,
      password: 'hashed_password',
      role: 'USER',
      ...overrides,
    },
  });
}

/**
 * Seed an academy with one pricing option
 */
export async function createAcademyWithPricing(overrides = {}) {
  const prisma = getTestPrisma();
  const ts = Date.now();
  const academy = await prisma.academy.create({
    data: {
      title: `Test Academy ${ts}`,
      slug: `test-academy-${ts}`,
      status: 'ACTIVE',
      ...overrides,
    },
  });

  const pricing = await prisma.academyPricing.create({
    data: {
      academy_id: academy.id,
      name: 'Regular',
      original_price: 1500000,
      discount_price: 1500000,
      order: 1,
    },
  });

  return { academy, pricing };
}

/**
 * Seed a cohort for a given academy
 */
export async function createCohort(academyId, overrides = {}) {
  const prisma = getTestPrisma();
  const ts = Date.now();
  return prisma.cohort.create({
    data: {
      academy_id: academyId,
      name: `Cohort ${ts}`,
      status: 'not_started',
      start_date: new Date('2026-06-01'),
      end_date: new Date('2026-08-01'),
      ...overrides,
    },
  });
}

/**
 * Seed a complete payment flow (Transaction + MidtransTransaction + AcademyEnrollment)
 * resulting in status='active' enrollment.
 * AcademyEnrollment.transaction_id is required — we create the transaction first.
 */
export async function createActiveEnrollment(userId, academyId, overrides = {}) {
  const prisma = getTestPrisma();
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  const orderCode = `ACAD${ts}${rand}`.slice(0, 30);

  // Placeholder transaction (product_type_id will be updated after enrollment created)
  const transaction = await prisma.transaction.create({
    data: {
      transaction_code: orderCode,
      amount: 1500000,
      currency: 'IDR',
      status: 'paid',
      provider: 'midtrans',
      customer_name: 'Test User',
      customer_email: `fixture_${ts}@cohorttest.com`,
      customer_phone: '08123456789',
      product_type: 'Academy',
      product_type_id: 0, // placeholder — updated below
      paid_at: new Date(),
    },
  });

  const enrollment = await prisma.academyEnrollment.create({
    data: {
      user_id: userId,
      academy_id: academyId,
      transaction_id: transaction.id,
      ...overrides,
    },
  });

  // Update product_type_id to actual enrollment id
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { product_type_id: enrollment.id },
  });

  await prisma.midtransTransaction.create({
    data: {
      transaction_id: transaction.id,
      snap_token: `snap-${ts}`,
      midtrans_order_id: orderCode,
    },
  });

  return { enrollment, transaction, orderCode };
}

/**
 * Seed a completed enrollment with its transaction (for re-purchase scenario setup)
 */
export async function createCompletedEnrollment(userId, academyId) {
  return createActiveEnrollment(userId, academyId, {
    completed_at: new Date(),
  });
}

/**
 * Create a CohortPlacement directly in DB (bypass HTTP)
 */
export async function createPlacement(enrollmentId, cohortId, userId, academyId) {
  const prisma = getTestPrisma();
  return prisma.cohortPlacement.create({
    data: {
      academy_enrollment_id: enrollmentId,
      cohort_id: cohortId,
      user_id: userId,
      academy_id: academyId,
    },
  });
}
