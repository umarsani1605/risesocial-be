import { academyService } from '../../services/shared/academyService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class UserAcademyController {
  async getAcademys(request, reply) {
    try {
      const result = await academyService.getAllAcademies(request.query);

      if (result.meta) {
        return reply.send(successResponse(result.data, 'Academies retrieved successfully', result.meta));
      } else {
        return reply.send(successResponse(result.data, 'Academies retrieved successfully'));
      }
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch academies', 500, error.message));
    }
  }

  async getAcademyBySlug(request, reply) {
    try {
      const { slug } = request.params;

      const academy = await academyService.getAcademyBySlug(slug);
      academy.has_cohort = (academy.cohorts?.length ?? 0) > 0;
      delete academy.cohorts;

      return reply.send(successResponse(academy, 'Academy retrieved successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch academy', 500, error.message));
    }
  }

  // Get all pricing tiers
  async getAllPricing(request, reply) {
    try {
      const { academy_id } = request.query;

      const pricing = await academyService.getAllPricing(academy_id);

      return reply.send(successResponse(pricing, 'Pricing retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch pricing', 500, error.message));
    }
  }

  // Get all features
  async getAllFeatures(request, reply) {
    try {
      const { academy_id } = request.query;

      const features = await academyService.getAllFeatures(academy_id);

      return reply.send(successResponse(features, 'Features retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch features', 500, error.message));
    }
  }

  // Get all instructors
  async getAllInstructors(request, reply) {
    try {
      const { academy_id } = request.query;

      const instructors = await academyService.getAllInstructors(academy_id);

      return reply.send(successResponse(instructors, 'Instructors retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch instructors', 500, error.message));
    }
  }

  // Get all themes
  async getAllThemes(request, reply) {
    try {
      const { academy_id, include_topics } = request.query;

      const themes = await academyService.getAllThemes(academy_id, include_topics === 'true');

      return reply.send(successResponse(themes, 'Themes retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch themes', 500, error.message));
    }
  }

  // Get all topics
  async getAllTopics(request, reply) {
    try {
      const { academy_id, theme_id } = request.query;

      const topics = await academyService.getAllTopics(academy_id, theme_id);

      return reply.send(successResponse(topics, 'Topics retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch topics', 500, error.message));
    }
  }

  // Get all testimonials
  async getAllTestimonials(request, reply) {
    try {
      const { academy_id } = request.query;

      const testimonials = await academyService.getAllTestimonials(academy_id);

      return reply.send(successResponse(testimonials, 'Testimonials retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch testimonials', 500, error.message));
    }
  }

  // Get all FAQs
  async getAllFaqs(request, reply) {
    try {
      const { academy_id } = request.query;

      const faqs = await academyService.getAllFaqs(academy_id);

      return reply.send(successResponse(faqs, 'FAQs retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch FAQs', 500, error.message));
    }
  }
}

export const userAcademyController = new UserAcademyController();
