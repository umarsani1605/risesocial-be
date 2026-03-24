import { getLogger } from '../../utils/loggerContext.js';
import { instructorRepository } from '../../repositories/shared/instructorRepository.js';

class InstructorService {
  constructor() {
    this.instructorRepository = instructorRepository;
    this.academyInstructorRepository = null;
  }

  get logger() {
    return getLogger();
  }

  async getAllInstructors(options = {}) {
    this.logger.info('[instructorService] getAllInstructors start');
    try {
      const result = await this.instructorRepository.findManyWithPagination(options);
      this.logger.info('[instructorService] getAllInstructors success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getAllInstructors error');
      throw error;
    }
  }

  async getInstructorById(id, includeAcademies = false) {
    this.logger.info('[instructorService] getInstructorById start');
    try {
      const instructor = await this.instructorRepository.findByIdWithAcademies(id, includeAcademies);
      this.logger.info('[instructorService] getInstructorById success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorById error');
      throw error;
    }
  }

  async createInstructor(data) {
    this.logger.info('[instructorService] createInstructor start');
    try {
      const instructor = await this.instructorRepository.createInstructor(data);
      this.logger.info('[instructorService] createInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] createInstructor error');
      throw error;
    }
  }

  async updateInstructor(id, data) {
    this.logger.info('[instructorService] updateInstructor start');
    try {
      const instructor = await this.instructorRepository.updateInstructor(id, data);
      this.logger.info('[instructorService] updateInstructor success');
      return instructor;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] updateInstructor error');
      throw error;
    }
  }

  async deleteInstructor(id) {
    this.logger.info('[instructorService] deleteInstructor start');
    try {
      const result = await this.instructorRepository.deleteInstructor(id);
      this.logger.info('[instructorService] deleteInstructor success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] deleteInstructor error');
      throw error;
    }
  }

  async searchInstructorByName(name) {
    this.logger.info('[instructorService] searchInstructorByName start');
    try {
      const instructors = await this.instructorRepository.findByName(name);
      this.logger.info('[instructorService] searchInstructorByName success');
      return instructors;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] searchInstructorByName error');
      throw error;
    }
  }

  async getInstructorsByJobTitle(jobTitle) {
    this.logger.info('[instructorService] getInstructorsByJobTitle start');
    try {
      const instructors = await this.instructorRepository.findByJobTitle(jobTitle);
      this.logger.info('[instructorService] getInstructorsByJobTitle success');
      return instructors;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorsByJobTitle error');
      throw error;
    }
  }

  async getAvailableInstructorsForAcademy(academyId) {
    this.logger.info('[instructorService] getAvailableInstructorsForAcademy start');
    try {
      const instructors = await this.instructorRepository.findAvailableForAcademy(academyId);
      this.logger.info('[instructorService] getAvailableInstructorsForAcademy success');
      return instructors;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getAvailableInstructorsForAcademy error');
      throw error;
    }
  }

  async getInstructorsByAcademyId(academyId) {
    this.logger.info('[instructorService] getInstructorsByAcademyId start');
    try {
      const instructors = await this.instructorRepository.findByAcademyId(academyId);
      this.logger.info('[instructorService] getInstructorsByAcademyId success');
      return instructors;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorsByAcademyId error');
      throw error;
    }
  }

  async getAcademiesByInstructorId(instructorId) {
    this.logger.info('[instructorService] getAcademiesByInstructorId start');
    try {
      const academies = await this.instructorRepository.findAcademiesByInstructorId(instructorId);
      this.logger.info('[instructorService] getAcademiesByInstructorId success');
      return academies;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getAcademiesByInstructorId error');
      throw error;
    }
  }

  async getPopularInstructors(limit = 10) {
    this.logger.info('[instructorService] getPopularInstructors start');
    try {
      const instructors = await this.instructorRepository.findPopularInstructors(limit);
      this.logger.info('[instructorService] getPopularInstructors success');
      return instructors;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getPopularInstructors error');
      throw error;
    }
  }

  async assignInstructorToAcademy(academyId, instructorId, instructorOrder = null) {
    this.logger.info('[instructorService] assignInstructorToAcademy start');
    throw new Error('This feature is not available yet');
  }

  async removeInstructorFromAcademy(academyId, instructorId) {
    this.logger.info('[instructorService] removeInstructorFromAcademy start');
    throw new Error('This feature is not available yet');
  }

  async reorderInstructorsInAcademy(academyId, orderData) {
    this.logger.info({ academyId }, '[instructorService] reorderInstructorsInAcademy start');
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async batchAssignInstructors(academyId, instructorIds) {
    this.logger.info(
      { academyId, count: Array.isArray(instructorIds) ? instructorIds.length : 0 },
      '[instructorService] batchAssignInstructors start',
    );
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async batchRemoveInstructors(academyId, instructorIds) {
    this.logger.info(
      { academyId, count: Array.isArray(instructorIds) ? instructorIds.length : 0 },
      '[instructorService] batchRemoveInstructors start',
    );
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

  async getAssignmentDetail(academyId, instructorId) {
    this.logger.info({ academyId, instructorId }, '[instructorService] getAssignmentDetail start');
    throw new Error('AcademyInstructorRepository belum diimplementasikan');
  }

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
      };
      this.logger.info('[instructorService] getInstructorStats success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[instructorService] getInstructorStats error');
      throw error;
    }
  }

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

  enhanceAcademyObject(academy) {
    return {
      ...academy,
      category_badge: this.getCategoryBadge(academy.category),
      status_badge: this.getStatusBadge(academy.status),
      duration_formatted: this.formatDuration(academy.duration),
      rating_display: this.formatRating(academy.rating),
      url: `/academy/${academy.slug}`,
    };
  }

  enhanceAssignmentObject(assignment) {
    return {
      ...assignment,
      display_order: `#${assignment.instructor_order}`,
      assignment_type: 'Primary Instructor',
      created_at_formatted: assignment.created_at ? this.formatDate(assignment.created_at) : null,
    };
  }

  calculateProfileCompleteness(instructor) {
    let score = 0;

    if (instructor.name) score += 25;
    if (instructor.job_title) score += 25;
    if (instructor.description) score += 25;
    if (instructor.avatar_url) score += 25;

    return score;
  }

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

  getDisplayName(instructor) {
    return instructor.job_title ? `${instructor.name} - ${instructor.job_title}` : instructor.name;
  }

  getShortDescription(description) {
    if (!description) return '';
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatDuration(duration) {
    return duration || 'Flexible';
  }

  formatRating(rating) {
    if (!rating || rating === 0) return 'Belum ada rating';
    return `⭐ ${rating.toFixed(1)}`;
  }

  getCategoryBadge(category) {
    if (!category) return '📚 General';
    return `📚 ${category}`;
  }

  getStatusBadge(status) {
    const badges = {
      ACTIVE: '🟢 Active',
      DRAFT: '🟡 Draft',
      ARCHIVED: '🔴 Archived',
    };
    return badges[status] || `${status}`;
  }

  calculateEngagementScore(instructorStats, assignmentStats) {
    if (instructorStats.total_instructors === 0) return 0;

    const profileScore = instructorStats.profile_completion_rate;
    const activityScore =
      assignmentStats.unique_instructors_with_academies > 0
        ? (assignmentStats.unique_instructors_with_academies / instructorStats.total_instructors) * 100
        : 0;

    return Math.round((profileScore + activityScore) / 2);
  }

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

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const instructorService = new InstructorService();
