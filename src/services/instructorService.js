import { getLogger } from '../lib/loggerContext.js';
import { instructorRepository } from '../repositories/instructorRepository.js';

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
}

export const instructorService = new InstructorService();
