import { adminCohortController } from '../../controllers/admin/cohortController.js';
import { createUploadMiddleware } from '../../middleware/uploadMiddleware.js';

const uploadInstructorAvatar = createUploadMiddleware('instructor_avatar');
const uploadCohortAttachment = createUploadMiddleware('cohort_attachment');
import {
  getAdminCohortsSchema,
  getAdminCohortByIdSchema,
  createCohortSchema,
  updateCohortSchema,
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
  generateCertificatesSchema,
} from '../../schemas/admin/cohortSchemas.js';

export default async function adminCohortRoutes(fastify) {
  // --- Cohort CRUD ---
  fastify.get('/', { schema: getAdminCohortsSchema, handler: adminCohortController.getAllCohorts });
  fastify.get('/:id', { schema: getAdminCohortByIdSchema, handler: adminCohortController.getCohortById });
  fastify.post('/', { schema: createCohortSchema, handler: adminCohortController.createCohort });
  fastify.put('/:id', { schema: updateCohortSchema, handler: adminCohortController.updateCohort });
  fastify.delete('/:id', { schema: deleteCohortSchema, handler: adminCohortController.deleteCohort });

  // --- Module management ---
  fastify.post('/:id/modules', { schema: createModuleSchema, handler: adminCohortController.createModule });
  fastify.put('/:id/modules/:moduleId', { schema: updateModuleSchema, handler: adminCohortController.updateModule });
  fastify.delete('/:id/modules/:moduleId', { schema: deleteModuleSchema, handler: adminCohortController.deleteModule });

  // --- Attachment management ---
  fastify.post('/:id/modules/:moduleId/attachments', { schema: createAttachmentSchema, preHandler: [uploadCohortAttachment], handler: adminCohortController.createAttachment });
  fastify.put('/:id/modules/:moduleId/attachments/:attachmentId', { schema: updateAttachmentSchema, handler: adminCohortController.updateAttachment });
  fastify.delete('/:id/modules/:moduleId/attachments/:attachmentId', { schema: deleteAttachmentSchema, handler: adminCohortController.deleteAttachment });

  // --- Enrollment management ---
  fastify.get('/:id/enrollments', { schema: getEnrollmentsSchema, handler: adminCohortController.getEnrollments });
  fastify.post('/:id/enrollments', { schema: manualEnrollSchema, handler: adminCohortController.manualEnroll });
  fastify.put('/:id/enrollments/:enrollmentId', { schema: updateEnrollmentSchema, handler: adminCohortController.updateEnrollment });

  // --- Mentor management ---
  fastify.post('/:id/mentors', { schema: createMentorSchema, preHandler: [uploadInstructorAvatar], handler: adminCohortController.createMentor });
  fastify.put('/:id/mentors/:mentorId', { schema: updateMentorSchema, preHandler: [uploadInstructorAvatar], handler: adminCohortController.updateMentor });
  fastify.delete('/:id/mentors/:mentorId', { schema: deleteMentorSchema, handler: adminCohortController.deleteMentor });

  // --- Certificate generation ---
  fastify.post('/:id/certificates/generate', { schema: generateCertificatesSchema, handler: adminCohortController.generateCertificates });
}
