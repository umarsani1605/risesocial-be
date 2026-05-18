# Cloudflare R2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrasi semua user-uploaded asset (avatar, image, attachment, PDF) dari local disk ke Cloudflare R2 dengan strategi dual storage — file lama tetap accessible via disk, file baru disimpan & di-serve dari `assets.risesocial.org`.

**Architecture:** Backend proxy upload (frontend tidak berubah). `fileUploadService.upload()` write ke R2 via `@aws-sdk/client-s3` v3, DB simpan relative path. URL builder generate full URL on-read: kalau value sudah full URL (legacy) → return as-is; kalau relative path → cek cutoff timestamp untuk pilih R2 vs backend disk. Cleanup file lama best-effort dengan cutoff guard.

**Tech Stack:** Node.js + Fastify 5, Prisma 6, `@aws-sdk/client-s3` v3, `uuid`, Vitest, `aws-sdk-client-mock`.

**Spec reference:** `backend/docs/superpowers/specs/2026-05-18-cloudflare-r2-migration-design.md`

---

## File Structure

**Create:**
- `src/services/shared/r2Service.js` — thin S3Client wrapper (singleton)
- `src/utils/assetUrl.js` — URL builder (format-aware + cutoff)
- `tests/unit/r2Service.test.js` — unit tests dengan aws-sdk-client-mock
- `tests/unit/assetUrl.test.js` — unit tests untuk URL builder

**Modify:**
- `src/services/shared/fileUploadService.js` — `upload()` write ke R2; tambah `delete(relativePath, createdAt)`
- `src/services/admin/academyService.js` — simpan relativePath (bukan publicUrl); transform on read
- `src/services/admin/cohortService.js` — mentor avatar simpan relativePath; certificate flow → /tmp → R2
- `src/services/shared/userService.js` — avatar simpan relativePath; transform on read
- `src/controllers/user/cohortController.js` — certificate download = 302 redirect ke R2 URL
- `src/repositories/shared/fileUploadRepository.js` — kalau perlu return record dengan transformed URL helper
- `package.json` — tambah `@aws-sdk/client-s3`, `aws-sdk-client-mock`, `uuid`
- `.env.example` — dokumentasi env vars R2

**Frontend cleanup (modify):**
- `frontend-v2/app/composables/useImageUpload.ts` — pakai URL dari API response
- `frontend-v2/app/components/admin/academy/FormBasicInfo.vue` — sda
- `frontend-v2/app/components/admin/academy/TestimonialModal.vue` — sda
- `frontend-v2/app/components/admin/academy/InstructorModal.vue` — sda
- `frontend-v2/app/components/admin/cohort/InviteMentorModal.vue` — sda
- `frontend-v2/app/components/admin/cohort/ModuleModal.vue` — sda
- `frontend-v2/app/components/admin/user/UserDetailSlideover.vue` — sda
- `frontend/components/academies/TestimonialDialog.vue` — sda
- `frontend/components/academies/InstructorDialog.vue` — sda

---

## Task 1: Install Dependencies & Env Vars

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/.env.example`

- [ ] **Step 1: Install runtime & dev dependencies**

```bash
cd backend
pnpm add @aws-sdk/client-s3 uuid
pnpm add -D aws-sdk-client-mock
```

Expected: dependencies added ke `package.json`.

- [ ] **Step 2: Tambah env vars ke `.env.example`**

Append ke `backend/.env.example`:

```
# Cloudflare R2 (object storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=rise-assets
R2_PUBLIC_BASE=https://assets.risesocial.org
R2_CUTOVER_AT=2026-05-18T00:00:00Z
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml .env.example
git commit -m "chore(deps): add @aws-sdk/client-s3 and uuid for R2 storage"
```

---

## Task 2: Build `r2Service` (TDD)

**Files:**
- Create: `backend/src/services/shared/r2Service.js`
- Test: `backend/tests/unit/r2Service.test.js`

- [ ] **Step 1: Write failing test for `putObject`**

Create `backend/tests/unit/r2Service.test.js`:

```js
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
```

- [ ] **Step 2: Run test, verify FAIL**

```bash
cd backend && pnpm vitest run tests/unit/r2Service.test.js
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `r2Service.js`**

Create `backend/src/services/shared/r2Service.js`:

