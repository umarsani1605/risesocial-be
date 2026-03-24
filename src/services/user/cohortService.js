import { userCohortRepository } from '../../repositories/user/cohortRepository.js';
import { midtransService } from '../shared/MidtransService.js';
import { generateTransactionCode, TRANSACTION_CODE_CONFIG } from '../../constants/paymentHelpers.js';
import { getLogger } from '../../utils/loggerContext.js';
import prisma from '../../config/database.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compute runtime module status based on is_published and session_timestamp
 */
export function computeModuleStatus(module, now = new Date()) {
  if (!module.is_published) return 'hidden';
  if (!module.session_timestamp) return 'upcoming';

  const sessionTime = new Date(module.session_timestamp);
  const diffMs = sessionTime - now;
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes > 60) return 'upcoming';
  if (diffMinutes >= -120) return 'live'; // -2h to +1h window
  return 'completed';
}

export class UserCohortService {
  constructor() {
    this.repository = userCohortRepository;
    this.midtransService = midtransService;
  }

  get logger() {
    return getLogger();
  }

  async getCohorts(params) {
    this.logger.info('[userCohortService] getCohorts start');
    try {
      const result = await this.repository.findPublicWithPagination(params);
      this.logger.info('[userCohortService] getCohorts success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCohorts error');
      throw error;
    }
  }

