import { adminAnalyticsRepository } from '../../repositories/admin/analyticsRepository.js';
import { rylsRegistrationService } from '../user/rylsRegistrationService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const PAYMENT_STATUS_META = [
  ['paid', 'Paid', '#22c55e'],
  ['pending', 'Pending', '#f59e0b'],
  ['expired', 'Expired', '#ef4444'],
  ['failed', 'Failed', '#ef4444'],
  ['cancelled', 'Cancelled', '#737373'],
  ['refunded', 'Refunded', '#3b82f6'],
];

const CATEGORY_COLORS = ['#1bb1a0', '#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#64748b'];

const PRODUCT_TYPE_LABELS = {
  academy_enrollment: 'Academy',
  RYLS: 'RYLS',
  'Rise Young Leaders Scholarship': 'RYLS',
  ryls_registration: 'RYLS',
};

function startOfDay(date) {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setUTCHours(23, 59, 59, 999);
  return next;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function yearRange(year) {
  return {
    start: startOfDay(new Date(Date.UTC(year, 0, 1))),
    end: endOfDay(new Date(Date.UTC(year, 11, 31))),
  };
}

export class AdminAnalyticsService {
  constructor(repository = adminAnalyticsRepository, programsService = rylsRegistrationService) {
    this.repository = repository;
    this.programsService = programsService;
  }

  async getOverview({ now = new Date() } = {}) {
    const rylsYearRange = yearRange(2026);
    const chartRange = this.lastDaysRange(30, now);

    const [
      totalRevenue,
      totalUsers,
      activeAcademies,
      rylsRegistrations,
      revenueTrendRows,
      rylsTrendRows,
    ] = await Promise.all([
      this.repository.sumPaidRevenue(chartRange),
      this.repository.countUsers(),
      this.repository.countActiveAcademies(),
      this.repository.countRylsRegistrations(rylsYearRange),
      this.repository.sumPaidRevenueByDay(chartRange),
      this.repository.countRylsRegistrationsByDay(chartRange),
    ]);

    return {
      totalRevenue,
      totalUsers,
      activeAcademies,
      rylsRegistrations,
      revenueTrend: this.fillDateSeries(revenueTrendRows, chartRange),
      rylsTrend: this.fillDateSeries(rylsTrendRows, chartRange),
    };
  }

  async getRevenueTrend(options = {}) {
    const range = this.resolveDateRange(options);
    return this.fillDateSeries(await this.repository.sumPaidRevenueByDay(range), range);
  }

  async getPaymentStatusBreakdown(options = {}) {
    const range = this.resolveDateRange(options);
    const rows = await this.repository.countPaidTransactionsByStatus(range);
    const counts = new Map(rows.map((row) => [String(row.name).toLowerCase(), row.value]));

    return PAYMENT_STATUS_META.map(([status, name, color]) => ({
      name,
      value: counts.get(status) ?? 0,
      color,
    }));
  }

  async getRevenueByType(options = {}) {
    const range = this.resolveDateRange(options);
    const rows = await this.repository.sumPaidRevenueByProductType(range);
    const totals = new Map();

    for (const row of rows) {
      const name = PRODUCT_TYPE_LABELS[row.name] ?? row.name;
      totals.set(name, (totals.get(name) ?? 0) + row.value);
    }

    return [...totals.entries()].map(([name, value], index) => ({
      name,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }

  async getUserRegistrationsTrend(options = {}) {
    const range = this.resolveDateRange(options);
    return this.fillDateSeries(await this.repository.countUsersByDay(range), range);
  }

  async getUserDistribution(options = {}) {
    const range = this.resolveDateRange(options);
    return this.withColors(await this.repository.countAcademyEnrollmentsByAcademy(range));
  }

  async getAcademyEnrollments(options = {}) {
    const range = this.resolveDateRange(options);
    return this.withColors(await this.repository.countAcademyEnrollmentsByAcademy(range));
  }

  async getCohortStudents(options = {}) {
    const range = this.resolveDateRange(options);
    return this.withColors(await this.repository.countCohortStudents(range));
  }

  async getProgramSummary(options = {}) {
    return this.programsService.getAnalyticsSummary(options);
  }

  async getProgramTrend(options = {}) {
    return this.programsService.getAnalyticsTrend(options);
  }

  async getProgramDemographics(options = {}) {
    return this.programsService.getAnalyticsDemographics(options);
  }

  calculateTrend(current, previous) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  resolveDateRange({ period = '30d', startDate, endDate, now = new Date() } = {}) {
    if (period === 'custom' || (startDate && endDate)) {
      return {
        start: startOfDay(new Date(startDate)),
        end: endOfDay(new Date(endDate)),
      };
    }

    const dayMap = {
      '7d': 7,
      '30d': 30,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      today: 1,
    };

    if (period === 'all-time') return {};
    if (period === 'yesterday') {
      const yesterday = addDays(startOfDay(now), -1);
      return { start: yesterday, end: endOfDay(yesterday) };
    }

    return this.lastDaysRange(dayMap[period] ?? 30, now);
  }

  lastDaysRange(days, now = new Date()) {
    const end = endOfDay(now);
    return {
      start: startOfDay(addDays(end, -(days - 1))),
      end,
    };
  }

  fillDateSeries(rows, range) {
    if (!range?.start || !range?.end) return rows;

    const totals = new Map(rows.map((row) => [row.date, row.value]));
    const points = [];
    let cursor = startOfDay(range.start);
    const end = startOfDay(range.end);

    while (cursor <= end) {
      const date = cursor.toISOString().split('T')[0];
      points.push({ date, value: totals.get(date) ?? 0 });
      cursor = addDays(cursor, 1);
    }

    return points;
  }

  withColors(rows) {
    return rows.map((row, index) => ({
      ...row,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
