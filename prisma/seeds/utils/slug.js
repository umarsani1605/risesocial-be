/**
 * Slug utility for normalizing text into URL-friendly slugs
 */

/**
 * Normalize text into a URL-friendly slug
 * @param {string} text - Text to convert to slug
 * @returns {string} Normalized slug
 */
export function normalizeSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - Base slug to make unique
 * @param {Array<string>} existingSlugs - Array of existing slugs to check against
 * @returns {string} Unique slug
 */
export function generateUniqueSlug(baseSlug, existingSlugs) {
  let slug = normalizeSlug(baseSlug);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${normalizeSlug(baseSlug)}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Create a slug from a title with optional suffix
 * @param {string} title - Title to convert
 * @param {string} suffix - Optional suffix to append
 * @returns {string} Generated slug
 */
export function createSlug(title, suffix = '') {
  const baseSlug = normalizeSlug(title);
  return suffix ? `${baseSlug}-${normalizeSlug(suffix)}` : baseSlug;
}
