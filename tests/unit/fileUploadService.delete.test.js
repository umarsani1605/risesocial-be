import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Mock = mockClient(S3Client);

vi.mock('../../src/repositories/shared/fileUploadRepository.js', () => ({
  fileUploadRepository: {},
}));
vi.mock('../../src/config/posthog.js', () => ({ captureEvent: vi.fn() }));

import { FileUploadService } from '../../src/services/shared/fileUploadService.js';

describe('FileUploadService.deleteByPath', () => {
  let service;

  beforeEach(() => {
    s3Mock.reset();
    process.env.R2_ACCOUNT_ID = 'a';
    process.env.R2_ACCESS_KEY_ID = 'k';
    process.env.R2_SECRET_ACCESS_KEY = 's';
    process.env.R2_BUCKET = 'b';
    process.env.R2_CUTOVER_AT = '2026-05-18T00:00:00Z';
    service = new FileUploadService();
  });

  it('skips delete when createdAt is before cutoff (legacy disk file)', async () => {
    const before = new Date('2026-05-17T00:00:00Z');
    const result = await service.deleteByPath('users/avatars/x.png', before);
    expect(result).toBe(false);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });

  it('deletes from R2 when createdAt is after cutoff', async () => {
    s3Mock.on(DeleteObjectCommand).resolves({});
    const after = new Date('2026-05-19T00:00:00Z');
    const result = await service.deleteByPath('users/avatars/x.png', after);
    expect(result).toBe(true);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(1);
  });

  it('returns false (no throw) when R2 delete fails', async () => {
    s3Mock.on(DeleteObjectCommand).rejects(new Error('missing'));
    const after = new Date('2026-05-19T00:00:00Z');
    const result = await service.deleteByPath('users/avatars/x.png', after);
    expect(result).toBe(false);
  });

  it('returns false when path is null/empty', async () => {
    expect(await service.deleteByPath(null, new Date())).toBe(false);
    expect(await service.deleteByPath('', new Date())).toBe(false);
  });

  it('skips delete when path is full URL (legacy http://)', async () => {
    const after = new Date('2026-05-19T00:00:00Z');
    const result = await service.deleteByPath('http://old/uploads/x.png', after);
    expect(result).toBe(false);
    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });
});
