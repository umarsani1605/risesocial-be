/**
 * Payment seeder — creates AcademyEnrollment (Layer 3) + CohortPlacement records.
 * All 3 payment layers created here: Transaction → MidtransTransaction → AcademyEnrollment.
 * CohortPlacement seeded for a subset (simulates admin having assigned cohorts).
 */

import { logSeedStart, logSeedSuccess, logSeedError } from '../utils/logger.js';

const PAYMENT_METHODS = [
  'BCA Virtual Account',
  'BNI Virtual Account',
  'BRI Virtual Account',
  'Mandiri Virtual Account',
  'QRIS',
  'GoPay',
  'OVO',
  'Credit Card',
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTransactionCode() {
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `RSC${suffix}`;
}

export async function seedPayments(prisma) {
  try {
    logSeedStart('Payments');

    // ── Cleanup (FK order) ────────────────────────────────────────────────────
    await prisma.cohortCertificate.deleteMany({});
    await prisma.cohortPlacement.deleteMany({});

    const academyTxRecords = await prisma.transaction.findMany({
      where: { product_type: 'academy_enrollment' },
      select: { id: true },
    });
    const academyTxIds = academyTxRecords.map((t) => t.id);

    if (academyTxIds.length > 0) {
      await prisma.midtransTransaction.deleteMany({
        where: { transaction_id: { in: academyTxIds } },
      });
      await prisma.transactionItem.deleteMany({
        where: { transaction_id: { in: academyTxIds } },
      });
    }

    await prisma.academyEnrollment.deleteMany({});

    if (academyTxIds.length > 0) {
      await prisma.transaction.deleteMany({
        where: { id: { in: academyTxIds } },
      });
    }

    // ── Fetch reference data ──────────────────────────────────────────────────
    const cohorts = await prisma.cohort.findMany({
      include: {
        academy: {
          select: {
            id: true,
            title: true,
            pricing: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, first_name: true, last_name: true, email: true },
    });

    if (users.length === 0 || cohorts.length === 0) {
      logSeedSuccess('Payments', { enrollmentCount: 0, placementCount: 0 });
      return { enrollmentCount: 0, placementCount: 0 };
    }

    const johnDoe = users.find((u) => u.email === 'user@risesocial.org');
    const otherUsers = users.filter((u) => u.email !== 'user@risesocial.org');

    let enrollmentCount = 0;
    let placementCount = 0;

    // Track (user_id, cohort_id) pairs to avoid duplicate placement constraint
    const placedPairs = new Set();
    // Track (user_id, academy_id) active enrollment to avoid blocking re-seed duplicates
    const activeEnrollments = new Map();

    // ── Helper: create one full enrollment (all 3 layers + optional placement) ─
    async function createEnrollment({ user, cohort, enrollStatus, withPlacement }) {
      const key = `${user.id}-${cohort.academy.id}`;
      // Skip if this user already has an active/completed enrollment for same academy
      // (mirrors the re-purchase block rule; seeder simplification)
      if (activeEnrollments.has(key)) return;

      const pricing = cohort.academy.pricing ?? [];
      const tier = pricing.find((p) => p.order === 2) ?? pricing[0];
      const amount = tier?.discount_price ?? 2500000;
      const transactionCode = randomTransactionCode();
      const midtransOrderId = `RSC-ORDER-${transactionCode}`;
      const isPaid = enrollStatus === 'active' || enrollStatus === 'completed';
      const txStatus = isPaid ? 'paid' : enrollStatus === 'pending' ? 'pending' : 'failed';
      const paymentMethod = randomFrom(PAYMENT_METHODS);
      const customerName = `${user.first_name} ${user.last_name}`;
      const productCode = `ACADEMY-${cohort.academy.title.substring(0, 8).replace(/\s/g, '').toUpperCase()}`;

      // Layer 1: Transaction (product_type_id filled in after enrollment is created)
      const transaction = await prisma.transaction.create({
        data: {
          transaction_code: transactionCode,
          amount,
          currency: 'IDR',
          status: txStatus,
          provider: 'midtrans',
          payment_method: isPaid ? paymentMethod : null,
          customer_name: customerName,
          customer_email: user.email,
          user_id: user.id,
          product_type: 'academy_enrollment',
          product_type_id: 0, // placeholder — updated after enrollment created
          paid_at: isPaid
            ? new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000))
            : null,
        },
      });

      await prisma.transactionItem.create({
        data: {
          transaction_id: transaction.id,
          product_code: productCode,
          product_name: cohort.academy.title,
          product_category: 'academy_enrollment',
          quantity: 1,
          unit_price: amount,
          total_price: amount,
        },
      });

      await prisma.midtransTransaction.create({
        data: {
          transaction_id: transaction.id,
          snap_token: `snap-${transactionCode}-${Math.random().toString(36).substring(2, 9)}`,
          midtrans_order_id: midtransOrderId,
          transaction_status: isPaid ? 'settlement' : txStatus === 'pending' ? 'pending' : 'deny',
        },
      });

      // Layer 3: AcademyEnrollment (temporary: still created for pending TX until RS-42/RS-44; no `status` column)
      const enrollment = await prisma.academyEnrollment.create({
        data: {
          academy_id: cohort.academy.id,
          user_id: user.id,
          transaction_id: transaction.id,
          completed_at: enrollStatus === 'completed' ? cohort.end_date ?? new Date() : null,
        },
      });

      // Update transaction.product_type_id to the real enrollment id
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { product_type_id: enrollment.id },
      });

      enrollmentCount++;
      activeEnrollments.set(key, enrollment.id);

      // CohortPlacement (only if admin has "assigned" this user to the cohort)
      if (withPlacement) {
        const placementKey = `${cohort.id}-${user.id}`;
        if (!placedPairs.has(placementKey)) {
          await prisma.cohortPlacement.create({
            data: {
              academy_enrollment_id: enrollment.id,
              cohort_id: cohort.id,
              user_id: user.id,
              academy_id: cohort.academy.id,
            },
          });
          placedPairs.add(placementKey);
          placementCount++;
        }
      }
    }

    // ── John Doe special enrollments ──────────────────────────────────────────
    // Simulates: completed cohort (with placement), in_progress cohort (placed),
    //            not_started cohort (paid but not yet placed — "Kelas belum dimulai")
    if (johnDoe) {
      const completedCohort = cohorts.find((c) => c.status === 'completed');
      const ongoingCohort = cohorts.find((c) => c.status === 'in_progress');
      const notStartedCohort = cohorts.find((c) => c.status === 'not_started');

      if (completedCohort) {
        await createEnrollment({
          user: johnDoe,
          cohort: completedCohort,
          enrollStatus: 'completed',
          withPlacement: true,
        });
      }
      if (ongoingCohort) {
        await createEnrollment({
          user: johnDoe,
          cohort: ongoingCohort,
          enrollStatus: 'active',
          withPlacement: true,
        });
      }
      if (notStartedCohort) {
        await createEnrollment({
          user: johnDoe,
          cohort: notStartedCohort,
          enrollStatus: 'active',
          withPlacement: false, // "Kelas belum dimulai" state
        });
      }
    }

    // ── Random enrollments for other users ────────────────────────────────────
    for (const cohort of cohorts) {
      const shuffled = [...otherUsers].sort(() => Math.random() - 0.5);
      const count = 2 + Math.floor(Math.random() * 3); // 2–4 per cohort
      const enrollees = shuffled.slice(0, Math.min(count, otherUsers.length));

      for (const user of enrollees) {
        let enrollStatus, withPlacement;

        if (cohort.status === 'completed') {
          enrollStatus = 'completed';
          withPlacement = true;
        } else if (cohort.status === 'in_progress') {
          enrollStatus = 'active';
          withPlacement = Math.random() > 0.3; // 70% placed, 30% still waiting
        } else {
          // not_started
          const roll = Math.random();
          if (roll < 0.5) {
            enrollStatus = 'active'; // paid, not placed yet
            withPlacement = false;
          } else {
            enrollStatus = 'pending'; // not paid yet
            withPlacement = false;
          }
        }

        await createEnrollment({ user, cohort, enrollStatus, withPlacement });
      }
    }

    const stats = { enrollmentCount, placementCount };
    logSeedSuccess('Payments', stats);
    return stats;
  } catch (error) {
    logSeedError('Payments', error);
    throw error;
  }
}
