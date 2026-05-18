import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Mock = mockClient(S3Client);

vi.mock('../../src/repositories/shared/fileUploadRepository.js', () => ({
  fileUploadRepository: { createFileUpload: vi.fn() },
}));

vi.mock('../../src/config/posthog.js', () => ({ captureEvent: vi.fn() }));

import { fileUploadRepository } from '../../src/repositories/shared/fileUploadRepository.js';
import { FileUploadService } from '../../src/services/shared/fileUploadService.js';

describe('FileUploadService.upload (R2)', () => {
  let service;

  beforeEach(() => {
    s3Mock.reset();
    vi.clearAllMocks();
    process.env.R2_ACCOUNT_ID = 'a';
    process.env.R2_ACCESS_KEY_ID = 'k';
    process.env.R2_SECRET_ACCESS_KEY = 's';
    process.env.R2_BUCKET = 'b';
    process.env.R2_PUBLIC_BASE = 'https://assets.risesocial.org';
    service = new FileUploadService();
  });

  const file = (overrides = {}) => ({
    buffer: Buffer.from('hello'),
    originalName: 'My Cover Image.png',
    mimeType: 'image/png',
    size: 5,
    uploadType: 'academy_image',
    ...overrides,
  });

  it('uploads to R2 and creates DB record with relative path', async () => {
    s3Mock.on(PutObjectCommand).resolves({});
    fileUploadRepository.createFileUpload.mockResolvedValue({
      id: 1, original_name: 'My Cover Image.png', file_path: 'academies/images/x.png',
      file_size: 5, mime_type: 'image/png', upload_type: 'academy_image',
    });

    const result = await service.upload(file());

    const puts = s3Mock.commandCalls(PutObjectCommand);
    expect(puts).toHaveLength(1);
    expect(puts[0].args[0].input.Bucket).toBe('b');
    expect(puts[0].args[0].input.Key).toMatch(/^academies\/images\/my-cover-image-[a-f0-9-]{36}\.png$/);
    expect(puts[0].args[0].input.ContentType).toBe('image/png');

    expect(fileUploadRepository.createFileUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        originalName: 'My Cover Image.png',
        path: expect.stringMatching(/^academies\/images\/my-cover-image-[a-f0-9-]{36}\.png$/),
        size: 5,
        mimeType: 'image/png',
        uploadType: 'academy_image',
      })
    );

    expect(result.publicUrl).toMatch(/^https:\/\/assets\.risesocial\.org\/academies\/images\/my-cover-image-[a-f0-9-]{36}\.png$/);
    expect(result.relativePath).toMatch(/^academies\/images\//);
  });

  it('throws when uploadType is unknown', async () => {
    await expect(service.upload(file({ uploadType: 'bogus' }))).rejects.toThrow(/Unknown upload type/);
  });

  it('rolls back R2 object when DB insert fails', async () => {
    s3Mock.on(PutObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});
    fileUploadRepository.createFileUpload.mockRejectedValue(new Error('DB down'));

    await expect(service.upload(file())).rejects.toThrow('DB down');

    const deletes = s3Mock.commandCalls(DeleteObjectCommand);
    expect(deletes).toHaveLength(1);
  });

  it('does not insert DB record when R2 upload fails', async () => {
    s3Mock.on(PutObjectCommand).rejects(new Error('R2 down'));
    await expect(service.upload(file())).rejects.toThrow('R2 down');
    expect(fileUploadRepository.createFileUpload).not.toHaveBeenCalled();
  });
});
