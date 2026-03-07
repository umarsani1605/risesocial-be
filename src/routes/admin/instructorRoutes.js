import { adminInstructorController } from '../../controllers/admin/instructorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadMiddleware } from '../../middleware/fileUploadMiddleware.js';
import {
  adminCreateInstructorSchema,
  adminUpdateInstructorSchema,
  adminDeleteInstructorSchema,
  getAvailableInstructorsForAcademySchema,
  assignInstructorToAcademySchema,
  removeInstructorFromAcademySchema,
  getInstructorStatsSchema,
  uploadInstructorAvatarSchema,
} from '../../schemas/shared/instructorSchemas.js';

export default async function adminInstructorRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/', {
    schema: adminCreateInstructorSchema,
    handler: adminInstructorController.createInstructor,
  });

  fastify.put('/:id', {
    schema: adminUpdateInstructorSchema,
    handler: adminInstructorController.updateInstructor,
  });

  fastify.delete('/:id', {
    schema: adminDeleteInstructorSchema,
    handler: adminInstructorController.deleteInstructor,
  });

  fastify.get('/available/:academyId', {
    schema: getAvailableInstructorsForAcademySchema,
    handler: adminInstructorController.getAvailableInstructorsForAcademy,
  });

  fastify.post('/assign/:academyId', {
    schema: assignInstructorToAcademySchema,
    handler: adminInstructorController.assignInstructorToAcademy,
  });

  fastify.delete('/remove/:academyId/:instructorId', {
    schema: removeInstructorFromAcademySchema,
    handler: adminInstructorController.removeInstructorFromAcademy,
  });

  fastify.get('/statistics', {
    schema: getInstructorStatsSchema,
    handler: adminInstructorController.getInstructorStats,
  });

  fastify.post('/:id/avatar', {
    schema: uploadInstructorAvatarSchema,
    preHandler: [uploadMiddleware],
    handler: adminInstructorController.uploadInstructorAvatar,
  });
}
