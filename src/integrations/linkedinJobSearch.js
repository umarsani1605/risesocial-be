import { systemSettingsService } from '../services/admin/systemSettingsService.js';

const API_KEY = process.env.RAPIDAPI_KEY;
const BASE_URL = process.env.RAPIDAPI_BASE_URL;

if (!API_KEY) {
  throw new Error('RAPIDAPI_KEY is not set');
}

export class LinkedInJobSearch {
  constructor() {
    this.headers = {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com',
    };
  }


  async searchJobs(options = {}) {

    const { filter = {} } = options;
    const FIXED_LIMIT = 10;

    try {
      const hasWhitespace = (val) => /\s/.test(String(val));

      const appendPhrasesOr = (params, key, values) => {
        if (!Array.isArray(values) || values.length === 0) return;
        const joined = values.map((v) => (hasWhitespace(v) ? `'${String(v)}'` : String(v))).join('|');
        if (joined) params.append(key, joined);
      };

      const appendCommaList = (params, key, values) => {
        if (!Array.isArray(values) || values.length === 0) return;
        const joined = values.map((v) => (hasWhitespace(v) ? `"${String(v)}"` : String(v))).join(',');
        if (joined) params.append(key, joined);
      };

      const params = new URLSearchParams();

      params.append('limit', String(FIXED_LIMIT));

      params.append('description_type', 'text');
      params.append('include_ai', 'true');

      appendPhrasesOr(params, 'advanced_title_filter', filter.advanced_title_filter);
      appendPhrasesOr(params, 'location_filter', filter.location_filter);
      appendPhrasesOr(params, 'description_filter', filter.description_filter);
      appendPhrasesOr(params, 'organization_description_filter', filter.organization_description_filter);
      appendPhrasesOr(params, 'organization_specialties_filter', filter.organization_specialties_filter);

      appendCommaList(params, 'type_filter', filter.type_filter);
      appendCommaList(params, 'industry_filter', filter.industry_filter);
      appendCommaList(params, 'seniority_filter', filter.seniority_filter);

      const url = `${BASE_URL}/active-jb-7d?${params.toString()}`;



      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
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
      } catch (error) {
      }

      const data = await response.json();


      return {
        success: true,
        total: Array.isArray(data) ? data.length : data.total || data.jobs?.length || 0,
        jobs: Array.isArray(data) ? data : data.jobs || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const linkedInJobSearch = new LinkedInJobSearch();
