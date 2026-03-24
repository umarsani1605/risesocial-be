import { academyService } from '../../services/shared/academyService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserAcademyController {
  async getAcademys(request, reply) {
    try {
      request.log.info('[userAcademyController] getAcademys start');
      request.log.debug({ query: request.query }, '[userAcademyController] rawQuery');
      const result = await academyService.getAllAcademies(request.query);
      request.log.info('[userAcademyController] getAcademys success');

      if (result.meta) {
        return reply.send(successResponse(result.data, 'Academies retrieved successfully', result.meta));
      } else {
        return reply.send(successResponse(result.data, 'Academies retrieved successfully'));
      }
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAcademys error');
      return reply.status(500).send(errorResponse('Failed to fetch academies', 500, error.message));
    }
  }

  async getAcademyBySlug(request, reply) {
    try {
      const { slug } = request.params;
      request.log.info('[userAcademyController] getAcademyBySlug start');
      request.log.info({ params: request.params }, '[userAcademyController] rawParams');

      const academy = await academyService.getAcademyBySlug(slug);
      academy.active_cohort = academy.cohorts?.[0] ?? null;
      delete academy.cohorts;

      return reply.send(successResponse(academy, 'Academy retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAcademyBySlug error');
      request.log.info({ statusCode: error.statusCode, type: typeof error.statusCode }, '[DEBUG] error.statusCode');

      if (error.statusCode === 404) {
        request.log.info({ slug }, '[userAcademyController] getAcademyBySlug not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch academy', 500, error.message));
    }
  }

  // Get all pricing tiers
  async getAllPricing(request, reply) {
    try {
      const { academy_id } = request.query;
      request.log.info({ academy_id }, '[userAcademyController] getAllPricing start');

      const pricing = await academyService.getAllPricing(academy_id);

      return reply.send(successResponse(pricing, 'Pricing retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllPricing error');
      return reply.status(500).send(errorResponse('Failed to fetch pricing', 500, error.message));
    }
  }

  // Get all features
  async getAllFeatures(request, reply) {
    try {
      const { academy_id } = request.query;
      request.log.info({ academy_id }, '[userAcademyController] getAllFeatures start');

      const features = await academyService.getAllFeatures(academy_id);

      return reply.send(successResponse(features, 'Features retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllFeatures error');
      return reply.status(500).send(errorResponse('Failed to fetch features', 500, error.message));
    }
  }

  // Get all instructors
  async getAllInstructors(request, reply) {
    try {
      const { academy_id } = request.query;
      request.log.info({ academy_id }, '[userAcademyController] getAllInstructors start');

      const instructors = await academyService.getAllInstructors(academy_id);

      return reply.send(successResponse(instructors, 'Instructors retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllInstructors error');
      return reply.status(500).send(errorResponse('Failed to fetch instructors', 500, error.message));
    }
  }

  // Get all themes
  async getAllThemes(request, reply) {
    try {
      const { academy_id, include_topics } = request.query;
      request.log.info({ academy_id, include_topics }, '[userAcademyController] getAllThemes start');

      const themes = await academyService.getAllThemes(academy_id, include_topics === 'true');

      return reply.send(successResponse(themes, 'Themes retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllThemes error');
      return reply.status(500).send(errorResponse('Failed to fetch themes', 500, error.message));
    }
  }

  // Get all topics
  async getAllTopics(request, reply) {
    try {
      const { academy_id, theme_id } = request.query;
      request.log.info({ academy_id, theme_id }, '[userAcademyController] getAllTopics start');

      const topics = await academyService.getAllTopics(academy_id, theme_id);

      return reply.send(successResponse(topics, 'Topics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllTopics error');
      return reply.status(500).send(errorResponse('Failed to fetch topics', 500, error.message));
    }
  }

  // Get all testimonials
  async getAllTestimonials(request, reply) {
    try {
      const { academy_id } = request.query;
      request.log.info({ academy_id }, '[userAcademyController] getAllTestimonials start');

      const testimonials = await academyService.getAllTestimonials(academy_id);

      return reply.send(successResponse(testimonials, 'Testimonials retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllTestimonials error');
      return reply.status(500).send(errorResponse('Failed to fetch testimonials', 500, error.message));
    }
  }

  // Get all FAQs
  async getAllFaqs(request, reply) {
    try {
      const { academy_id } = request.query;
      request.log.info({ academy_id }, '[userAcademyController] getAllFaqs start');

      const faqs = await academyService.getAllFaqs(academy_id);

      return reply.send(successResponse(faqs, 'FAQs retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[userAcademyController] getAllFaqs error');
      return reply.status(500).send(errorResponse('Failed to fetch FAQs', 500, error.message));
    }
  }
}

export const userAcademyController = new UserAcademyController();
