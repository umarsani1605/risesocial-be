/**
 * E2E Tests: Cohort Placement Flow (RS-31)
 *
 * Validates the full admin-driven placement lifecycle:
 *   Buy → Webhook → Active enrollment → Admin assign → User access
 *
 * 8 scenarios covering happy path, transfers, cancellation, completion,
 * repeat-purchase, and archive access.
 *
 * Midtrans is mocked so tests run without real API calls.
 * PDF generation is mocked so certificate tests run without template files.
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Mock Midtrans — prevents real outbound API calls (snap create / cancel / status query)
// but preserves verifyWebhookSignature so webhook tests still validate signatures correctly
vi.mock('../../src/services/shared/MidtransService.js', async (importOriginal) => {
  const original = await importOriginal();
  const realService = original.midtransService;
  return {
    midtransService: {
      createSnapTransaction: vi.fn().mockResolvedValue({
        token: 'test-snap-token',
        redirectUrl: 'https://app.sandbox.midtrans.com/snap/test',
      }),
      cancelTransaction: vi.fn().mockResolvedValue({}),
      getTransactionStatus: vi.fn().mockResolvedValue({ transaction_status: 'pending' }),
      // Keep real implementation so signature validation works with our computed test sigs
      verifyWebhookSignature: realService.verifyWebhookSignature.bind(realService),
    },
  };
});

// Mock PDF generation — prevents fs/pdf-lib calls during certificate test
vi.mock('../../src/services/admin/cohortService.js', async (importOriginal) => {
  const original = await importOriginal();
  const OriginalClass = original.AdminCohortService;
  OriginalClass.prototype._generatePDF = vi.fn().mockResolvedValue(undefined);
  return original;
});
import { createTestApp, generateAdminToken, generateSuperadminToken, generateUserToken } from '../helpers/testServer.js';
import { getTestPrisma, resetDatabase, closeConnection } from '../helpers/testDb.js';
import {
  createUser,
  createAcademyWithPricing,
  createCohort,
  createActiveEnrollment,
  createCompletedEnrollment,
  createPlacement,
  buildSettlementWebhook,
} from '../helpers/cohortFixtures.js';

// ─── Shared state ────────────────────────────────────────────────────────────

let app;
let prisma;

let adminUser;
let regularUser;
let adminToken;
let superadminToken;
let userToken;

let academy;
let pricing;
let cohortA;
let cohortB;

beforeEach(async () => {
  app = await createTestApp();
  prisma = getTestPrisma();
  await resetDatabase();

  adminUser = await createUser({ role: 'ADMIN', username: 'admin_placement' });
  regularUser = await createUser({ role: 'USER', username: 'user_placement' });

  adminToken = await generateAdminToken(adminUser.id, adminUser.email);
  // SUPERADMIN bypasses requirePermission checks (needed for cohort CRUD routes)
  superadminToken = await generateSuperadminToken(adminUser.id, adminUser.email);
  userToken = await generateUserToken(regularUser.id, regularUser.email);

  const academyData = await createAcademyWithPricing();
  academy = academyData.academy;
  pricing = academyData.pricing;

  cohortA = await createCohort(academy.id, { name: 'Cohort A', status: 'not_started' });
  cohortB = await createCohort(academy.id, { name: 'Cohort B', status: 'not_started' });
});

afterAll(async () => {
  if (app) await app.close();
  await closeConnection();
});

// ─── Helper: simulate Midtrans paid webhook ───────────────────────────────────

async function simulatePaidWebhook(orderCode, amount = '1500000') {
  const payload = buildSettlementWebhook(orderCode, amount);
  return app.inject({
    method: 'POST',
    url: '/api/webhooks/midtrans',
    payload,
  });
}

// ─── Helper: create transaction via API ──────────────────────────────────────

async function createTransaction(token, academyId, pricingId) {
  return app.inject({
    method: 'POST',
    url: '/payments/academy/transactions',
    headers: { authorization: `Bearer ${token}` },
    payload: { academy_id: academyId, pricing_id: pricingId },
  });
}

// ─── Helper: admin assign enrollment to cohort ───────────────────────────────

async function adminAssign(enrollmentId, cohortId, notes = null) {
  return app.inject({
    method: 'POST',
    url: `/admin/academy-enrollments/${enrollmentId}/assign`,
    headers: { authorization: `Bearer ${adminToken}` },
    payload: { cohort_id: cohortId, ...(notes ? { notes } : {}) },
  });
}

// ─── Helper: GET cohort modules as user ──────────────────────────────────────

async function getModules(cohortId, token = userToken) {
  return app.inject({
    method: 'GET',
    url: `/cohorts/${cohortId}/modules`,
    headers: { authorization: `Bearer ${token}` },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Skenario 1 — Happy Path: Buy → Assign → Access
// ─────────────────────────────────────────────────────────────────────────────

describe('Skenario 1 — Happy Path: Buy → Assign → Access', () => {
  it('creates pending enrollment on purchase, active after webhook, access granted after assign', async () => {
    // Step 1: Create transaction
    const txRes = await createTransaction(userToken, academy.id, pricing.id);
    expect(txRes.statusCode).toBe(200);
    const { enrollment_id, transaction_code } = JSON.parse(txRes.body).data;
    expect(enrollment_id).toBeDefined();

    // Step 2: Verify enrollment exists and transaction is pending (before webhook)
    let enrollment = await prisma.academyEnrollment.findUnique({
      where: { id: enrollment_id },
      include: { transaction: { select: { status: true } } },
    });
    expect(enrollment).not.toBeNull();
    expect(enrollment.transaction.status).toBe('pending');

    // Step 3: Confirm no placement yet
    const placement = await prisma.cohortPlacement.findFirst({ where: { academy_enrollment_id: enrollment_id } });
    expect(placement).toBeNull();

    // Step 4: Simulate Midtrans paid webhook
    const webhookRes = await simulatePaidWebhook(transaction_code);
    expect(webhookRes.statusCode).toBe(200);

    // Step 5: Verify transaction is now paid (enrollment is active)
    enrollment = await prisma.academyEnrollment.findUnique({
      where: { id: enrollment_id },
      include: { transaction: { select: { status: true } } },
    });
    expect(enrollment.transaction.status).toBe('paid');

    // Step 6: User cannot access cohort modules without placement → 403
    let modulesRes = await getModules(cohortA.id);
    expect(modulesRes.statusCode).toBe(403);

    // Step 7: Admin assigns enrollment to cohort
    const assignRes = await adminAssign(enrollment_id, cohortA.id);
    expect(assignRes.statusCode).toBe(200);
    const assignBody = JSON.parse(assignRes.body);
    expect(assignBody.data.cohort_id).toBe(cohortA.id);

    // Step 8: Verify CohortPlacement created
    const newPlacement = await prisma.cohortPlacement.findFirst({
      where: { academy_enrollment_id: enrollment_id },
    });
    expect(newPlacement).not.toBeNull();
    expect(newPlacement.cohort_id).toBe(cohortA.id);

    // Step 9: User can now access cohort modules
    modulesRes = await getModules(cohortA.id);
    expect(modulesRes.statusCode).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Skenario 2 — Re-purchase setelah completed
// ─────────────────────────────────────────────────────────────────────────────

describe('Skenario 2 — Re-purchase setelah completed', () => {
  it('allows a new enrollment when existing enrollment is completed', async () => {
    // Setup: completed enrollment (needs a transaction_id)
    await createCompletedEnrollment(regularUser.id, academy.id);

    // Buy again
    const txRes = await createTransaction(userToken, academy.id, pricing.id);
    expect(txRes.statusCode).toBe(200);
    const { enrollment_id } = JSON.parse(txRes.body).data;

    // Two enrollments exist for the same user/academy
    const enrollments = await prisma.academyEnrollment.findMany({
      where: { user_id: regularUser.id, academy_id: academy.id },
    });
    expect(enrollments).toHaveLength(2);

    // New one has no completed_at
    const newEnrollment = enrollments.find((e) => e.id === enrollment_id);
    expect(newEnrollment.completed_at).toBeNull();

    // Completed one has completed_at set
    const completedEnrollment = enrollments.find((e) => e.id !== enrollment_id);
    expect(completedEnrollment.completed_at).toBeInstanceOf(Date);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Skenario 3 — Block re-purchase saat masih active
// ─────────────────────────────────────────────────────────────────────────────

describe('Skenario 3 — Block re-purchase saat masih active', () => {
  it('returns 409 when active enrollment already exists for the academy', async () => {
    // Setup: active enrollment already exists (requires transaction_id)
    await createActiveEnrollment(regularUser.id, academy.id);

    const txRes = await createTransaction(userToken, academy.id, pricing.id);
    expect(txRes.statusCode).toBe(409);
    const body = JSON.parse(txRes.body);
    expect(body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Skenario 4 — Re-assign student antar cohort (via /assign replace logic)
// ─────────────────────────────────────────────────────────────────────────────

describe('Skenario 4 — Re-assign student antar cohort', () => {
  it('re-assigns placement from cohort A to cohort B, access follows', async () => {
    // Setup: active enrollment + placement in cohort A
    const { enrollment } = await createActiveEnrollment(regularUser.id, academy.id);
    const placement = await createPlacement(enrollment.id, cohortA.id, regularUser.id, academy.id);

    // Step 1: User can access cohort A
    let modulesRes = await getModules(cohortA.id);
    expect(modulesRes.statusCode).toBe(200);

    // Step 2: Admin re-assigns to cohort B (replace existing placement atomically)
    const assignRes = await app.inject({
      method: 'POST',
      url: `/admin/academy-enrollments/${enrollment.id}/assign`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { cohort_id: cohortB.id, notes: 'Schedule conflict resolved' },
    });
    expect(assignRes.statusCode).toBe(200);
    const assignBody = JSON.parse(assignRes.body);
    expect(assignBody.data.cohort_id).toBe(cohortB.id);

    // Step 3: Old placement gone
    const oldPlacement = await prisma.cohortPlacement.findUnique({ where: { id: placement.id } });
    expect(oldPlacement).toBeNull();

    // Step 4: New placement exists in cohort B
    const newPlacement = await prisma.cohortPlacement.findFirst({
      where: { academy_enrollment_id: enrollment.id },
    });
    expect(newPlacement.cohort_id).toBe(cohortB.id);

    // Step 5: Access follows the placement — cohort A is now 403
    modulesRes = await getModules(cohortA.id);
    expect(modulesRes.statusCode).toBe(403);

    // Step 6: Cohort B is now 200
    modulesRes = await getModules(cohortB.id);
    expect(modulesRes.statusCode).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Skenario 7 — Cohort completion → archive access + certificate
// ─────────────────────────────────────────────────────────────────────────────

describe('Skenario 7 — Cohort completion → archive access + certificate', () => {
  it('completes cohort, generates cert, retains archive access for user', async () => {
    // Setup: active enrollment + placement + ongoing cohort
    const ongoingCohort = await createCohort(academy.id, {
      name: 'Cohort Ongoing',
      status: 'ongoing',
      start_date: new Date('2026-05-01'),
      end_date: new Date('2026-08-01'),
    });

    const { enrollment } = await createActiveEnrollment(regularUser.id, academy.id);
    await createPlacement(enrollment.id, ongoingCohort.id, regularUser.id, academy.id);

    // User has access pre-completion
    let modulesRes = await getModules(ongoingCohort.id);
    expect(modulesRes.statusCode).toBe(200);

    // Admin completes cohort via dedicated endpoint
    const completeRes = await app.inject({
      method: 'POST',
      url: `/admin/cohorts/${ongoingCohort.id}/complete`,
      headers: { authorization: `Bearer ${superadminToken}` },
    });
    expect(completeRes.statusCode).toBe(200);

    // Cohort marked completed
    const updatedCohort = await prisma.cohort.findUnique({ where: { id: ongoingCohort.id } });
    expect(updatedCohort.status).toBe('completed');

    // Placement still exists (not deleted)
    const placement = await prisma.cohortPlacement.findFirst({
      where: { academy_enrollment_id: enrollment.id },
    });
    expect(placement).not.toBeNull();

    // AcademyEnrollment has completed_at set after cohort completion
    const updatedEnrollment = await prisma.academyEnrollment.findUnique({
      where: { id: enrollment.id },
    });
    expect(updatedEnrollment.completed_at).toBeInstanceOf(Date);
    expect(updatedEnrollment.completed_at).toBeDefined();

    // CohortCertificate created with placement_id
    const cert = await prisma.cohortCertificate.findFirst({
      where: { placement_id: placement.id },
    });
    expect(cert).not.toBeNull();
    expect(cert.certificate_code).not.toMatch(/^PENDING-/);

    // User still has archive access
    modulesRes = await getModules(ongoingCohort.id);
    expect(modulesRes.statusCode).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Skenario 8 — User boleh ikut cohort kedua dari academy yang sama
// ─────────────────────────────────────────────────────────────────────────────

describe('Skenario 8 — Dual placement: completed + active cohort from same academy', () => {
  it('user has archive access to cohort A and active access to cohort B simultaneously', async () => {
    // Setup: completed enrollment with placement in cohort A
    const { enrollment: completedEnrollment } = await createCompletedEnrollment(regularUser.id, academy.id);
    const completedCohort = await createCohort(academy.id, {
      name: 'Completed Cohort',
      status: 'completed',
      start_date: new Date('2026-01-01'),
      end_date: new Date('2026-04-01'),
    });
    await createPlacement(completedEnrollment.id, completedCohort.id, regularUser.id, academy.id);

    // Buy again
    const txRes = await createTransaction(userToken, academy.id, pricing.id);
    expect(txRes.statusCode).toBe(200);
    const { enrollment_id: newEnrollmentId, transaction_code } = JSON.parse(txRes.body).data;

    // Webhook activates the new enrollment
    await simulatePaidWebhook(transaction_code);

    // Admin assigns new enrollment to cohort B
    const assignRes = await adminAssign(newEnrollmentId, cohortB.id);
    expect(assignRes.statusCode).toBe(200);

    // User has 2 placements total
    const placements = await prisma.cohortPlacement.findMany({
      where: { user_id: regularUser.id },
    });
    expect(placements).toHaveLength(2);
    expect(placements.map((p) => p.cohort_id)).toContain(completedCohort.id);
    expect(placements.map((p) => p.cohort_id)).toContain(cohortB.id);

    // Archive access to completed cohort — still 200
    const archiveRes = await getModules(completedCohort.id);
    expect(archiveRes.statusCode).toBe(200);

    // Active access to cohort B — 200
    const activeRes = await getModules(cohortB.id);
    expect(activeRes.statusCode).toBe(200);
  });
});
