import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRepository = {
  sumPaidRevenue: vi.fn(),
  countPaidTransactionsByStatus: vi.fn(),
  sumPaidRevenueByProductType: vi.fn(),
  countUsers: vi.fn(),
  countActiveCohorts: vi.fn(),
  countRylsRegistrations: vi.fn(),
  sumPaidRevenueByDay: vi.fn(),
  countUsersByDay: vi.fn(),
  countAcademyEnrollmentsByAcademy: vi.fn(),
  countCohortStudents: vi.fn(),
};

const { AdminAnalyticsService } = await import('../../../../src/services/admin/analyticsService.js');

describe('AdminAnalyticsService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminAnalyticsService(mockRepository);
  });

  it('builds overview with real aggregates and filled 30-day series', async () => {
    mockRepository.sumPaidRevenue
      .mockResolvedValueOnce(1_500_000)
      .mockResolvedValueOnce(300_000)
      .mockResolvedValueOnce(150_000);
    mockRepository.countUsers
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(4);
    mockRepository.countActiveCohorts.mockResolvedValue(3);
    mockRepository.countRylsRegistrations
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(0);
    mockRepository.sumPaidRevenueByDay.mockResolvedValue([{ date: '2026-05-21', value: 500_000 }]);
    mockRepository.countUsersByDay.mockResolvedValue([{ date: '2026-05-21', value: 2 }]);

    const result = await service.getOverview({ now: new Date('2026-05-21T12:00:00Z') });

    expect(result).toMatchObject({
      totalRevenue: 1_500_000,
      totalRevenueTrend: 100,
      totalUsers: 42,
      totalUsersTrend: 100,
      activeCohorts: 3,
      activeCohortsTrend: 0,
      rylsRegistrations: 10,
      rylsRegistrationsTrend: 100,
    });
    expect(result.revenueTrend).toHaveLength(30);
    expect(result.usersTrend).toHaveLength(30);
    expect(result.revenueTrend.at(-1)).toEqual({ date: '2026-05-21', value: 500_000 });
    expect(result.usersTrend.at(-1)).toEqual({ date: '2026-05-21', value: 2 });
  });

  it('returns zero trend when previous and current values are zero', () => {
    expect(service.calculateTrend(0, 0)).toBe(0);
  });

  it('returns 100 trend when previous is zero and current has value', () => {
    expect(service.calculateTrend(7, 0)).toBe(100);
  });

  it('returns rounded percentage trend for normal comparison', () => {
    expect(service.calculateTrend(125, 100)).toBe(25);
    expect(service.calculateTrend(80, 100)).toBe(-20);
  });

  it('returns revenue analytics using paid transactions only', async () => {
    mockRepository.sumPaidRevenueByDay.mockResolvedValue([{ date: '2026-05-20', value: 250_000 }]);
    mockRepository.countPaidTransactionsByStatus.mockResolvedValue([
      { name: 'Paid', value: 3 },
      { name: 'Pending', value: 2 },
    ]);
    mockRepository.sumPaidRevenueByProductType.mockResolvedValue([{ name: 'Academy', value: 250_000 }]);

    await expect(service.getRevenueTrend({ period: '7d', now: new Date('2026-05-21T12:00:00Z') }))
      .resolves.toContainEqual({ date: '2026-05-20', value: 250_000 });
    await expect(service.getPaymentStatusBreakdown({ period: '7d', now: new Date('2026-05-21T12:00:00Z') }))
      .resolves.toEqual([
        { name: 'Paid', value: 3, color: '#22c55e' },
        { name: 'Pending', value: 2, color: '#f59e0b' },
        { name: 'Expired', value: 0, color: '#ef4444' },
        { name: 'Failed', value: 0, color: '#ef4444' },
        { name: 'Cancelled', value: 0, color: '#737373' },
        { name: 'Refunded', value: 0, color: '#3b82f6' },
      ]);
    await expect(service.getRevenueByType({ period: '7d', now: new Date('2026-05-21T12:00:00Z') }))
      .resolves.toEqual([{ name: 'Academy', value: 250_000, color: '#1bb1a0' }]);
  });
});
