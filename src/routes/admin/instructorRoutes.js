import { adminInstructorController } from '../../controllers/admin/instructorController.js';
import { authMiddleware } from '../../middleware/auth.js';
import { uploadMiddleware } from '../../middleware/fileUploadMiddleware.js';
import {
  createInstructorSchema,
  updateInstructorSchema,
  deleteInstructorSchema,
  getInstructorStatsSchema,
  getAvailableInstructorsForAcademySchema,
  assignInstructorToAcademySchema,
  removeInstructorFromAcademySchema,
  uploadInstructorAvatarSchema,
} from '../../schemas/instructorSchemas.js';

export default async function adminInstructorRoutes(fastify) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/statistics', { schema: getInstructorStatsSchema }, adminInstructorController.getInstructorStats);
  fastify.get('/available/:academyId', { schema: getAvailableInstructorsForAcademySchema }, adminInstructorController.getAvailableInstructorsForAcademy);
  fastify.post('/', { schema: createInstructorSchema }, adminInstructorController.createInstructor);
  fastify.put('/:id', { schema: updateInstructorSchema }, adminInstructorController.updateInstructor);
  fastify.delete('/:id', { schema: deleteInstructorSchema }, adminInstructorController.deleteInstructor);
  fastify.post('/assign/:academyId', { schema: assignInstructorToAcademySchema }, adminInstructorController.assignInstructorToAcademy);
  fastify.delete('/remove/:academyId/:instructorId', { schema: removeInstructorFromAcademySchema }, adminInstructorController.removeInstructorFromAcademy);
  fastify.post('/:id/avatar', { schema: uploadInstructorAvatarSchema, preHandler: [uploadMiddleware] }, adminInstructorController.uploadInstructorAvatar);
}
