import { adminCohortController } from '../../controllers/admin/cohortController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';
import {
  getAdminCohortsSchema,
  getAdminCohortByIdSchema,
  createCohortSchema,
  updateCohortSchema,
  completeCohortSchema,
  deleteCohortSchema,
  createModuleSchema,
  updateModuleSchema,
  deleteModuleSchema,
  createAttachmentSchema,
  updateAttachmentSchema,
  deleteAttachmentSchema,
  getEnrollmentsSchema,
  manualEnrollSchema,
  updateEnrollmentSchema,
  createMentorSchema,
  updateMentorSchema,
  deleteMentorSchema,
  generateCertificateSchema,
} from '../../schemas/admin/cohortSchemas.js';

const uploadInstructorAvatar = createUploadMiddleware('instructor_avatar');
const uploadCohortAttachment = createUploadMiddleware('cohort_attachment');

const VIEW = requirePermission('admin.cohort');
const EDIT = requirePermission('admin.cohort', 'EDITOR');

export default async function adminCohortRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  // Cohort CRUD
  fastify.get('/', { schema: getAdminCohortsSchema, preHandler: VIEW, handler: adminCohortController.getAllCohorts });
  fastify.get('/:id', { schema: getAdminCohortByIdSchema, preHandler: VIEW, handler: adminCohortController.getCohortById });
  fastify.post('/', { schema: createCohortSchema, preHandler: EDIT, handler: adminCohortController.createCohort });
  fastify.put('/:id', { schema: updateCohortSchema, preHandler: EDIT, handler: adminCohortController.updateCohort });
  fastify.post('/:id/complete', { schema: completeCohortSchema, preHandler: EDIT, handler: adminCohortController.completeCohort });
  fastify.delete('/:id', { schema: deleteCohortSchema, preHandler: EDIT, handler: adminCohortController.deleteCohort });

  // Modules
  fastify.post('/:id/modules', { schema: createModuleSchema, preHandler: EDIT, handler: adminCohortController.createModule });
  fastify.put('/:id/modules/:moduleId', { schema: updateModuleSchema, preHandler: EDIT, handler: adminCohortController.updateModule });
  fastify.delete('/:id/modules/:moduleId', { schema: deleteModuleSchema, preHandler: EDIT, handler: adminCohortController.deleteModule });

  // Attachments (permission check runs before upload processing)
  fastify.post('/:id/modules/:moduleId/attachments', { schema: createAttachmentSchema, preHandler: [EDIT, uploadCohortAttachment], handler: adminCohortController.createAttachment });
  fastify.put('/:id/modules/:moduleId/attachments/:attachmentId', { schema: updateAttachmentSchema, preHandler: EDIT, handler: adminCohortController.updateAttachment });
  fastify.delete('/:id/modules/:moduleId/attachments/:attachmentId', { schema: deleteAttachmentSchema, preHandler: EDIT, handler: adminCohortController.deleteAttachment });

  // Enrollments
  fastify.get('/:id/enrollments', { schema: getEnrollmentsSchema, preHandler: VIEW, handler: adminCohortController.getEnrollments });
  fastify.post('/:id/enrollments', { schema: manualEnrollSchema, preHandler: EDIT, handler: adminCohortController.manualEnroll });
  fastify.put('/:id/enrollments/:enrollmentId', { schema: updateEnrollmentSchema, preHandler: EDIT, handler: adminCohortController.updateEnrollment });

  // Mentors
  fastify.post('/:id/mentors', { schema: createMentorSchema, preValidation: [uploadInstructorAvatar], preHandler: EDIT, handler: adminCohortController.createMentor });
  fastify.put('/:id/mentors/:mentorId', { schema: updateMentorSchema, preValidation: [uploadInstructorAvatar], preHandler: EDIT, handler: adminCohortController.updateMentor });
  fastify.delete('/:id/mentors/:mentorId', { schema: deleteMentorSchema, preHandler: EDIT, handler: adminCohortController.deleteMentor });

  // Certificate generation
  fastify.post('/:id/placements/:placementId/certificate', { schema: generateCertificateSchema, preHandler: EDIT, handler: adminCohortController.generateCertificate });
}