  async getCohortById(id) {
    this.logger.info('[userCohortService] getCohortById start');
    try {
      const cohort = await this.repository.findByIdPublic(id);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }
      this.logger.info('[userCohortService] getCohortById success');
      return cohort;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCohortById error');
      throw error;
    }
  }

  async getCohortStudents(cohortId) {
    this.logger.info('[userCohortService] getCohortStudents start');
    try {
      const students = await this.repository.findStudentsByCohortId(cohortId);
      this.logger.info('[userCohortService] getCohortStudents success');
      return students;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCohortStudents error');
      throw error;
    }
  }

  async enrollInCohort(cohortId, userId) {
    this.logger.info('[userCohortService] enrollInCohort start');
    try {
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: { academy: { select: { id: true, title: true } } },
      });

      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }

      // Check duplicate enrollment
      const existing = await this.repository.findEnrollmentByUserAndCohort(userId, cohortId);
      if (existing) {
        const err = new Error('You are already enrolled in this cohort');
        err.statusCode = 400;
        throw err;
      }

      // Get user details for payment
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { first_name: true, last_name: true, email: true, phone: true },
      });

      const customerName = `${user.first_name} ${user.last_name}`.trim();

      // Generate transaction code
      const latestTx = await prisma.transaction.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
      const sequence = (latestTx?.id || 0) + 1;
      const transactionCode = generateTransactionCode(TRANSACTION_CODE_CONFIG.ACADEMY_PREFIX, sequence);

      // For now use 0 amount (cohort price to be added later)
      const amount = 0;

      let snapToken = null;
      let redirectUrl = null;
      let snapResponse = null;

      if (amount > 0) {
        const snapResult = await this.midtransService.createSnapTransaction({
          orderId: transactionCode,
          grossAmount: amount,
          customerDetails: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone || '',
          },
          itemDetails: [
            {
              id: `COHORT-${cohortId}`,
              name: `${cohort.academy.title} - ${cohort.name}`,
              price: amount,
              quantity: 1,
              category: 'Education',
            },
          ],
        });

        snapToken = snapResult.token;
        redirectUrl = snapResult.redirectUrl;
        snapResponse = snapResult;
      }

      const result = await this.repository.createEnrollmentWithPayment(cohortId, cohort.academy_id, userId, {
        transactionCode,
        amount,
        customerName,
        customerEmail: user.email,
        customerPhone: user.phone,
        snapToken: snapToken || 'FREE',
        redirectUrl: redirectUrl || null,
        snapResponse,
      });

      this.logger.info('[userCohortService] enrollInCohort success');
      return {
        enrollment_id: result.enrollment.id,
        snap_token: snapToken,
        redirect_url: redirectUrl,
        transaction_code: transactionCode,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] enrollInCohort error');
      throw error;
    }
  }

  async getMyEnrollments(userId, params) {
    this.logger.info('[userCohortService] getMyEnrollments start');
    try {
      const result = await this.repository.findUserEnrollments(userId, params);

      // Compute next_session for each enrollment
      const now = new Date();
      result.data = await Promise.all(
        result.data.map(async (enrollment) => {
          const nextModule = await prisma.cohortModule.findFirst({
            where: {
              cohort_id: enrollment.cohort_id,
              is_published: true,
              session_timestamp: { gt: now },
            },
            orderBy: { session_timestamp: 'asc' },
            select: { session_timestamp: true },
          });

          return {
            ...enrollment,
            next_session: nextModule?.session_timestamp?.toISOString() || null,
          };
        }),
      );

      this.logger.info('[userCohortService] getMyEnrollments success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getMyEnrollments error');
      throw error;
    }
  }

  async getCohortModules(cohortId, userId) {
    this.logger.info('[userCohortService] getCohortModules start');
    try {
      // Verify enrollment
      const enrollment = await this.repository.findActiveEnrollment(userId, cohortId);
      if (!enrollment) {
        const err = new Error('You are not enrolled in this cohort');
        err.statusCode = 403;
        throw err;
      }

      const modules = await this.repository.findPublishedModules(cohortId);
      const now = new Date();

      const result = modules.map((m) => ({ ...m, computed_status: computeModuleStatus(m, now) }));

      this.logger.info('[userCohortService] getCohortModules success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCohortModules error');
      throw error;
    }
  }

  async getCohortModuleById(cohortId, moduleId, userId) {
    this.logger.info('[userCohortService] getCohortModuleById start');
    try {
      const enrollment = await this.repository.findActiveEnrollment(userId, cohortId);
      if (!enrollment) {
        const err = new Error('You are not enrolled in this cohort');
        err.statusCode = 403;
        throw err;
      }

      const module = await this.repository.findPublishedModuleById(cohortId, moduleId);
      if (!module) {
        const err = new Error('Module not found');
        err.statusCode = 404;
        throw err;
      }

      this.logger.info('[userCohortService] getCohortModuleById success');
      return { ...module, computed_status: computeModuleStatus(module) };
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCohortModuleById error');
      throw error;
    }
  }

  async downloadCertificate(cohortId, userId) {
    this.logger.info('[userCohortService] downloadCertificate start');
    try {
      const cert = await this.repository.findCertificateByCohortAndUser(cohortId, userId);
      if (!cert) {
        const err = new Error('Certificate not found');
        err.statusCode = 404;
        throw err;
      }

      if (!cert.file_path) {
        const err = new Error('Certificate PDF not yet generated');
        err.statusCode = 404;
        throw err;
      }

      const absolutePath = path.join(__dirname, '../../../uploads', cert.file_path.replace(/^\/uploads\//, ''));
      if (!(await fs.pathExists(absolutePath))) {
        const err = new Error('Certificate file not found');
        err.statusCode = 404;
        throw err;
      }

      this.logger.info('[userCohortService] downloadCertificate success');
      return { absolutePath, cert };
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] downloadCertificate error');
      throw error;
    }
  }

  async verifyCertificate(code) {
    this.logger.info('[userCohortService] verifyCertificate start');
    try {
      const cert = await this.repository.findCertificateByCode(code);
      if (!cert) {
        const err = new Error('Certificate not found');
        err.statusCode = 404;
        throw err;
      }

      this.logger.info('[userCohortService] verifyCertificate success');
      return {
        certificate_code: cert.certificate_code,
        student_name: cert.student_name,
        academy_title: cert.academy_title,
        cohort_name: cert.cohort_name,
        issued_at: cert.issued_at,
        file_url: cert.file_url,
      };
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] verifyCertificate error');
      throw error;
    }
  }
}

export const userCohortService = new UserCohortService();
