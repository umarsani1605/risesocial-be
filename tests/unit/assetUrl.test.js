import { describe, it, expect, beforeEach } from 'vitest';
import { buildAssetUrl } from '../../src/utils/assetUrl.js';

describe('buildAssetUrl', () => {
  beforeEach(() => {
    process.env.R2_PUBLIC_BASE = 'https://assets.risesocial.org';
    process.env.BACKEND_URL = 'http://backend.local';
    process.env.R2_CUTOVER_AT = '2026-05-18T00:00:00Z';
  });

  it('returns null for null/empty path', () => {
    expect(buildAssetUrl(null, new Date())).toBeNull();
    expect(buildAssetUrl('', new Date())).toBeNull();
    expect(buildAssetUrl(undefined, new Date())).toBeNull();
  });

  it('returns full URL as-is when path already has http scheme (legacy)', () => {
    expect(buildAssetUrl('http://old.example/foo.png', new Date())).toBe('http://old.example/foo.png');
    expect(buildAssetUrl('https://old.example/foo.png', new Date())).toBe('https://old.example/foo.png');
  });

  it('builds R2 URL when createdAt >= cutoff', () => {
    const after = new Date('2026-05-19T00:00:00Z');
    expect(buildAssetUrl('academies/images/foo.png', after))
      .toBe('https://assets.risesocial.org/academies/images/foo.png');
  });

  it('builds R2 URL when createdAt equals cutoff', () => {
    const eq = new Date('2026-05-18T00:00:00Z');
    expect(buildAssetUrl('academies/images/foo.png', eq))
      .toBe('https://assets.risesocial.org/academies/images/foo.png');
  });

  it('builds backend URL when createdAt < cutoff', () => {
    const before = new Date('2026-05-17T23:59:59Z');
    expect(buildAssetUrl('academies/images/foo.png', before))
      .toBe('http://backend.local/uploads/academies/images/foo.png');
  });

  it('builds backend URL when createdAt is null/missing', () => {
    expect(buildAssetUrl('academies/images/foo.png', null))
      .toBe('http://backend.local/uploads/academies/images/foo.png');
  });

  it('handles leading slash in path', () => {
    const after = new Date('2026-05-19T00:00:00Z');
    expect(buildAssetUrl('/academies/images/foo.png', after))
      .toBe('https://assets.risesocial.org/academies/images/foo.png');
  });
});
