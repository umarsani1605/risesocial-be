import { userCohortRepository } from '../../repositories/user/cohortRepository.js';
import { midtransService } from '../shared/MidtransService.js';
import { generateTransactionCode, TRANSACTION_CODE_CONFIG } from '../../constants/paymentHelpers.js';
import { getLogger } from '../../utils/loggerContext.js';
import { toFileUrl } from '../../utils/response.js';
import prisma from '../../config/database.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      // Compute next_session and module progress for each enrollment
      const now = new Date();
      result.data = await Promise.all(
        result.data.map(async (enrollment) => {
          const [nextModule, completedModules, certificate] = await Promise.all([
            prisma.cohortModule.findFirst({
              where: {
                cohort_id: enrollment.cohort_id,
                is_published: true,
                session_start_time: { gt: now },
              },
              orderBy: { session_start_time: 'asc' },
              select: { session_start_time: true },
            }),
            this.repository.countCompletedModules(enrollment.cohort_id),
            prisma.cohortCertificate.findFirst({
              where: { enrollment_id: enrollment.id },
              select: { id: true, file_path: true },
            }),
          ]);

          const { _count, ...cohortWithoutCount } = enrollment.cohort;

          return {
            ...enrollment,
            cohort: cohortWithoutCount,
            next_session: nextModule?.session_start_time?.toISOString() || null,
            total_modules: _count.modules,
            completed_modules: completedModules,
            has_certificate: !!certificate,
            certificate_url: toFileUrl(certificate?.file_path) ?? null,
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

      this.logger.info('[userCohortService] getCohortModules success');
      return modules;
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
      return module;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCohortModuleById error');
      throw error;
    }
  }

  async getUpcomingSessions(userId, limit = 7) {
    this.logger.info('[userCohortService] getUpcomingSessions start');
    try {
      const now = new Date();
      const modules = await this.repository.findUpcomingModulesForUser(userId, limit * 2);
      const expanded = [];

      for (const [index, mod] of modules.entries()) {
        const baseLink = `/dashboard/academy/${mod.cohort_id}#module-${index + 1}`;

        if (mod.session_start_time && new Date(mod.session_start_time) > now) {
          expanded.push({
            id: mod.id,
            type: 'session',
            title: mod.title,
            link: baseLink,
            cohort_id: mod.cohort_id,
            sort_key: mod.session_start_time,
            session_start_time: mod.session_start_time.toISOString(),
            session_end_time: mod.session_end_time?.toISOString() ?? null,
            assignment_deadline: null,
          });
        }

        if (mod.assignment_deadline && new Date(mod.assignment_deadline) > now) {
          expanded.push({
            id: mod.id,
            type: 'assignment',
            title: mod.title,
            link: mod.assignment_link ?? baseLink,
            cohort_id: mod.cohort_id,
            sort_key: mod.assignment_deadline,
            session_start_time: null,
            session_end_time: null,
            assignment_deadline: mod.assignment_deadline.toISOString(),
          });
        }
      }

      expanded.sort((a, b) => new Date(a.sort_key) - new Date(b.sort_key));
      const results = expanded.slice(0, limit).map(({ sort_key, ...item }) => item);

      this.logger.info('[userCohortService] getUpcomingSessions success');
      return results;
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getUpcomingSessions error');
      throw error;
    }
  }

  async getCertificateInfo(cohortId, userId) {
    this.logger.info('[userCohortService] getCertificateInfo start');
    try {
      const cert = await this.repository.findCertificateByCohortAndUser(cohortId, userId);
      if (!cert?.file_path) return null;
      this.logger.info('[userCohortService] getCertificateInfo success');
      return { certificate_url: toFileUrl(cert.file_path) };
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] getCertificateInfo error');
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
        grades_transcript: cert.grades_transcript,
        issued_at: cert.created_at,
        file_url: toFileUrl(cert.file_path),
      };
    } catch (error) {
      this.logger.error({ err: error }, '[userCohortService] verifyCertificate error');
      throw error;
    }
  }
}

export const userCohortService = new UserCohortService();
