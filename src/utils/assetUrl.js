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
  if (HTTP_RE.test(value)) return value;

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

/**
 * Extract the R2 object key from a full R2 URL (if it matches R2_PUBLIC_BASE).
 * Returns null for URLs that don't match the R2 base (legacy backend URLs, external URLs, etc.).
 *
 * @param {string|null|undefined} url - full URL to parse
 * @returns {string|null} relative key (e.g. "academies/images/foo.png") or null
 */
export function extractR2Key(url) {
  if (!url) return null;
  const base = (process.env.R2_PUBLIC_BASE || '').replace(/\/$/, '');
  if (!base) return null;
  if (!url.startsWith(base + '/')) return null;
  return url.slice(base.length + 1);
}
