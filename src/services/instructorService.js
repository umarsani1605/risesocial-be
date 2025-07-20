import InstructorRepository from '../repositories/instructorRepository.js';
// Note: bootcampInstructorRepository.js sudah dihapus, perlu implementasi ulang

class InstructorService {
  constructor() {
    this.instructorRepository = new InstructorRepository();
    // TODO: Implement bootcampInstructorRepository functionality
    this.bootcampInstructorRepository = null;
  }

  /**
   * Mendapatkan semua instructor dengan pagination
   * @param {Object} options - Options untuk query
   * @returns {Promise<Object>} Paginated instructor data
   */
  async getAllInstructors(options = {}) {
    const result = await this.instructorRepository.findManyWithPagination(options);

    // Enhance instructor objects
    result.data = result.data.map((instructor) => this.enhanceInstructorObject(instructor));

    return result;
  }

  /**
   * Mendapatkan instructor berdasarkan ID
   * @param {number} id - ID instructor
   * @param {boolean} includeBootcamps - Include bootcamp associations
   * @returns {Promise<Object>} Instructor yang di-enhance
   */
  async getInstructorById(id, includeBootcamps = false) {
    const instructor = await this.instructorRepository.findByIdWithBootcamps(id, includeBootcamps);
    return instructor ? this.enhanceInstructorObject(instructor) : null;
  }

  /**
   * Membuat instructor baru
   * @param {Object} data - Data instructor
   * @returns {Promise<Object>} Instructor yang dibuat
   */
  async createInstructor(data) {
    // Validasi data
    this.validateInstructorData(data);

    const instructor = await this.instructorRepository.createInstructor(data);
    return this.enhanceInstructorObject(instructor);
  }

  /**
   * Update instructor
   * @param {number} id - ID instructor
   * @param {Object} data - Data untuk update
   * @returns {Promise<Object>} Instructor yang diupdate
   */
  async updateInstructor(id, data) {
    // Validasi data jika ada
    if (Object.keys(data).length > 0) {
      this.validateInstructorData(data, false);
    }

    const instructor = await this.instructorRepository.updateInstructor(id, data);
    return this.enhanceInstructorObject(instructor);
  }

  /**
   * Menghapus instructor
   * @param {number} id - ID instructor
   * @returns {Promise<Object>} Instructor yang dihapus
   */
  async deleteInstructor(id) {
    return await this.instructorRepository.deleteInstructor(id);
  }

  /**
   * Mencari instructor berdasarkan nama
   * @param {string} name - Nama instructor
   * @returns {Promise<Array>} Array instructor yang di-enhance
   */
  async searchInstructorByName(name) {
    const instructors = await this.instructorRepository.findByName(name);
    return instructors.map((instructor) => this.enhanceInstructorObject(instructor));
  }

  /**
   * Mendapatkan instructor berdasarkan job title
   * @param {string} jobTitle - Job title
   * @returns {Promise<Array>} Array instructor yang di-enhance
   */
  async getInstructorsByJobTitle(jobTitle) {
    const instructors = await this.instructorRepository.findByJobTitle(jobTitle);
    return instructors.map((instructor) => this.enhanceInstructorObject(instructor));
  }

  /**
   * Mendapatkan instructor yang tersedia untuk bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @returns {Promise<Array>} Array instructor yang tersedia
   */
  async getAvailableInstructorsForBootcamp(bootcampId) {
    const instructors = await this.instructorRepository.findAvailableForBootcamp(bootcampId);
    return instructors.map((instructor) => this.enhanceInstructorObject(instructor));
  }

  /**
   * Mendapatkan instructor untuk bootcamp tertentu
   * @param {number} bootcampId - ID bootcamp
   * @returns {Promise<Array>} Array instructor dengan order
   */
  async getInstructorsByBootcampId(bootcampId) {
    const instructors = await this.instructorRepository.findByBootcampId(bootcampId);
    return instructors.map((instructor) => this.enhanceInstructorObject(instructor));
  }

  /**
   * Mendapatkan bootcamp yang diajar oleh instructor
   * @param {number} instructorId - ID instructor
   * @returns {Promise<Array>} Array bootcamp
   */
  async getBootcampsByInstructorId(instructorId) {
    const bootcamps = await this.instructorRepository.findBootcampsByInstructorId(instructorId);
    return bootcamps.map((bootcamp) => this.enhanceBootcampObject(bootcamp));
  }

  /**
   * Mendapatkan instructor terpopuler
   * @param {number} limit - Limit hasil
   * @returns {Promise<Array>} Array instructor popular yang di-enhance
   */
  async getPopularInstructors(limit = 10) {
    const instructors = await this.instructorRepository.findPopularInstructors(limit);
    return instructors.map((instructor) => this.enhanceInstructorObject(instructor));
  }

  /**
   * Assign instructor ke bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @param {number} instructorId - ID instructor
   * @param {number} instructorOrder - Order instructor (optional)
   * @returns {Promise<Object>} Assignment yang dibuat
   */
  async assignInstructorToBootcamp(bootcampId, instructorId, instructorOrder = null) {
    // TODO: Implement bootcampInstructorRepository functionality
    throw new Error('BootcampInstructorRepository belum diimplementasikan');
  }

