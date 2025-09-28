import { systemSettingsService } from '../services/systemSettingsService.js';
import { getLogger } from '../lib/loggerContext.js';

const API_KEY = process.env.RAPIDAPI_KEY;
const BASE_URL = process.env.RAPIDAPI_BASE_URL || 'https://linkedin-job-search-api.p.rapidapi.com';

if (!API_KEY) {
  getLogger().error('[linkedinJobSearch] Missing env RAPIDAPI_KEY');
  throw new Error('RAPIDAPI_KEY is not set');
}

export class LinkedInJobSearch {
  constructor() {
    this.headers = {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com',
    };
  }

  get logger() {
    return getLogger();
  }

  /**
   * Search jobs from LinkedIn
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchJobs(options = {}) {
    this.logger.info('[linkedinJobSearch] searchJobs start');

    const { filter = {} } = options;
    const FIXED_LIMIT = 10; // fixed limit defined at integration layer

    try {
      const hasWhitespace = (val) => /\s/.test(String(val));

      // Phrase filters: single-quote multi-word terms, join with OR (|). Assumes arrays.
      const appendPhrasesOr = (params, key, values) => {
        if (!Array.isArray(values) || values.length === 0) return;
        const joined = values.map((v) => (hasWhitespace(v) ? `'${String(v)}'` : String(v))).join('|');
        if (joined) params.append(key, joined);
      };

      // Exact filters: comma-delimited (no spaces). If multi-word, wrap in double quotes. Assumes arrays.
      const appendCommaList = (params, key, values) => {
        if (!Array.isArray(values) || values.length === 0) return;
        const joined = values.map((v) => (hasWhitespace(v) ? `"${String(v)}"` : String(v))).join(',');
        if (joined) params.append(key, joined);
      };

      const params = new URLSearchParams();

      params.append('limit', String(FIXED_LIMIT));
      // Always include job description and AI-enriched fields
      params.append('description_type', 'text');
      params.append('include_ai', 'true');

      // Phrase-like filters → OR with single quotes for multi-word
      appendPhrasesOr(params, 'advanced_title_filter', filter.advanced_title_filter);
      appendPhrasesOr(params, 'location_filter', filter.location_filter);
      appendPhrasesOr(params, 'description_filter', filter.description_filter);
      appendPhrasesOr(params, 'organization_description_filter', filter.organization_description_filter);
      appendPhrasesOr(params, 'organization_specialties_filter', filter.organization_specialties_filter);

      // Exact filters → comma-delimited with double quotes for multi-word
      appendCommaList(params, 'type_filter', filter.type_filter);
      appendCommaList(params, 'industry_filter', filter.industry_filter);
      appendCommaList(params, 'seniority_filter', filter.seniority_filter);

      const url = `${BASE_URL}/active-jb-7d?${params.toString()}`;

      this.logger.info({ params: params.toString() }, '[linkedinJobSearch] built params');
      this.logger.info({ url }, '[linkedinJobSearch] request GET');

      this.logger.info({ limit: FIXED_LIMIT }, '[linkedinJobSearch] request params');

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        this.logger.error({ status: response.status, statusText: response.statusText }, '[linkedinJobSearch] response error');
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const rateLimitData = {
        jobs: {
          limit: parseInt(response.headers.get('x-ratelimit-jobs-limit')) || 0,
          remaining: parseInt(response.headers.get('x-ratelimit-jobs-remaining')) || 0,
          reset: parseInt(response.headers.get('x-ratelimit-jobs-reset')) || 0,
        },
        requests: {
          limit: parseInt(response.headers.get('x-ratelimit-requests-limit')) || 0,
          remaining: parseInt(response.headers.get('x-ratelimit-requests-remaining')) || 0,
          reset: parseInt(response.headers.get('x-ratelimit-requests-reset')) || 0,
        },
      };

      try {
        await systemSettingsService.updateLinkedInRateLimit(rateLimitData);
        this.logger.info('[linkedinJobSearch] rateLimit saved');
      } catch (error) {
        this.logger.error({ err: error }, '[linkedinJobSearch] rateLimit save failed');
      }

      const data = await response.json();

      this.logger.debug({ type: typeof data }, '[linkedinJobSearch] response type');
      this.logger.info({ jobsCount: Array.isArray(data) ? data.length : data.jobs?.length || 0 }, '[linkedinJobSearch] jobs count');

      return {
        success: true,
        total: Array.isArray(data) ? data.length : data.total || data.jobs?.length || 0,
        jobs: Array.isArray(data) ? data : data.jobs || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error({ err: error }, '[linkedinJobSearch] search error');
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const linkedInJobSearch = new LinkedInJobSearch();
