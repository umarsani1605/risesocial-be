import { systemSettingsRepository } from '../../repositories/admin/systemSettingsRepository.js';

export const WEBSITE_CONTACT_KEY = 'website_contact';
export const WEBSITE_SOCIAL_MEDIA_KEY = 'website_social_media';

/** Coerce to an integer within [min, max], falling back to `fallback` on bad input. */
function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return fallback;
  return n;
}

/**
 * Fallback values for the public site settings, used when an admin has not
 * saved a key yet. Keeps the public footer and contact page from rendering
 * blank before configuration, and lets prerender/SSR succeed even if the
 * settings were never written.
 */
const PUBLIC_SITE_DEFAULTS = {
  contact: {
    phone: '',
    email: 'risesocial.official@gmail.com',
    address: 'Bandung, West Java 40286, Indonesia',
  },
  social_media: {
    instagram: 'https://www.instagram.com/risesocial_/',
    facebook: '',
    linkedin: 'https://www.linkedin.com/company/rise-social-org/',
    tiktok: 'https://www.tiktok.com/@risesocial_',
  },
};

export class SystemSettingsService {

  async getSetting(key) {
    const setting = await systemSettingsRepository.getSetting(key);
    return setting?.value || null;
  }

  async setSetting(key, value, description = null) {
    return await systemSettingsRepository.upsertSetting(key, value, description);
  }

  async getLinkedInRateLimit() {
    return await this.getSetting('linkedin_rate_limit');
  }

  async updateLinkedInRateLimit(rateLimitData) {
    const data = {
      ...rateLimitData,
      last_updated: new Date().toISOString(),
    };

    return await this.setSetting('linkedin_rate_limit', data, 'LinkedIn API rate limit data');
  }

  /** ISO timestamp of the last successful LinkedIn job sync, or null if never run. */
  async getLinkedInLastSyncedAt() {
    return await this.getSetting('linkedin_last_synced_at');
  }

  /** Persist the last successful LinkedIn job sync timestamp (defaults to now). */
  async setLinkedInLastSyncedAt(date = new Date()) {
    const iso = date instanceof Date ? date.toISOString() : new Date(date).toISOString();
    return await this.setSetting('linkedin_last_synced_at', iso, 'Last successful LinkedIn job sync timestamp');
  }

  /**
   * Default filter used by the scheduled LinkedIn sync. Reads the same
   * `linkedin_sync_filters` key the admin UI writes (SyncSettingsModal). Falls
   * back to an empty filter (still valid — `linkedinJobSearch.searchJobs` only
   * adds limit + description_type + include_ai) before any filter is configured.
   */
  async getLinkedInSyncFilter() {
    return (await this.getSetting('linkedin_sync_filters')) ?? {};
  }

  /**
   * Admin-configured schedule for the LinkedIn sync. Defensive: the value is
   * written via the generic settings PUT, so clamp every field to a safe range
   * and fall back to the defaults for anything missing or out of bounds.
   */
  async getLinkedInSyncSchedule() {
    const raw = (await this.getSetting('linkedin_sync_schedule')) ?? {};
    return {
      enabled: raw.enabled === true,
      job_limit: clampInt(raw.job_limit, 1, 100, 10),
      interval_weeks: clampInt(raw.interval_weeks, 1, 4, 2),
      day_of_week: clampInt(raw.day_of_week, 0, 6, 0),
      hour: clampInt(raw.hour, 0, 23, 2),
      hide_after_weeks: clampInt(raw.hide_after_weeks, 1, 4, 2),
    };
  }

  async getAllSettings() {
    return await systemSettingsRepository.getAllSettings();
  }

  async deleteSetting(key) {
    return await systemSettingsRepository.deleteSetting(key);
  }

  /**
   * Public, read-only site settings consumed by the website footer (social
   * media) and contact page (contact). Merges saved values over defaults so
   * the response is always complete, never exposing other internal settings.
   */
  async getPublicSiteSettings() {
    const [contact, socialMedia] = await Promise.all([
      this.getSetting(WEBSITE_CONTACT_KEY),
      this.getSetting(WEBSITE_SOCIAL_MEDIA_KEY),
    ]);

    return {
      contact: { ...PUBLIC_SITE_DEFAULTS.contact, ...(contact ?? {}) },
      social_media: { ...PUBLIC_SITE_DEFAULTS.social_media, ...(socialMedia ?? {}) },
    };
  }
}

export const systemSettingsService = new SystemSettingsService();
