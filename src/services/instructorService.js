import { getLogger } from '../lib/loggerContext.js';
import InstructorRepository from '../repositories/instructorRepository.js';
// Note: academyInstructorRepository.js sudah dihapus, perlu implementasi ulang

class InstructorService {
  constructor() {
    this.instructorRepository = new InstructorRepository();
    // TODO: Implement academyInstructorRepository functionality
    this.academyInstructorRepository = null;
  }

  get logger() {
    return getLogger();
  }

  /**
   * Mendapatkan semua instructor dengan pagination
   */
  async getAllInstructors(options = {}) {
    this.logger.info('[instructorService] getAllInstructors start');
    console.log('[InstructorService] getAllInstructors - options:', JSON.stringify(options, null, 2));
    console.log('[InstructorService] getAllInstructors - repository:', !!this.instructorRepository);

    try {
      const result = await this.instructorRepository.findManyWithPagination(options);
      console.log('[InstructorService] getAllInstructors - raw result:', {
        dataLength: result?.data?.length,
        meta: result?.meta,
      });

      result.data = result.data.map((instructor) => this.enhanceInstructorObject(instructor));
      this.logger.info('[instructorService] getAllInstructors success');
      return result;
    } catch (error) {
      console.error('[InstructorService] getAllInstructors - detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      this.logger.error({ err: error }, '[instructorService] getAllInstructors error');
      throw error;
    }
  }

  /**
   * Mendapatkan instructor berdasarkan ID
   */
  async getInstructorById(id, includeAcademies = false) {
    this.logger.info({ id, includeAcademies }, '[instructorService] getInstructorById start');
    try {
      const instructor = await this.instructorRepository.findByIdWithAcademies(id, includeAcademies);
      const result = instructor ? this.enhanceInstructorObject(instructor) : null;
      this.logger.info('[instructorService] getInstructorById success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorById error');
      throw error;
    }
  }

  /**
   * Membuat instructor baru
   */
  async createInstructor(data) {
    this.logger.info('[instructorService] createInstructor start');
    try {
      this.validateInstructorData(data);
      const instructor = await this.instructorRepository.createInstructor(data);
      const result = this.enhanceInstructorObject(instructor);
      this.logger.info('[instructorService] createInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] createInstructor error');
      throw error;
    }
  }

  /**
   * Update instructor
   */
  async updateInstructor(id, data) {
    this.logger.info({ id }, '[instructorService] updateInstructor start');
    try {
      if (Object.keys(data).length > 0) {
        this.validateInstructorData(data, false);
      }
      const instructor = await this.instructorRepository.updateInstructor(id, data);
      const result = this.enhanceInstructorObject(instructor);
      this.logger.info('[instructorService] updateInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] updateInstructor error');
      throw error;
    }
  }

  /**
   * Menghapus instructor
   */
  async deleteInstructor(id) {
    this.logger.info({ id }, '[instructorService] deleteInstructor start');
    try {
      const result = await this.instructorRepository.deleteInstructor(id);
      this.logger.info('[instructorService] deleteInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] deleteInstructor error');
      throw error;
    }
  }

  /**
   * Mencari instructor berdasarkan nama
   */
  async searchInstructorByName(name) {
    this.logger.info({ name }, '[instructorService] searchInstructorByName start');
    try {
      const instructors = await this.instructorRepository.findByName(name);
      const result = instructors.map((instructor) => this.enhanceInstructorObject(instructor));
      this.logger.info('[instructorService] searchInstructorByName success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] searchInstructorByName error');
      throw error;
    }
  }

  /**
   * Mendapatkan instructor berdasarkan job title
   */
  async getInstructorsByJobTitle(jobTitle) {
    this.logger.info({ jobTitle }, '[instructorService] getInstructorsByJobTitle start');
    try {
      const instructors = await this.instructorRepository.findByJobTitle(jobTitle);
      const result = instructors.map((instructor) => this.enhanceInstructorObject(instructor));
      this.logger.info('[instructorService] getInstructorsByJobTitle success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorsByJobTitle error');
      throw error;
    }
  }

  /**
   * Mendapatkan instructor yang tersedia untuk academy
   */
  async getAvailableInstructorsForAcademy(academyId) {
    this.logger.info({ academyId }, '[instructorService] getAvailableInstructorsForAcademy start');
    try {
      const instructors = await this.instructorRepository.findAvailableForAcademy(academyId);
      const result = instructors.map((instructor) => this.enhanceInstructorObject(instructor));
      this.logger.info('[instructorService] getAvailableInstructorsForAcademy success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getAvailableInstructorsForAcademy error');
      throw error;
    }
  }

  /**
   * Mendapatkan instructor untuk academy tertentu
   */
  async getInstructorsByAcademyId(academyId) {
    this.logger.info({ academyId }, '[instructorService] getInstructorsByAcademyId start');
    try {
      const instructors = await this.instructorRepository.findByAcademyId(academyId);
      const result = instructors.map((instructor) => this.enhanceInstructorObject(instructor));
      this.logger.info('[instructorService] getInstructorsByAcademyId success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorsByAcademyId error');
      throw error;
    }
  }

  /**
   * Mendapatkan academy yang diajar oleh instructor
   */
  async getAcademiesByInstructorId(instructorId) {
    this.logger.info({ instructorId }, '[instructorService] getAcademiesByInstructorId start');
    try {
      const academies = await this.instructorRepository.findAcademiesByInstructorId(instructorId);
      const result = academies.map((academy) => this.enhanceAcademyObject(academy));
      this.logger.info('[instructorService] getAcademiesByInstructorId success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getAcademiesByInstructorId error');
      throw error;
    }
  }

  /**
   * Mendapatkan instructor terpopuler
   */
  async getPopularInstructors(limit = 10) {
    this.logger.info({ limit }, '[instructorService] getPopularInstructors start');
    try {
      const instructors = await this.instructorRepository.findPopularInstructors(limit);
      const result = instructors.map((instructor) => this.enhanceInstructorObject(instructor));
      this.logger.info('[instructorService] getPopularInstructors success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getPopularInstructors error');
      throw error;
    }
  }

  /**
   * Assign/Remove/Reorder/Batch/Detail (belum diimplementasikan)
   */
  async assignInstructorToAcademy(academyId, instructorId, instructorOrder = null) {
    this.logger.info({ academyId, instructorId }, '[instructorService] assignInstructorToAcademy start');
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async removeInstructorFromAcademy(academyId, instructorId) {
    this.logger.info({ academyId, instructorId }, '[instructorService] removeInstructorFromAcademy start');
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async reorderInstructorsInAcademy(academyId, orderData) {
    this.logger.info({ academyId }, '[instructorService] reorderInstructorsInAcademy start');
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async batchAssignInstructors(academyId, instructorIds) {
    this.logger.info(
      { academyId, count: Array.isArray(instructorIds) ? instructorIds.length : 0 },
      '[instructorService] batchAssignInstructors start'
    );
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async batchRemoveInstructors(academyId, instructorIds) {
    this.logger.info(
      { academyId, count: Array.isArray(instructorIds) ? instructorIds.length : 0 },
      '[instructorService] batchRemoveInstructors start'
    );
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async getAssignmentDetail(academyId, instructorId) {
    this.logger.info({ academyId, instructorId }, '[instructorService] getAssignmentDetail start');
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  /**
   * Mendapatkan statistik instructor
   */
  async getInstructorStats() {
    this.logger.info('[instructorService] getInstructorStats start');
    try {
      const [instructorStats, assignmentStats] = await Promise.all([
        this.instructorRepository.getInstructorStats(),
        this.academyInstructorRepository.getAssignmentStats(),
      ]);

      const result = {
        ...instructorStats,
        ...assignmentStats,
        engagement_score: this.calculateEngagementScore(instructorStats, assignmentStats),
      };

      this.logger.info('[instructorService] getInstructorStats success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorStats error');
      throw error;
    }
  }

  /**
   * Enhance instructor object dengan computed fields
   * @param {Object} instructor - Raw instructor object
   * @returns {Object} Enhanced instructor object
   */
  enhanceInstructorObject(instructor) {
    const academyCount = instructor.academy_instructors ? instructor.academy_instructors.length : 0;

    return {
      ...instructor,
      has_avatar: Boolean(instructor.avatar_url),
      has_description: Boolean(instructor.description),
      has_job_title: Boolean(instructor.job_title),
      profile_completeness: this.calculateProfileCompleteness(instructor),
      experience_level: this.getExperienceLevel(instructor.job_title),
      expertise_areas: this.extractExpertiseAreas(instructor.description),
      seniority_badge: this.getSeniorityBadge(instructor.job_title),
      academy_count: academyCount,
      instructor_type: this.getInstructorType(instructor.job_title),
      display_name: this.getDisplayName(instructor),
      created_at_formatted: this.formatDate(instructor.created_at),
      updated_at_formatted: this.formatDate(instructor.updated_at),
      short_description: this.getShortDescription(instructor.description),
      academies: instructor.academy_instructors ? instructor.academy_instructors.map((ai) => this.enhanceAcademyObject(ai.academy)) : [],
    };
  }

  /**
   * Enhance academy object untuk context instructor
   * @param {Object} academy - Raw academy object
   * @returns {Object} Enhanced academy object
   */
  enhanceAcademyObject(academy) {
    return {
      ...academy,
      category_badge: this.getCategoryBadge(academy.category),
      status_badge: this.getStatusBadge(academy.status),
      duration_formatted: this.formatDuration(academy.duration),
      rating_display: this.formatRating(academy.rating),
      url: `/academy/${academy.path_slug}`,
    };
  }

  /**
   * Enhance assignment object
   * @param {Object} assignment - Raw assignment object
   * @returns {Object} Enhanced assignment object
   */
  enhanceAssignmentObject(assignment) {
    return {
      ...assignment,
      display_order: `#${assignment.instructor_order}`,
      assignment_type: 'Primary Instructor',
      created_at_formatted: assignment.created_at ? this.formatDate(assignment.created_at) : null,
    };
  }

  /**
   * Menghitung profile completeness score
   * @param {Object} instructor - Instructor object
   * @returns {number} Completeness score (0-100)
   */
  calculateProfileCompleteness(instructor) {
    let score = 0;

    if (instructor.name) score += 25;
    if (instructor.job_title) score += 25;
    if (instructor.description) score += 25;
    if (instructor.avatar_url) score += 25;

    return score;
  }

  /**
   * Mendapatkan experience level berdasarkan job title
   * @param {string} jobTitle - Job title
   * @returns {string} Experience level
   */
  getExperienceLevel(jobTitle) {
    if (!jobTitle) return 'Unknown';

    const lowerTitle = jobTitle.toLowerCase();

    if (lowerTitle.includes('senior') || lowerTitle.includes('lead') || lowerTitle.includes('principal')) {
      return 'Senior';
    } else if (lowerTitle.includes('junior') || lowerTitle.includes('associate')) {
      return 'Junior';
    } else if (lowerTitle.includes('head') || lowerTitle.includes('director') || lowerTitle.includes('chief')) {
      return 'Executive';
    } else {
      return 'Mid-Level';
    }
  }

  /**
   * Extract expertise areas dari description
   * @param {string} description - Description text
   * @returns {Array} Expertise areas
   */
  extractExpertiseAreas(description) {
    if (!description) return [];

    const expertiseKeywords = [
      'javascript',
      'python',
      'java',
      'react',
      'vue',
      'angular',
      'node.js',
      'machine learning',
      'ai',
      'data science',
      'blockchain',
      'devops',
      'ui/ux',
      'design',
      'product management',
      'agile',
      'scrum',
    ];

    const lowerDescription = description.toLowerCase();
    return expertiseKeywords.filter((keyword) => lowerDescription.includes(keyword));
  }

  /**
   * Mendapatkan seniority badge
   * @param {string} jobTitle - Job title
   * @returns {string} Seniority badge
   */
  getSeniorityBadge(jobTitle) {
    const experienceLevel = this.getExperienceLevel(jobTitle);

    const badges = {
      Junior: '🌱 Junior',
      'Mid-Level': 'Mid-Level',
      Senior: '⭐ Senior',
      Executive: '👑 Executive',
      Unknown: 'Instructor',
    };

    return badges[experienceLevel] || badges['Unknown'];
  }

  /**
   * Mendapatkan instructor type
   * @param {string} jobTitle - Job title
   * @returns {string} Instructor type
   */
  getInstructorType(jobTitle) {
    if (!jobTitle) return 'General';

    const lowerTitle = jobTitle.toLowerCase();

    if (lowerTitle.includes('developer') || lowerTitle.includes('engineer')) {
      return 'Technical';
    } else if (lowerTitle.includes('designer') || lowerTitle.includes('ui') || lowerTitle.includes('ux')) {
      return 'Design';
    } else if (lowerTitle.includes('product') || lowerTitle.includes('manager')) {
      return 'Product';
    } else if (lowerTitle.includes('data') || lowerTitle.includes('analyst')) {
      return 'Data';
    } else if (lowerTitle.includes('marketing') || lowerTitle.includes('growth')) {
      return 'Marketing';
    } else {
      return 'General';
    }
  }

  /**
   * Mendapatkan display name
   * @param {Object} instructor - Instructor object
   * @returns {string} Display name
   */
  getDisplayName(instructor) {
    return instructor.job_title ? `${instructor.name} - ${instructor.job_title}` : instructor.name;
  }

  /**
   * Mendapatkan short description
   * @param {string} description - Full description
   * @returns {string} Short description
   */
  getShortDescription(description) {
    if (!description) return '';
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }

  /**
   * Format tanggal
   * @param {Date} date - Date object
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format duration
   * @param {string} duration - Duration string
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    return duration || 'Flexible';
  }

  /**
   * Format rating
   * @param {number} rating - Rating number
   * @returns {string} Formatted rating
   */
  formatRating(rating) {
    if (!rating || rating === 0) return 'Belum ada rating';
    return `⭐ ${rating.toFixed(1)}`;
  }

  /**
   * Mendapatkan category badge
   * @param {string} category - Category string
   * @returns {string} Category badge
   */
  getCategoryBadge(category) {
    if (!category) return '📚 General';
    return `📚 ${category}`;
  }

  /**
   * Mendapatkan status badge
   * @param {string} status - Status string
   * @returns {string} Status badge
   */
  getStatusBadge(status) {
    const badges = {
      ACTIVE: '🟢 Active',
      DRAFT: '🟡 Draft',
      ARCHIVED: '🔴 Archived',
    };
    return badges[status] || `${status}`;
  }

  /**
   * Menghitung engagement score
   * @param {Object} instructorStats - Instructor statistics
   * @param {Object} assignmentStats - Assignment statistics
   * @returns {number} Engagement score
   */
  calculateEngagementScore(instructorStats, assignmentStats) {
    if (instructorStats.total_instructors === 0) return 0;

    const profileScore = instructorStats.profile_completion_rate;
    const activityScore =
      assignmentStats.unique_instructors_with_academies > 0
        ? (assignmentStats.unique_instructors_with_academies / instructorStats.total_instructors) * 100
        : 0;

    return Math.round((profileScore + activityScore) / 2);
  }

  /**
   * Validasi data instructor
   * @param {Object} data - Data instructor
   * @param {boolean} isCreate - Apakah untuk create (default true)
   * @throws {Error} Jika validasi gagal
   */
  validateInstructorData(data, isCreate = true) {
    if (isCreate && !data.name) {
      throw new Error('Nama instructor wajib diisi');
    }

    if (data.name && (data.name.length < 2 || data.name.length > 255)) {
      throw new Error('Nama instructor harus antara 2-255 karakter');
    }

    if (data.job_title && data.job_title.length > 255) {
      throw new Error('Job title tidak boleh lebih dari 255 karakter');
    }

    if (data.avatar_url && data.avatar_url.length > 500) {
      throw new Error('URL avatar tidak boleh lebih dari 500 karakter');
    }

    if (data.avatar_url && !this.isValidUrl(data.avatar_url)) {
      throw new Error('Format URL avatar tidak valid');
    }
  }

  /**
   * Validasi URL
   * @param {string} url - URL to validate
   * @returns {boolean} True jika URL valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export default InstructorService;
