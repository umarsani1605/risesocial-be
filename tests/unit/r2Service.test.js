import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { R2Service } from '../../src/services/shared/r2Service.js';

const s3Mock = mockClient(S3Client);

describe('R2Service', () => {
  let service;

  beforeEach(() => {
    s3Mock.reset();
    process.env.R2_ACCOUNT_ID = 'test-account';
    process.env.R2_ACCESS_KEY_ID = 'test-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
    process.env.R2_BUCKET = 'test-bucket';
    service = new R2Service();
  });

  describe('putObject', () => {
    it('sends PutObjectCommand with correct params', async () => {
      s3Mock.on(PutObjectCommand).resolves({});
      const buffer = Buffer.from('hello');
      await service.putObject('avatars/foo.png', buffer, 'image/png');
      const calls = s3Mock.commandCalls(PutObjectCommand);
      expect(calls).toHaveLength(1);
      expect(calls[0].args[0].input).toMatchObject({
        Bucket: 'test-bucket',
        Key: 'avatars/foo.png',
        Body: buffer,
        ContentType: 'image/png',
      });
    });

    it('throws when R2 rejects', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('R2 down'));
      await expect(
        service.putObject('avatars/foo.png', Buffer.from('x'), 'image/png')
      ).rejects.toThrow('R2 down');
    });
  });

  describe('deleteObject', () => {
    it('sends DeleteObjectCommand with correct key', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});
      await service.deleteObject('avatars/foo.png');
      const calls = s3Mock.commandCalls(DeleteObjectCommand);
      expect(calls).toHaveLength(1);
      expect(calls[0].args[0].input).toMatchObject({
        Bucket: 'test-bucket',
        Key: 'avatars/foo.png',
      });
    });

    it('returns false (best-effort) on failure without throwing', async () => {
      s3Mock.on(DeleteObjectCommand).rejects(new Error('not found'));
      const result = await service.deleteObject('missing.png');
      expect(result).toBe(false);
    });

    it('returns true on success', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});
      const result = await service.deleteObject('avatars/foo.png');
      expect(result).toBe(true);
    });
  });
});
