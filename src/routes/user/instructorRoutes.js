import { userInstructorController } from '../../controllers/user/instructorController.js';
import {
  getAllInstructorsSchema,
  getInstructorByIdSchema,
  searchInstructorByNameSchema,
  getPopularInstructorsSchema,
  getInstructorsByJobTitleSchema,
  getInstructorsByAcademyIdSchema,
  getAcademiesByInstructorIdSchema,
} from '../../schemas/instructorSchemas.js';

export default async function userInstructorRoutes(fastify) {
  fastify.get('/', { schema: getAllInstructorsSchema }, userInstructorController.getAllInstructors);
  fastify.get('/search', { schema: searchInstructorByNameSchema }, userInstructorController.searchInstructorByName);
  fastify.get('/popular', { schema: getPopularInstructorsSchema }, userInstructorController.getPopularInstructors);
  fastify.get('/by-job-title', { schema: getInstructorsByJobTitleSchema }, userInstructorController.getInstructorsByJobTitle);
  fastify.get('/academy/:academyId', { schema: getInstructorsByAcademyIdSchema }, userInstructorController.getInstructorsByAcademyId);
  fastify.get('/:id', { schema: getInstructorByIdSchema }, userInstructorController.getInstructorById);
  fastify.get('/:instructorId/academies', { schema: getAcademiesByInstructorIdSchema }, userInstructorController.getAcademiesByInstructorId);
}