```js
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getLogger } from '../../config/logger.js';

export class R2Service {
  constructor() {
    this.bucket = process.env.R2_BUCKET;
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  get logger() {
    return getLogger();
  }

  async putObject(key, body, contentType) {
    this.logger.info(`[R2Service] putObject start key=${key} size=${body.length}`);
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }));
      this.logger.info(`[R2Service] putObject success key=${key}`);
    } catch (error) {
      this.logger.error({ err: error }, `[R2Service] putObject error key=${key}`);
      throw error;
    }
  }

  async deleteObject(key) {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch (error) {
      this.logger.warn({ err: error }, `[R2Service] deleteObject failed key=${key}`);
      return false;
    }
  }

  async headObject(key) {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

export const r2Service = new R2Service();
```

- [ ] **Step 4: Run test, verify PASS**

```bash
pnpm vitest run tests/unit/r2Service.test.js
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/shared/r2Service.js tests/unit/r2Service.test.js
git commit -m "feat(storage): add R2Service S3-compatible wrapper"
```

---

## Task 3: Build `assetUrl` Utility (TDD)

**Files:**
- Create: `backend/src/utils/assetUrl.js`
- Test: `backend/tests/unit/assetUrl.test.js`

URL builder dengan 3 cabang logic:
1. Value null/empty → null
2. Value sudah full URL (`http://` atau `https://`) → return as-is (legacy data)
3. Value relative path → cek `createdAt` vs `R2_CUTOVER_AT`:
   - `>= cutoff` → `${R2_PUBLIC_BASE}/${path}`
   - `< cutoff` atau no cutoff → `${BACKEND_URL}/uploads/${path}`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/unit/assetUrl.test.js`:

```js
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
```

- [ ] **Step 2: Run test, verify FAIL**

```bash
pnpm vitest run tests/unit/assetUrl.test.js
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `assetUrl.js`**

Create `backend/src/utils/assetUrl.js`:

```js
const HTTP_RE = /^https?:\/\//i;

function getCutoff() {
  const raw = process.env.R2_CUTOVER_AT;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function stripLeadingSlash(s) {
  return s.startsWith('/') ? s.slice(1) : s;
}

/**
 * Build a full asset URL from a stored path value.
 *
 * @param {string|null|undefined} value - stored DB value (relative path OR legacy full URL)
 * @param {Date|string|null} createdAt - record creation timestamp (for cutoff comparison)
 * @returns {string|null}
 */
export function buildAssetUrl(value, createdAt) {
  if (!value) return null;
  if (HTTP_RE.test(value)) return value; // legacy full URL — return as-is

  const relPath = stripLeadingSlash(value);
  const cutoff = getCutoff();
  const created = createdAt ? new Date(createdAt) : null;

  const isR2 = cutoff && created && created.getTime() >= cutoff.getTime();

  if (isR2) {
    const base = (process.env.R2_PUBLIC_BASE || '').replace(/\/$/, '');
    return `${base}/${relPath}`;
  }

  const backend = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');
  return `${backend}/uploads/${relPath}`;
}

/**
 * Transform multiple URL fields in a record in-place.
 *
 * @param {Object} record - prisma record (mutated in place)
 * @param {string[]} fields - field names that contain stored asset paths
 * @param {string} timestampField - field name for createdAt (default: 'created_at')
 * @returns {Object} same record (for chaining)
 */
export function transformAssetUrls(record, fields, timestampField = 'created_at') {
  if (!record) return record;
  const ts = record[timestampField];
  for (const f of fields) {
    if (record[f]) record[f] = buildAssetUrl(record[f], ts);
  }
  return record;
}
```

- [ ] **Step 4: Run test, verify PASS**

