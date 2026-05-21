import prisma from '../../config/database.js';

const PAID_STATUS = 'paid';
const ACADEMY_PRODUCT_TYPES = ['academy_enrollment'];
const RYLS_PRODUCT_TYPES = ['RYLS', 'Rise Young Leaders Scholarship', 'ryls_registration'];

function createdAtWhere(range) {
  if (!range?.start || !range?.end) return {};
  return {
    created_at: {
      gte: range.start,
      lte: range.end,
    },
  };
}

function paidTransactionWhere(range = {}) {
  return {
    status: PAID_STATUS,
    ...createdAtWhere(range),
  };
}

export class AdminAnalyticsRepository {
  async sumPaidRevenue(range) {
    const result = await prisma.transaction.aggregate({
      where: paidTransactionWhere(range),
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  async countPaidTransactionsByStatus(range) {
    const rows = await prisma.transaction.groupBy({
      by: ['status'],
      where: createdAtWhere(range),
      _count: { id: true },
    });

    return rows.map((row) => ({
      name: row.status,
      value: row._count.id,
    }));
  }

  async sumPaidRevenueByProductType(range) {
    const rows = await prisma.transaction.groupBy({
      by: ['product_type'],
      where: paidTransactionWhere(range),
      _sum: { amount: true },
    });

    return rows.map((row) => ({
      name: row.product_type,
      value: row._sum.amount ?? 0,
    }));
  }

  async countUsers(range) {
    return prisma.user.count({ where: createdAtWhere(range) });
  }

  async countActiveCohorts() {
    return prisma.cohort.count({
      where: {
        status: { not: 'completed' },
      },
    });
  }

  async countRylsRegistrations(range) {
    return prisma.rylsRegistration.count({ where: createdAtWhere(range) });
  }

  async sumPaidRevenueByDay(range) {
    const rows = await prisma.transaction.findMany({
      where: paidTransactionWhere(range),
      select: { created_at: true, amount: true },
      orderBy: { created_at: 'asc' },
    });

    return this.sumByDate(rows, 'amount');
  }

  async countUsersByDay(range) {
    const rows = await prisma.user.findMany({
      where: createdAtWhere(range),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return this.countByDate(rows);
  }

  async countAcademyEnrollmentsByAcademy(range) {
    const rows = await prisma.academyEnrollment.findMany({
      where: {
        ...createdAtWhere(range),
        transaction: {
          status: PAID_STATUS,
          product_type: { in: ACADEMY_PRODUCT_TYPES },
        },
      },
      select: {
        academy: { select: { title: true } },
      },
    });

    const counts = new Map();
    for (const row of rows) {
      const name = row.academy?.title ?? 'Unknown Academy';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }

  async countCohortStudents(range) {
    const rows = await prisma.cohortPlacement.findMany({
      where: createdAtWhere(range),
      select: {
        cohort: { select: { name: true } },
      },
    });

    const counts = new Map();
    for (const row of rows) {
      const name = row.cohort?.name ?? 'Unknown Cohort';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }

  async countRylsRegistrationsByDay(range) {
    const rows = await prisma.rylsRegistration.findMany({
      where: createdAtWhere(range),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return this.countByDate(rows);
  }

  sumByDate(rows, valueKey) {
    const totals = new Map();
    for (const row of rows) {
      const date = row.created_at.toISOString().split('T')[0];
      totals.set(date, (totals.get(date) ?? 0) + (row[valueKey] ?? 0));
    }

    return [...totals.entries()].map(([date, value]) => ({ date, value }));
  }

  countByDate(rows) {
    const totals = new Map();
    for (const row of rows) {
      const date = row.created_at.toISOString().split('T')[0];
      totals.set(date, (totals.get(date) ?? 0) + 1);
    }

    return [...totals.entries()].map(([date, value]) => ({ date, value }));
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();
export { ACADEMY_PRODUCT_TYPES, RYLS_PRODUCT_TYPES };
