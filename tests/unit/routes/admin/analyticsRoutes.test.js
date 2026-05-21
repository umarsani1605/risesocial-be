import { beforeEach, describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';

const permissionHandlers = new Map();

vi.mock('../../../../src/middleware/auth.js', () => ({
  adminMiddleware: async () => {},
}));

vi.mock('../../../../src/middleware/permissionMiddleware.js', () => ({
  requirePermission: vi.fn((key) => {
    const handler = async () => {};
    permissionHandlers.set(key, handler);
    return handler;
  }),
}));

vi.mock('../../../../src/controllers/admin/analyticsController.js', () => ({
  adminAnalyticsController: {
    getOverview: vi.fn(async (_request, reply) => reply.send({ success: true, data: { totalRevenue: 0 } })),
    getRevenueTrend: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getPaymentStatusBreakdown: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getRevenueByType: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getUserRegistrationsTrend: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getUserDistribution: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getAcademyEnrollments: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getCohortStudents: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getProgramSummary: vi.fn(async (_request, reply) => reply.send({ success: true, data: {} })),
    getProgramTrend: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getProgramDemographics: vi.fn(async (_request, reply) => reply.send({ success: true, data: {} })),
  },
}));

describe('admin analytics routes', () => {
  let app;
  let requirePermission;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    permissionHandlers.clear();

    app = Fastify({ logger: false });
    const permissionModule = await import('../../../../src/middleware/permissionMiddleware.js');
    requirePermission = permissionModule.requirePermission;
    const { default: analyticsRoutes } = await import('../../../../src/routes/admin/analyticsRoutes.js');
    await app.register(analyticsRoutes, { prefix: '/admin/analytics' });
    await app.ready();
  });

  it('registers overview under /admin/analytics with dashboard permission', async () => {
    const response = await app.inject({ method: 'GET', url: '/admin/analytics/overview' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ success: true, data: { totalRevenue: 0 } });
    expect(requirePermission).toHaveBeenCalledWith('admin.dashboard');
  });

  it('registers analytics pages with matching domain permissions', async () => {
    await app.inject({ method: 'GET', url: '/admin/analytics/revenue/trend' });
    await app.inject({ method: 'GET', url: '/admin/analytics/users/registrations-trend' });
    await app.inject({ method: 'GET', url: '/admin/analytics/academies/enrollments' });
    await app.inject({ method: 'GET', url: '/admin/analytics/programs/summary' });

    expect(requirePermission).toHaveBeenCalledWith('admin.transactions');
    expect(requirePermission).toHaveBeenCalledWith('admin.users');
    expect(requirePermission).toHaveBeenCalledWith('admin.academy');
    expect(requirePermission).toHaveBeenCalledWith('admin.ryls');
  });
});