```bash
pnpm vitest run tests/unit/assetUrl.test.js
```

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/assetUrl.js tests/unit/assetUrl.test.js
git commit -m "feat(storage): add asset URL builder with cutoff-based dispatch"
```

---

## Task 4: Refactor `fileUploadService.upload()` to use R2 (TDD)

**Files:**
- Modify: `backend/src/services/shared/fileUploadService.js:241-317` (replace `upload()` method)
- Test: `backend/tests/unit/fileUploadService.upload.test.js`

Logic baru:
- Filename = `{slug-of-original}-{uuid}.{ext}` (slug max 60 char, lowercase)
- Key R2 = `{config.storagePath}/{filename}`
- Body = buffer dari middleware
- Atomic: putObject sukses → createFileUpload; createFileUpload gagal → deleteObject (rollback)
- Return field `relativePath` (sama dengan key R2), `publicUrl` = `${R2_PUBLIC_BASE}/{key}`
- DB simpan `relativePath` di field `path`

- [ ] **Step 1: Write failing test**

Create `backend/tests/unit/fileUploadService.upload.test.js`:

```js
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
```

- [ ] **Step 2: Run test, verify FAIL**

```bash
pnpm vitest run tests/unit/fileUploadService.upload.test.js
```

Expected: FAIL (assertions don't match current disk-based implementation).

- [ ] **Step 3: Replace `upload()` method in `fileUploadService.js`**

Edit `backend/src/services/shared/fileUploadService.js`:

(a) Update imports at top — remove `fs-extra` & path-based dirname (keep `path` for extname only), add r2Service + uuid:

```js
import { fileUploadRepository } from '../../repositories/shared/fileUploadRepository.js';
import { UPLOAD_CONFIG } from '../../config/uploadConfig.js';
import { captureEvent } from '../../config/posthog.js';
import { r2Service } from './r2Service.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
```

Remove these lines (no longer needed for `upload()`):

```js
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBaseDir = path.join(__dirname, '../../../uploads');
```

> NOTE: `fs-extra` masih dipakai oleh `processFileUpload`, `deleteFile`, `cleanupOrphanedFiles`, `uploadImage`, `getFileDownloadInfo`. Keep `fs-extra` import. Hapus hanya `fileURLToPath`, `__filename`, `__dirname`, `uploadsBaseDir` jika ternyata `uploadsBaseDir` tidak dipakai method lain (cek `grep uploadsBaseDir` di file ini sebelum hapus).

(b) Replace method `upload(uploadedFile, entityRefs = {})` (line 250–317) dengan:

```js
async upload(uploadedFile, entityRefs = {}) {
  const config = UPLOAD_CONFIG[uploadedFile.uploadType];
  if (!config) {
    const err = new Error(`Unknown upload type: ${uploadedFile.uploadType}`);
    err.statusCode = 400;
    throw err;
  }

  const ext = path.extname(uploadedFile.originalName).toLowerCase();
  const base = path.basename(uploadedFile.originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';
  const filename = `${base}-${uuidv4()}${ext}`;
  const relativePath = `${config.storagePath}/${filename}`;

  await r2Service.putObject(relativePath, uploadedFile.buffer, uploadedFile.mimeType);

  let record;
  try {
    record = await this.fileUploadRepository.createFileUpload({
      originalName: uploadedFile.originalName,
      path: relativePath,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimeType,
      uploadType: uploadedFile.uploadType,
      cohortModuleId: entityRefs.cohortModuleId || null,
      academyId: entityRefs.academyId || null,
    });
  } catch (dbErr) {
    // Rollback: remove R2 object if DB insert fails
    await r2Service.deleteObject(relativePath);
    captureEvent('system', 'upload.failed', {
      endpoint: 'upload',
      upload_type: uploadedFile.uploadType,
      reason: dbErr.message,
      file_size: uploadedFile.size,
    });
    throw dbErr;
  }

  const base_ = (process.env.R2_PUBLIC_BASE || '').replace(/\/$/, '');
  const publicUrl = `${base_}/${relativePath}`;

  return {
    id: record.id,
    originalName: record.original_name,
    relativePath,
    fileSize: record.file_size,
    mimeType: record.mime_type,
    uploadType: record.upload_type,
    publicUrl,
  };
}
```

> NOTE: `absolutePath` di-remove dari return — tidak ada konsep absolutePath di R2.

- [ ] **Step 4: Run test, verify PASS**

```bash
pnpm vitest run tests/unit/fileUploadService.upload.test.js
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run full unit test suite untuk regression check**

```bash
pnpm vitest run tests/unit
```

Expected: semua existing test PASS (tidak ada breakage di `processFileUpload`, `deleteFile`, dll).

- [ ] **Step 6: Commit**

```bash
git add src/services/shared/fileUploadService.js tests/unit/fileUploadService.upload.test.js
git commit -m "feat(storage): write uploads to R2 instead of local disk

- upload() now uses r2Service.putObject with {slug}-{uuid}.{ext} naming
- DB stores relative path; publicUrl built from R2_PUBLIC_BASE
- Atomic rollback: R2 object deleted if DB insert fails"
```

---

## Task 5: Add `fileUploadService.delete()` for Cleanup (TDD)

**Files:**
- Modify: `backend/src/services/shared/fileUploadService.js` (add new method)
- Test: `backend/tests/unit/fileUploadService.delete.test.js`

Method baru `deleteByPath(relativePath, createdAt)`:
- Kalau `createdAt < R2_CUTOVER_AT` → skip (file di disk; jangan touch — biarkan)
- Kalau `createdAt >= cutoff` atau cutoff tidak set → panggil `r2Service.deleteObject(relativePath)`
- Best-effort: return boolean, jangan throw

- [ ] **Step 1: Write failing test**

Create `backend/tests/unit/fileUploadService.delete.test.js`:

```js
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
```

- [ ] **Step 2: Run test, verify FAIL**

```bash
pnpm vitest run tests/unit/fileUploadService.delete.test.js
```

Expected: FAIL (`deleteByPath is not a function`).

- [ ] **Step 3: Add `deleteByPath` method to `fileUploadService.js`**

Append inside `FileUploadService` class (sebelum closing `}`):

```js
/**
 * Best-effort delete a file by its stored relative path.
 * - Skips if path is empty, full URL (legacy), or created before R2_CUTOVER_AT.
 * - Never throws; returns true on R2 delete success, false otherwise.
 */
async deleteByPath(relativePath, createdAt) {
  if (!relativePath) return false;
  if (/^https?:\/\//i.test(relativePath)) return false; // legacy full URL → skip

  const cutoffRaw = process.env.R2_CUTOVER_AT;
  if (cutoffRaw && createdAt) {
    const cutoff = new Date(cutoffRaw);
    const created = new Date(createdAt);
    if (created.getTime() < cutoff.getTime()) return false; // legacy disk file → leave alone
  }

  return r2Service.deleteObject(relativePath);
}
```

Add `r2Service` to imports if not already:

```js
import { r2Service } from './r2Service.js';
```

- [ ] **Step 4: Run test, verify PASS**

```bash
pnpm vitest run tests/unit/fileUploadService.delete.test.js
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/shared/fileUploadService.js tests/unit/fileUploadService.delete.test.js
git commit -m "feat(storage): add deleteByPath with cutoff-aware best-effort cleanup"
```

---

## Task 6: Update Entity Services to Store Relative Path + Transform on Read

**Files:**
- Modify: `backend/src/services/admin/academyService.js`
- Modify: `backend/src/services/shared/userService.js`
- Modify: `backend/src/services/admin/cohortService.js`

Pattern di semua tempat:
1. **On write** (saat ada upload baru): ganti `data.X = uploaded.publicUrl` → `data.X = uploaded.relativePath`
2. **On write replace** (saat update record dengan upload baru): sebelum update, simpan `oldPath`; setelah Prisma commit, panggil `fileUploadService.deleteByPath(oldPath, oldRecord.created_at)` (best-effort)
3. **On read** (saat return record ke controller): panggil `transformAssetUrls(record, ['avatar_url', 'image_url', ...], 'created_at')` sebelum return

### 6a. `academyService.js`

**Field affected:** `academies.image_url`, `academy_instructors.avatar_url`, `academy_testimonials.avatar_url`

- [ ] **Step 1: Audit lokasi `uploaded.publicUrl` di academyService**

```bash
grep -n "uploaded.publicUrl" src/services/admin/academyService.js
```

Expected output (sesuai exploration):
- Line 43 (create academy → image_url)
- Line 78 (update academy → image_url)
- Line 273, 290 (testimonial avatar_url)
- Line 361, 378 (instructor avatar_url)

- [ ] **Step 2: Ganti `uploaded.publicUrl` → `uploaded.relativePath` (6 lokasi)**

Untuk setiap line, edit:

```js
data.image_url = uploaded.publicUrl;
// → menjadi:
data.image_url = uploaded.relativePath;
```

(dan analog untuk `avatar_url`)

- [ ] **Step 3: Tambah cleanup old file pada update flows**

Untuk method update (academy, instructor, testimonial), pattern:

```js
// BEFORE the Prisma update:
const old = await this.academyRepository.findById(id); // atau analog

// ... existing update logic that sets data.image_url = uploaded.relativePath ...

const updated = await this.academyRepository.update(id, data);

// AFTER successful update, cleanup old R2 file (best-effort):
if (uploaded && old?.image_url && old.image_url !== updated.image_url) {
  await this.fileUploadService.deleteByPath(old.image_url, old.updated_at || old.created_at);
}
```

Apply analog untuk instructor (`avatar_url`) dan testimonial (`avatar_url`). Pastikan `fileUploadService` sudah di-inject di constructor.

- [ ] **Step 4: Tambah transform on read**

Di method yang return academy/instructor/testimonial ke controller (mis. `findById`, `findAll`), import `transformAssetUrls`:

```js
import { transformAssetUrls } from '../../utils/assetUrl.js';
```

Wrap return values:

```js
// Academy single
return transformAssetUrls(academy, ['image_url']);

// Academy with relations (instructors, testimonials)
if (academy?.instructors) {
  academy.instructors = academy.instructors.map(i => transformAssetUrls(i, ['avatar_url']));
}
if (academy?.testimonials) {
  academy.testimonials = academy.testimonials.map(t => transformAssetUrls(t, ['avatar_url']));
}
return transformAssetUrls(academy, ['image_url']);

// List
return academies.map(a => transformAssetUrls(a, ['image_url']));
```

Lakukan untuk semua method yang return academy/instructor/testimonial.

- [ ] **Step 5: Sanity check — boot backend & curl endpoint**

```bash
pnpm dev &
SERVER_PID=$!
sleep 3
curl -s http://localhost:8000/api/academies | jq '.data[0] | {id, image_url}'
kill $SERVER_PID
```

Expected: `image_url` di response berupa full URL (`https://...` atau `http://backend.../uploads/...`), bukan relative path.

- [ ] **Step 6: Commit**

```bash
git add src/services/admin/academyService.js
git commit -m "refactor(academy): store relative path, transform asset URLs on read"
```

### 6b. `userService.js`

**Field affected:** `users.avatar`

- [ ] **Step 1: Audit & replace `publicUrl` lokasi**

```bash
grep -n "publicUrl\|generatePublicFileUrl" src/services/shared/userService.js
```

Expected: line 140–141 dan 333–334 (`updateData.avatar = publicUrl`).

- [ ] **Step 2: Replace dengan `relativePath`**

Pattern lama:

```js
const publicUrl = this.fileUploadService.generatePublicFileUrl(updateData.avatarFile);
updateData.avatar = publicUrl;
```

Pastikan upload flow di-route via `fileUploadService.upload()` (yang sekarang return `relativePath`). Kalau ada upload via `processFileUpload` (legacy), refactor untuk pakai `upload()`. Kalau `avatarFile` adalah hasil middleware multipart, panggil:

```js
const uploaded = await this.fileUploadService.upload(updateData.avatarFile);
updateData.avatar = uploaded.relativePath;
```

- [ ] **Step 3: Tambah cleanup old avatar saat ganti**

```js
const oldUser = await this.userRepository.findById(userId);
// ... upload + set updateData.avatar = uploaded.relativePath ...
const updated = await this.userRepository.update(userId, updateData);
if (uploaded && oldUser?.avatar && oldUser.avatar !== updated.avatar) {
  await this.fileUploadService.deleteByPath(oldUser.avatar, oldUser.updated_at || oldUser.created_at);
}
```

- [ ] **Step 4: Tambah transform on read**

Import `transformAssetUrls` & wrap return:

```js
return transformAssetUrls(user, ['avatar']);
// untuk list:
return users.map(u => transformAssetUrls(u, ['avatar']));
```

- [ ] **Step 5: Sanity check**

```bash
pnpm dev &
sleep 3
# GET your own profile (need auth — use existing token)
curl -s http://localhost:8000/api/users/me -H "Authorization: Bearer $TOKEN" | jq '.data.avatar'
kill %1
```

Expected: `avatar` = full URL atau null.

- [ ] **Step 6: Commit**

```bash
git add src/services/shared/userService.js
git commit -m "refactor(user): store relative path for avatar, transform URL on read"
```

### 6c. `cohortService.js` — mentor avatar

**Field affected:** `cohort_mentors.avatar`

- [ ] **Step 1: Replace `uploaded.publicUrl` → `uploaded.relativePath`**

```bash
grep -n "uploaded.publicUrl" src/services/admin/cohortService.js
```

Expected: line 453, 472. Edit kedua line:

```js
data.avatar = uploaded.publicUrl;
// → menjadi:
data.avatar = uploaded.relativePath;
```

- [ ] **Step 2: Tambah cleanup old mentor avatar**

Di update mentor method, sebelum update fetch old mentor; setelah update commit, panggil `deleteByPath`.

- [ ] **Step 3: Transform on read — mentors & module attachments**

Untuk method yang return cohort dengan `mentors` atau `module_attachments`:

```js
import { transformAssetUrls } from '../../utils/assetUrl.js';

if (cohort?.mentors) {
  cohort.mentors = cohort.mentors.map(m => transformAssetUrls(m, ['avatar']));
}
if (cohort?.modules) {
  for (const mod of cohort.modules) {
    if (mod.attachments) {
      mod.attachments = mod.attachments.map(a => transformAssetUrls(a, ['file_path']));
    }
  }
}
return cohort;
```

- [ ] **Step 4: Sanity check & commit**

```bash
pnpm dev &
sleep 3
curl -s http://localhost:8000/api/admin/cohorts/1 -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data | {mentors: .mentors[0].avatar, attachment: .modules[0].attachments[0].file_path}'
kill %1
```

Expected: full URLs.

```bash
git add src/services/admin/cohortService.js
git commit -m "refactor(cohort): store relative path for mentor avatar + attachment, transform on read"
```

---

## Task 7: Refactor Cohort Certificate Generation (pdfkit → /tmp → R2)

**Files:**
- Modify: `backend/src/services/admin/cohortService.js` (`_generatePDF` and `completeCohort` related methods)

Current flow (dari spec exploration): pdfkit pipe ke `/backend/uploads/certificates/{cohortId}/{certCode}.pdf` → simpan path ke DB.

Target flow: pdfkit pipe ke `os.tmpdir() + '/certificates/' + certCode + '.pdf'` → read buffer → `r2Service.putObject('certificates/{cohortId}/{certCode}.pdf', buffer, 'application/pdf')` → delete tmp file → simpan **relative path** `certificates/{cohortId}/{certCode}.pdf` ke DB.

- [ ] **Step 1: Locate `_generatePDF` and certificate save logic**

```bash
grep -n "_generatePDF\|certificates/\|writeStream\|cohort_certificates" src/services/admin/cohortService.js | head -30
```

- [ ] **Step 2: Refactor `_generatePDF` (or equivalent)**

Replace destination path:

```js
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { r2Service } from '../shared/r2Service.js';

async _generatePDFAndUpload({ studentName, certCode, academyName, issuedDate, grades, cohortId }) {
  const tmpDir = path.join(os.tmpdir(), 'rise-certificates');
  await fs.ensureDir(tmpDir);
  const tmpPath = path.join(tmpDir, `${certCode}.pdf`);

  // existing pdfkit logic but write to tmpPath instead of uploads/certificates/...
  await this._renderPDFTo(tmpPath, { studentName, certCode, academyName, issuedDate, grades });

  // Upload to R2
  const buffer = await fs.readFile(tmpPath);
  const r2Key = `certificates/${cohortId}/${certCode}.pdf`;
  await r2Service.putObject(r2Key, buffer, 'application/pdf');

  // Clean up tmp
  await fs.remove(tmpPath).catch(() => {});

  return r2Key; // return relative path for DB
}
```

`_renderPDFTo(absolutePath, ...)` adalah method internal yang berisi logika pdfkit existing (cuma extracted untuk testability). Fonts & template tetap di-load dari path repo (`/backend/uploads/certificates/fonts/`, `template.pdf`) — biarkan tidak diubah.

- [ ] **Step 3: Update caller (`completeCohort` atau method certificate generation)**

Replace logic yang dulu save absolute path ke DB:

```js
// BEFORE:
// cohortCertificate.file_path = absolutePath; // atau path lokal

// AFTER:
const r2Key = await this._generatePDFAndUpload({ studentName, certCode, academyName, issuedDate, grades, cohortId });
await this.cohortCertificateRepository.create({ ..., file_path: r2Key });
```

- [ ] **Step 4: Manual test — complete a cohort and verify**

```bash
pnpm dev &
sleep 3
# Trigger complete cohort (admin token required)
curl -X POST http://localhost:8000/api/admin/cohorts/1/complete \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Cek di R2 dashboard: bucket → certificates/1/ harus ada PDF
# Cek DB:
psql $DATABASE_URL -c "SELECT id, file_path FROM cohort_certificates ORDER BY id DESC LIMIT 3;"
# Cek /tmp bersih:
ls /tmp/rise-certificates 2>/dev/null
kill %1
```

Expected:
- R2 bucket berisi PDF di path `certificates/1/{certCode}.pdf`
- DB `file_path` = `certificates/1/{certCode}.pdf` (relative)
- `/tmp/rise-certificates` kosong setelah generation

- [ ] **Step 5: Commit**

```bash
git add src/services/admin/cohortService.js
git commit -m "feat(cohort): upload certificate PDFs to R2 via /tmp staging"
```

---

## Task 8: Certificate Download Endpoint → 302 Redirect to R2

**Files:**
- Modify: `backend/src/controllers/user/cohortController.js` (download handler)

Saat ini endpoint `GET /cohorts/:id/certificate/download` kemungkinan stream PDF dari disk. Target: 302 redirect ke `buildAssetUrl(cert.file_path, cert.created_at)`.

- [ ] **Step 1: Locate handler**

```bash
grep -n "certificate.*download\|/download\|sendFile" src/controllers/user/cohortController.js src/routes/user/cohortRoutes.js
```

- [ ] **Step 2: Replace stream/sendFile dengan redirect**

```js
import { buildAssetUrl } from '../../utils/assetUrl.js';

async downloadCertificate(request, reply) {
  const userId = request.user.id;
  const cohortId = parseInt(request.params.id);

  const cert = await this.userCohortService.getUserCertificate(userId, cohortId);
  if (!cert) {
    return reply.status(404).send(errorResponse('Certificate not found', 404));
  }

  const url = buildAssetUrl(cert.file_path, cert.created_at);
  if (!url) {
    return reply.status(404).send(errorResponse('Certificate file unavailable', 404));
  }
  return reply.redirect(302, url);
}
```

> NOTE: kalau `getUserCertificate` mengembalikan record yang sudah di-transform (file_path = full URL), maka cukup: `return reply.redirect(302, cert.file_path);`. Pilih satu approach konsisten dengan transform di service layer.

- [ ] **Step 3: Manual test**

```bash
pnpm dev &
sleep 3
curl -I -H "Authorization: Bearer $USER_TOKEN" http://localhost:8000/api/cohorts/1/certificate/download
kill %1
```

Expected: HTTP 302 dengan `Location: https://assets.risesocial.org/certificates/1/...pdf`.

- [ ] **Step 4: Commit**

```bash
git add src/controllers/user/cohortController.js
git commit -m "feat(cohort): redirect certificate download to R2 URL"
```

---

## Task 9: Frontend Cleanup — Remove Hardcoded Upload URLs

**Files:** lihat list di "File Structure" section atas.

Pattern yang dicari: konstruksi URL manual seperti `${BACKEND_URL}/uploads/...` atau `useRuntimeConfig().public.backendUrl + '/uploads/...'`. Pattern target: pakai field URL dari API response langsung.

- [ ] **Step 1: Audit semua hardcoded URL constructions**

```bash
cd ../frontend-v2
grep -rn "uploads/\|BACKEND_URL\|backendUrl" app/components app/composables 2>&1 | grep -v node_modules | grep -v ".d.ts"
```

```bash
cd ../frontend
grep -rn "uploads/\|BACKEND_URL\|backendUrl" components 2>&1 | grep -v node_modules
```

- [ ] **Step 2: Untuk setiap match, ganti pakai field URL dari API**

Contoh pattern lama:

```vue
<img :src="`${backendUrl}/uploads/${academy.image_url}`" />
```

Ganti:

```vue
<img :src="academy.image_url" />
```

Backend sekarang return `image_url` yang sudah full URL (legacy http URL atau R2 URL berdasarkan cutoff).

> NOTE: kalau ada komponen yang upload baru lalu set preview lokal (FileReader / URL.createObjectURL), itu tidak terdampak — biarkan.

- [ ] **Step 3: Manual test setiap komponen**

```bash
cd frontend-v2 && pnpm dev
```

Test di browser: buka admin academy detail, profile, cohort detail; verifikasi semua image ter-render.

- [ ] **Step 4: Commit frontend changes**

```bash
cd /Users/umarsani/Projects/rise-social
# frontend-v2
cd frontend-v2 && git add -A && git commit -m "refactor(ui): use API-provided asset URLs directly"
# frontend (v1)
cd ../frontend && git add -A && git commit -m "refactor(ui): use API-provided asset URLs directly"
```

---

## Task 10: Manual Smoke Test (Post-Deploy Checklist)

**Not a code task — checklist untuk eksekusi setelah deploy.**

- [ ] **Step 1: Pre-deploy — provision R2**

1. Buat R2 bucket `rise-assets` di Cloudflare dashboard
2. Setup custom domain `assets.risesocial.org` (Settings → Custom Domains → add)
3. Configure CORS rule:
   ```json
   [{
     "AllowedOrigins": ["https://risesocial.org", "https://*.risesocial.org", "http://localhost:3000"],
     "AllowedMethods": ["GET"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3600
   }]
   ```
4. Create API token (R2 → Manage R2 API tokens → Object Read & Write untuk bucket `rise-assets`)
5. Simpan `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` ke production secrets

- [ ] **Step 2: Deploy backend dengan env baru**

Set `R2_CUTOVER_AT` = ISO timestamp saat deploy. Deploy.

- [ ] **Step 3: Smoke test (urutan)**

1. **R2 health**: backend boot tanpa error → cek log tidak ada "[R2Service]" error
2. **New avatar upload**: dari admin UI, upload avatar user baru → verifikasi:
   - R2 dashboard: ada object di `users/avatars/{slug}-{uuid}.png`
   - DB: `users.avatar` = `users/avatars/{slug}-{uuid}.png` (relative path)
   - API response: `avatar` = `https://assets.risesocial.org/users/avatars/...`
   - Browser: image ter-render
3. **Legacy avatar masih accessible**: pilih user dengan avatar lama (created < cutoff) → verifikasi API response = `https://backend.../uploads/...` dan image masih ter-load
4. **Replace avatar**: ganti avatar user yang baru di-upload tadi → verifikasi:
   - DB updated dengan path baru
   - File lama di R2 sudah ter-delete (cek dashboard)
   - File baru ter-upload
5. **Cohort attachment upload**: tambah attachment di module cohort → verifikasi flow sama
6. **Cohort certificate**: trigger `POST /admin/cohorts/:id/complete` (atau via UI) → verifikasi:
   - R2: ada PDF di `certificates/{cohortId}/`
   - DB: `cohort_certificates.file_path` = `certificates/{cohortId}/{certCode}.pdf`
   - `/tmp/rise-certificates` di server kosong
   - `GET /cohorts/:id/certificate/download` → HTTP 302 ke R2 URL
7. **RYLS upload**: submit RYLS form (essay/headshot/payment proof) → verifikasi file di R2 + DB

- [ ] **Step 4: Monitor log selama 1 minggu**

Cek log warning `[R2Service] deleteObject failed` — kalau frequent berarti race condition atau path mismatch, investigate.

---

## Self-Review Notes

**Spec coverage:** ✅ Semua 10 fitur upload covered (Task 4 generic via `upload()`, Task 6 entity wiring, Task 7 certificate, Task 9 frontend).

**Discrepancies dari spec asli:** Saat eksplorasi ditemukan services existing simpan **full URL** (bukan relative path) ke DB. Plan ini handle dengan `buildAssetUrl` yang detect `http(s)://` prefix → return as-is (legacy data tetap jalan tanpa migration), plus refactor services untuk simpan relative path going forward. Spec di `2026-05-18-cloudflare-r2-migration-design.md` perlu di-update untuk reflect detail ini, atau revisi inline di plan ini dianggap memadai.

**Out of scope (deferred):**
- Migrasi penuh data lama disk → R2 (script one-off)
- Refactor unified storage (semua field URL → file_uploads table)
- Image transformation / resize
- Presigned upload untuk file besar

**Tests:** Unit untuk r2Service, assetUrl, fileUploadService.upload, fileUploadService.deleteByPath. Integration ditangani via manual smoke test post-deploy (Task 10).
