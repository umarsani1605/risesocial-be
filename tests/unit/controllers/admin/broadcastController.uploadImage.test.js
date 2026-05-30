/**
 * AdminBroadcastController.uploadImage unit tests.
 * The upload middleware (mime/size validation) is exercised separately; here we
 * verify the controller returns the absolute URL and guards a missing file.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpload = vi.fn();

vi.mock('../../../../src/services/admin/broadcastService.js', () => ({ adminBroadcastService: {} }));
vi.mock('../../../../src/integrations/brevoClient.js', () => ({ getSenders: vi.fn() }));
vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: { upload: mockUpload },
}));

const { adminBroadcastController } = await import('../../../../src/controllers/admin/broadcastController.js');

function makeReply() {
  const reply = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(payload) {
      this.payload = payload;
      return this;
    },
  };
  return reply;
}

describe('AdminBroadcastController.uploadImage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when no file is attached', async () => {
    const reply = makeReply();
    await adminBroadcastController.uploadImage({ uploadedFile: null }, reply);
    expect(reply.statusCode).toBe(400);
    expect(reply.payload.success).toBe(false);
  });

  it('returns the absolute public URL on success', async () => {
    mockUpload.mockResolvedValue({ publicUrl: 'http://localhost:8000/uploads/images/broadcasts/x.png' });
    const reply = makeReply();
    const request = {
      uploadedFile: { buffer: Buffer.from('x'), originalName: 'x.png', mimeType: 'image/png', size: 1, uploadType: 'broadcast_image' },
    };

    await adminBroadcastController.uploadImage(request, reply);

    expect(mockUpload).toHaveBeenCalledWith(request.uploadedFile);
    expect(reply.payload.success).toBe(true);
    expect(reply.payload.data.url).toBe('http://localhost:8000/uploads/images/broadcasts/x.png');
  });
});
