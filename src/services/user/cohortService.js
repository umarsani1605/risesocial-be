import { userCohortRepository } from '../../repositories/user/cohortRepository.js';
import { buildAssetUrl } from '../../utils/assetUrl.js';
import prisma from '../../config/database.js';

export class UserCohortService {
  constructor() {
    this.repository = userCohortRepository;
  }


  async getCohorts(params) {
    try {
      const result = await this.repository.findPublicWithPagination(params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCohortById(id) {
    try {
      const cohort = await this.repository.findByIdPublic(id);
      if (!cohort) {
        const err = new Error('Cohort not found');
        err.statusCode = 404;
        throw err;
      }
      return cohort;
    } catch (error) {
      throw error;
    }
  }

  async getCohortStudents(cohortId) {
    try {
      const students = await this.repository.findStudentsByCohort(cohortId);
      return students;
    } catch (error) {
      throw error;
    }
  }

  async getMyEnrollments(userId, params) {
    try {
      const result = await this.repository.findUserEnrollments(userId, params);

      const now = new Date();
      result.data = await Promise.all(
        result.data.map(async (enrollment) => {
          const cohort = enrollment.placement?.cohort ?? null;
          const cohortId = enrollment.placement?.cohort_id ?? null;

          const [nextModule, completedModules, certificate] = await Promise.all([
            cohortId
              ? prisma.cohortModule.findFirst({
                  where: { cohort_id: cohortId, is_published: true, session_start_time: { gt: now } },
                  orderBy: { session_start_time: 'asc' },
                  select: { session_start_time: true },
                })
              : Promise.resolve(null),
            cohortId ? this.repository.countCompletedModules(cohortId) : Promise.resolve(0),
            cohortId
              ? prisma.cohortCertificate.findFirst({
                  where: { cohort_id: cohortId, user_id: enrollment.user_id },
                  select: { id: true, file_path: true, created_at: true },
                })
              : Promise.resolve(null),
          ]);

          if (!cohort) {
            return {
              ...enrollment,
              placement: undefined,
              academy: enrollment.academy,
              cohort: null,
              next_session: null,
              total_modules: 0,
              completed_modules: 0,
              has_certificate: false,
              certificate_url: null,
            };
          }

          const { _count, ...cohortWithoutCount } = cohort;

          return {
            ...enrollment,
            placement: undefined,
            academy: enrollment.academy,
            cohort: cohortWithoutCount,
            next_session: nextModule?.session_start_time?.toISOString() || null,
            total_modules: _count?.modules ?? 0,
            completed_modules: completedModules,
            has_certificate: !!certificate,
            certificate_url: buildAssetUrl(certificate?.file_path, certificate?.created_at) ?? null,
          };
        }),
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCohortModules(cohortId, userId) {
    try {
      const placement = await this.repository.findPlacementByUserCohort(userId, cohortId);
      if (!placement) {
        const err = new Error('You are not enrolled in this cohort');
        err.statusCode = 403;
        throw err;
      }

      const modules = await this.repository.findPublishedModules(cohortId);

      return modules;
    } catch (error) {
      throw error;
    }
  }

  async getCohortModuleById(cohortId, moduleId, userId) {
    try {
      const placement = await this.repository.findPlacementByUserCohort(userId, cohortId);
      if (!placement) {
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

      return module;
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingSessions(userId, limit = 7) {
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

      return results;
    } catch (error) {
      throw error;
    }
  }

  async getCertificateInfo(cohortId, userId) {
    try {
      const cert = await this.repository.findCertificateByCohortAndUser(cohortId, userId);
      if (!cert?.file_path) return null;
      return { certificate_url: buildAssetUrl(cert.file_path, cert.created_at) };
    } catch (error) {
      throw error;
    }
  }

  async downloadCertificate(cohortId, userId) {
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

      const url = buildAssetUrl(cert.file_path, cert.created_at);
      if (!url) {
        const err = new Error('Certificate file unavailable');
        err.statusCode = 404;
        throw err;
      }

      return { url, cert };
    } catch (error) {
      throw error;
    }
  }

  async verifyCertificate(code) {
    try {
      const cert = await this.repository.findCertificateByCode(code);
      if (!cert) {
        const err = new Error('Certificate not found');
        err.statusCode = 404;
        throw err;
      }

      return {
        certificate_code: cert.certificate_code,
        student_name: cert.student_name,
        academy_title: cert.academy_title,
        cohort_name: cert.cohort_name,
        grades_transcript: cert.grades_transcript,
        issued_at: cert.created_at,
        file_url: buildAssetUrl(cert.file_path, cert.created_at),
      };
    } catch (error) {
      throw error;
    }
  }
}

export const userCohortService = new UserCohortService();