  /**
   * Remove instructor dari bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @param {number} instructorId - ID instructor
   * @returns {Promise<Object>} Assignment yang dihapus
   */
  async removeInstructorFromBootcamp(bootcampId, instructorId) {
    // TODO: Implement bootcampInstructorRepository functionality
    throw new Error('BootcampInstructorRepository belum diimplementasikan');
  }

  /**
   * Reorder instructor dalam bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @param {Array} orderData - Array berisi {instructor_id, instructor_order}
   * @returns {Promise<Array>} Updated assignments
   */
  async reorderInstructorsInBootcamp(bootcampId, orderData) {
    // TODO: Implement bootcampInstructorRepository functionality
    throw new Error('BootcampInstructorRepository belum diimplementasikan');
  }

  /**
   * Batch assign instructor ke bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @param {Array} instructorIds - Array ID instructor
   * @returns {Promise<Array>} Assignments yang dibuat
   */
  async batchAssignInstructors(bootcampId, instructorIds) {
    // TODO: Implement bootcampInstructorRepository functionality
    throw new Error('BootcampInstructorRepository belum diimplementasikan');
  }

  /**
   * Batch remove instructor dari bootcamp
   * @param {number} bootcampId - ID bootcamp
   * @param {Array} instructorIds - Array ID instructor
   * @returns {Promise<number>} Jumlah assignment yang dihapus
   */
  async batchRemoveInstructors(bootcampId, instructorIds) {
    // TODO: Implement bootcampInstructorRepository functionality
    throw new Error('BootcampInstructorRepository belum diimplementasikan');
  }

  /**
   * Mendapatkan detail assignment
   * @param {number} bootcampId - ID bootcamp
   * @param {number} instructorId - ID instructor
   * @returns {Promise<Object>} Assignment detail yang di-enhance
   */
  async getAssignmentDetail(bootcampId, instructorId) {
    // TODO: Implement bootcampInstructorRepository functionality
    throw new Error('BootcampInstructorRepository belum diimplementasikan');
  }

  /**
   * Mendapatkan statistik instructor
   * @returns {Promise<Object>} Statistik instructor yang di-enhance
   */
  async getInstructorStats() {
    const [instructorStats, assignmentStats] = await Promise.all([
      this.instructorRepository.getInstructorStats(),
      this.bootcampInstructorRepository.getAssignmentStats(),
    ]);

    return {
      ...instructorStats,
      ...assignmentStats,
      engagement_score: this.calculateEngagementScore(instructorStats, assignmentStats),
    };
  }

  /**
   * Enhance instructor object dengan computed fields
   * @param {Object} instructor - Raw instructor object
   * @returns {Object} Enhanced instructor object
   */
  enhanceInstructorObject(instructor) {
    const bootcampCount = instructor.bootcamp_instructors ? instructor.bootcamp_instructors.length : 0;

    return {
      ...instructor,
      has_avatar: Boolean(instructor.avatar_url),
      has_description: Boolean(instructor.description),
      has_job_title: Boolean(instructor.job_title),
      profile_completeness: this.calculateProfileCompleteness(instructor),
      experience_level: this.getExperienceLevel(instructor.job_title),
      expertise_areas: this.extractExpertiseAreas(instructor.description),
      seniority_badge: this.getSeniorityBadge(instructor.job_title),
      bootcamp_count: bootcampCount,
      instructor_type: this.getInstructorType(instructor.job_title),
      display_name: this.getDisplayName(instructor),
      created_at_formatted: this.formatDate(instructor.created_at),
      updated_at_formatted: this.formatDate(instructor.updated_at),
      short_description: this.getShortDescription(instructor.description),
      bootcamps: instructor.bootcamp_instructors ? instructor.bootcamp_instructors.map((bi) => this.enhanceBootcampObject(bi.bootcamp)) : [],
    };
  }

  /**
   * Enhance bootcamp object untuk context instructor
   * @param {Object} bootcamp - Raw bootcamp object
   * @returns {Object} Enhanced bootcamp object
   */
  enhanceBootcampObject(bootcamp) {
    return {
      ...bootcamp,
      category_badge: this.getCategoryBadge(bootcamp.category),
      status_badge: this.getStatusBadge(bootcamp.status),
      duration_formatted: this.formatDuration(bootcamp.duration),
      rating_display: this.formatRating(bootcamp.rating),
      url: `/bootcamp/${bootcamp.path_slug}`,
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
      'Mid-Level': '💼 Mid-Level',
      Senior: '⭐ Senior',
      Executive: '👑 Executive',
      Unknown: '💡 Instructor',
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
    return badges[status] || `📋 ${status}`;
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
      assignmentStats.unique_instructors_with_bootcamps > 0
        ? (assignmentStats.unique_instructors_with_bootcamps / instructorStats.total_instructors) * 100
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
