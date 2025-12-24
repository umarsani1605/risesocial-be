import { enrollmentRepository } from '../repositories/enrollmentRepository.js';
import { getLogger } from '../lib/loggerContext.js';

class EnrollmentService {
  constructor() {
    this.enrollmentRepository = enrollmentRepository;
  }

  get logger() {
    return getLogger();
  }

  async getAllEnrollments(options = {}) {
    this.logger.info('[enrollmentService] getAllEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.findAllWithDetails(options);
      const result = {
        data: enrollments.data,
        pagination: enrollments.pagination,
      };
      this.logger.info('[enrollmentService] getAllEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getAllEnrollments error');
      throw error;
    }
  }

  async getEnrollmentById(id) {
    this.logger.info({ id }, '[enrollmentService] getEnrollmentById start');
    try {
      const enrollment = await this.enrollmentRepository.findById(id);
      if (!enrollment) {
        const err = new Error('Enrollment tidak ditemukan');
        throw err;
      }
      this.logger.info('[enrollmentService] getEnrollmentById success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getEnrollmentById error');
      throw error;
    }
  }

  async getEnrollmentByUserAndAcademy(userId, academyId) {
    this.logger.info({ userId, academyId }, '[enrollmentService] getEnrollmentByUserAndAcademy start');
    try {
      const enrollment = await this.enrollmentRepository.findByUserAndAcademy(userId, academyId);
      if (!enrollment) {
        const err = new Error('Enrollment tidak ditemukan');
        throw err;
      }
      this.logger.info('[enrollmentService] getEnrollmentByUserAndAcademy success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getEnrollmentByUserAndAcademy error');
      throw error;
    }
  }

  async getUserEnrollments(userId, options = {}) {
    this.logger.info({ userId }, '[enrollmentService] getUserEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.findByUserId(userId, options);
      const result = {
        data: enrollments.data,
        pagination: enrollments.pagination,
      };
      this.logger.info('[enrollmentService] getUserEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getUserEnrollments error');
      throw error;
    }
  }

  async getAcademyEnrollments(academyId, options = {}) {
    this.logger.info({ academyId }, '[enrollmentService] getAcademyEnrollments start');
    try {
      const enrollments = await this.enrollmentRepository.findByAcademyId(academyId, options);
      const result = {
        data: enrollments.data,
        pagination: enrollments.pagination,
      };
      this.logger.info('[enrollmentService] getAcademyEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getAcademyEnrollments error');
      throw error;
    }
  }

  async createEnrollment(data) {
    this.logger.info('[enrollmentService] createEnrollment start');
    try {
      const validation = await this.enrollmentRepository.validateEnrollment(data);
      if (!validation.valid) {
        const err = new Error(validation.message);
        throw err;
      }
      const enrollment = await this.enrollmentRepository.createEnrollment(data);
      this.logger.info('[enrollmentService] createEnrollment success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] createEnrollment error');
      throw error;
    }
  }

  async updateProgress(enrollmentId, progressPercentage) {
    this.logger.info({ enrollmentId }, '[enrollmentService] updateProgress start');
    try {
      const enrollment = await this.enrollmentRepository.updateProgress(enrollmentId, progressPercentage);
      this.logger.info('[enrollmentService] updateProgress success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] updateProgress error');
      throw error;
    }
  }

  async updateStatus(enrollmentId, status) {
    this.logger.info({ enrollmentId, status }, '[enrollmentService] updateStatus start');
    try {
      const enrollment = await this.enrollmentRepository.updateStatus(enrollmentId, status);
      this.logger.info('[enrollmentService] updateStatus success');
      return enrollment;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] updateStatus error');
      throw error;
    }
  }

  async getEnrollmentStats(options = {}) {
    this.logger.info('[enrollmentService] getEnrollmentStats start');
    try {
      const stats = await this.enrollmentRepository.getEnrollmentStats(options);
      this.logger.info('[enrollmentService] getEnrollmentStats success');
      return stats;
    } catch (error) {
      this.logger.error({ err: error }, '[enrollmentService] getEnrollmentStats error');
      throw error;
    }
  }
}

export const enrollmentService = new EnrollmentService();
