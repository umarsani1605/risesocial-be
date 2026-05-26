import { beforeEach, describe, expect, it, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../../../src/middleware/auth.js', () => ({
  adminMiddleware: async () => {},
}));

vi.mock('../../../../src/middleware/permissionMiddleware.js', () => ({
  requirePermission: vi.fn(() => async () => {}),
}));

vi.mock('../../../../src/controllers/admin/placementController.js', () => ({
  adminPlacementController: {
    listEnrollments: vi.fn(async (_request, reply) => reply.send({ success: true, data: [] })),
    getEnrollmentDetail: vi.fn(async (_request, reply) => reply.send({ success: true, data: {} })),
    assignToCohort: vi.fn(async (_request, reply) => reply.send({ success: true, data: {} })),
    dropPlacement: vi.fn(async (_request, reply) => reply.send({ success: true, data: {} })),
  },
}));

describe('admin placement routes', () => {
  let requirePermission;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    requirePermission = (await import('../../../../src/middleware/permissionMiddleware.js')).requirePermission;
  });

  it('protects academy enrollment reads with cohort viewer permission', async () => {
    const app = Fastify({ logger: false });
    const { default: placementRoutes } = await import('../../../../src/routes/admin/placementRoutes.js');
    await app.register(placementRoutes, { prefix: '/admin/academy-enrollments' });
    await app.ready();

    await app.inject({ method: 'GET', url: '/admin/academy-enrollments' });
    await app.inject({ method: 'GET', url: '/admin/academy-enrollments/1' });

    expect(requirePermission).toHaveBeenCalledWith('admin.cohort');
    await app.close();
  });

  it('protects student assignment changes with cohort editor permission', async () => {
    const app = Fastify({ logger: false });
    const { default: placementRoutes } = await import('../../../../src/routes/admin/placementRoutes.js');
    const { default: cohortPlacementRoutes } = await import('../../../../src/routes/admin/cohortPlacementRoutes.js');
    await app.register(placementRoutes, { prefix: '/admin/academy-enrollments' });
    await app.register(cohortPlacementRoutes, { prefix: '/admin/cohort-placements' });
    await app.ready();

    await app.inject({
      method: 'POST',
      url: '/admin/academy-enrollments/1/assign',
      payload: { cohort_id: 1 },
    });
    await app.inject({ method: 'POST', url: '/admin/cohort-placements/1/drop' });

    expect(requirePermission).toHaveBeenCalledWith('admin.cohort', 'EDITOR');
    await app.close();
  });
});
