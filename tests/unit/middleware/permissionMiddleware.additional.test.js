/**
 * Additional Unit Tests: permissionMiddleware (requirePermission)
 * Covers edge cases and scenarios not in permissionMiddleware.test.js:
 * - USER role (not ADMIN, not SUPERADMIN)
 * - EDITOR access level grants VIEWER access
 * - Same permission key with different required levels
 * - DB error propagation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindUnique = vi.fn();

vi.mock('../../../src/config/database.js', () => ({
  default: {
    userAdminPermission: {
      findUnique: mockFindUnique,
    },
  },
}));

const { requirePermission } = await import('../../../src/middleware/permissionMiddleware.js');

function makeRequest(role, userId = 1) {
  return { user: { id: userId, role } };
}

function makeReply() {
  const reply = { _status: null, _body: null };
  reply.status = (code) => { reply._status = code; return reply; };
  reply.send = (body) => { reply._body = body; return reply; };
  return reply;
}

describe('requirePermission middleware — additional edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('USER role with no permission record gets 403', async () => {
    mockFindUnique.mockResolvedValue(null);
    const fn = requirePermission('admin.cohorts');
    const req = makeRequest('USER', 99);
    const reply = makeReply();

    await fn(req, reply);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { user_id_permission_key: { user_id: 99, permission_key: 'admin.cohorts' } },
    });
    expect(reply._status).toBe(403);
  });

  it('USER role with a permission record for a different key still gets 403 for unchecked key', async () => {
    // The user has permission for 'admin.jobs' but we are checking 'admin.cohorts'
    mockFindUnique.mockResolvedValue(null); // no record for admin.cohorts
    const fn = requirePermission('admin.cohorts');
    const req = makeRequest('USER', 99);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBe(403);
  });

  it('ADMIN with EDITOR permission satisfies VIEWER requirement (EDITOR >= VIEWER)', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'EDITOR' });
    const fn = requirePermission('admin.academy', 'VIEWER');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    // EDITOR has more than VIEWER — should pass
    expect(reply._status).toBeNull();
  });

  it('SUPERADMIN always bypasses even when DB would return null', async () => {
    // Should not even call DB
    const fn = requirePermission('admin.users', 'EDITOR');
    const req = makeRequest('SUPERADMIN', 1);
    const reply = makeReply();

    await fn(req, reply);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(reply._status).toBeNull();
  });

  it('returns 403 with correct message when no permission record found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const fn = requirePermission('admin.transactions');
    const req = makeRequest('ADMIN', 7);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBe(403);
    expect(reply._body).toBeDefined();
    expect(reply._body.message).toMatch(/no permission/i);
  });

  it('returns 403 with read-only message when VIEWER tries EDITOR action', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'VIEWER' });
    const fn = requirePermission('admin.cohorts', 'EDITOR');
    const req = makeRequest('ADMIN', 10);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBe(403);
    expect(reply._body.message).toMatch(/read-only/i);
  });

  it('queries DB with correct composite key', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'VIEWER' });
    const fn = requirePermission('admin.ryls', 'VIEWER');
    const req = makeRequest('ADMIN', 42);
    const reply = makeReply();

    await fn(req, reply);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        user_id_permission_key: {
          user_id: 42,
          permission_key: 'admin.ryls',
        },
      },
    });
  });

  it('propagates DB errors (does not silently swallow)', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB connection lost'));
    const fn = requirePermission('admin.academy');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await expect(fn(req, reply)).rejects.toThrow('DB connection lost');
  });

  it('middleware returns a function (factory pattern)', () => {
    const fn = requirePermission('admin.academy');
    expect(typeof fn).toBe('function');
  });

  it('ADMIN with EDITOR permission on exact EDITOR requirement passes', async () => {
    mockFindUnique.mockResolvedValue({ access_level: 'EDITOR' });
    const fn = requirePermission('admin.academy', 'EDITOR');
    const req = makeRequest('ADMIN', 5);
    const reply = makeReply();

    await fn(req, reply);

    expect(reply._status).toBeNull();
  });
});