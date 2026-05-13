import { adminAcademyService } from '../../services/admin/academyService.js';
import { academyService } from '../../services/shared/academyService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminAcademyController {
  async createAcademy(request, reply) {
    try {

      const createData = request.body || {};

      if (request.uploadedFile) {
        createData.imageFile = request.uploadedFile;
      }

      const academy = await adminAcademyService.createAcademy(createData);


      return reply.status(201).send(successResponse(academy, 'Academy created successfully'));
    } catch (error) {

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
        return reply.status(400).send(errorResponse('Telah ada academy dengan nama yang sama', 400));
      }

      return reply.status(500).send(errorResponse('Failed to create academy', 500, error.message));
    }
  }

  async updateAcademy(request, reply) {
    try {

      const { id } = request.params;
      const updateData = request.body || {};


      if (request.uploadedFile) {
        updateData.imageFile = request.uploadedFile;
      }

      const academy = await adminAcademyService.updateAcademy(Number(id), updateData);


      return reply.send(successResponse(academy, 'Academy updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update academy', 500, error.message));
    }
  }

  async deleteAcademy(request, reply) {
    try {

      const { id } = request.params;
      await adminAcademyService.deleteAcademy(Number(id));


      return reply.send(successResponse(null, 'Academy deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete academy', 500, error.message));
    }
  }

  async getAllAcademies(request, reply) {
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

      academy.has_cohort = (academy.cohorts ?? []).length > 0;
      delete academy.cohorts;


      return reply.send(successResponse(academy, 'Academy retrieved successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to fetch academy', 500, error.message));
    }
  }

  // ─── GET sub-resource handlers ───────────────────────────────────────────────

  async getPricings(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getPricings(Number(id));
      return reply.send(successResponse(data, 'Pricings retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch pricings', 500, error.message));
    }
  }

  async getFeatures(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getFeatures(Number(id));
      return reply.send(successResponse(data, 'Features retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch features', 500, error.message));
    }
  }

  async getInstructors(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getInstructors(Number(id));
      return reply.send(successResponse(data, 'Instructors retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch instructors', 500, error.message));
    }
  }

  async getTopics(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getTopics(Number(id));
      return reply.send(successResponse(data, 'Topics retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch topics', 500, error.message));
    }
  }

  async getTestimonials(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getTestimonials(Number(id));
      return reply.send(successResponse(data, 'Testimonials retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch testimonials', 500, error.message));
    }
  }

  async getFaqs(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getFaqs(Number(id));
      return reply.send(successResponse(data, 'FAQs retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch FAQs', 500, error.message));
    }
  }

  // ─── Theme CRUD handlers ─────────────────────────────────────────────────────

  async getThemes(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getThemes(Number(id));
      return reply.send(successResponse(data, 'Themes retrieved successfully'));
    } catch (error) {
      return reply.status(500).send(errorResponse('Failed to fetch themes', 500, error.message));
    }
  }

  async createTheme(request, reply) {
    try {
      const { id } = request.params;
      const theme = await adminAcademyService.createTheme(Number(id), request.body);
      return reply.status(201).send(successResponse(theme, 'Theme created successfully'));
    } catch (error) {
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to create theme', 500, error.message));
    }
  }

  async updateTheme(request, reply) {
    try {
      const { id, themeId } = request.params;
      const theme = await adminAcademyService.updateTheme(Number(id), Number(themeId), request.body);
      return reply.send(successResponse(theme, 'Theme updated successfully'));
    } catch (error) {
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to update theme', 500, error.message));
    }
  }

  async deleteTheme(request, reply) {
    try {
      const { id, themeId } = request.params;
      const result = await adminAcademyService.deleteTheme(Number(id), Number(themeId));
      return reply.send(successResponse(result, 'Theme deleted successfully'));
    } catch (error) {
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to delete theme', 500, error.message));
    }
  }

  async createPricing(request, reply) {
    try {
      const { id } = request.params;

      const pricing = await adminAcademyService.createPricing(Number(id), request.body);


      return reply.status(201).send(successResponse(pricing, 'Pricing created successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.message === 'Discount price cannot be greater than original price') {
        return reply.status(400).send(errorResponse('Failed to create pricing', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to create pricing', 500, error.message));
    }
  }

  async updatePricing(request, reply) {
    try {
      const { id, pricingId } = request.params;


      const pricing = await adminAcademyService.updatePricing(Number(id), Number(pricingId), request.body);


      return reply.send(successResponse(pricing, 'Pricing updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.message === 'Discount price cannot be greater than original price') {
        return reply.status(400).send(errorResponse('Failed to update pricing', 400, error.message));
      }

      return reply.status(500).send(errorResponse('Failed to update pricing', 500, error.message));
    }
  }

  async deletePricing(request, reply) {
    try {
      const { id, pricingId } = request.params;

      const result = await adminAcademyService.deletePricing(Number(id), Number(pricingId));


      return reply.send(successResponse(result, 'Pricing deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete pricing', 500, error.message));
    }
  }

  async createFeature(request, reply) {
    try {
      const { id } = request.params;

      const feature = await adminAcademyService.createFeature(Number(id), request.body);

      return reply.status(201).send(successResponse(feature, 'Feature created successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to create feature', 500, error.message));
    }
  }

  async updateFeature(request, reply) {
    try {
      const { id, featureId } = request.params;

      const feature = await adminAcademyService.updateFeature(Number(id), Number(featureId), request.body);

      return reply.send(successResponse(feature, 'Feature updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update feature', 500, error.message));
    }
  }

  async deleteFeature(request, reply) {
    try {
      const { id, featureId } = request.params;

      const result = await adminAcademyService.deleteFeature(Number(id), Number(featureId));

      return reply.send(successResponse(result, 'Feature deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete feature', 500, error.message));
    }
  }

  async createInstructor(request, reply) {
    try {
      const { id } = request.params;

      const instructorData = request.body || {};

      if (request.uploadedFile) {
        instructorData.avatarFile = request.uploadedFile;
      }

      const instructor = await adminAcademyService.createInstructor(Number(id), instructorData);

      return reply.status(201).send(successResponse(instructor, 'Instructor added successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add instructor', 500, error.message));
    }
  }

  async updateInstructor(request, reply) {
    try {
      const { id, instructorId } = request.params;

      const instructorData = request.body || {};

      if (request.uploadedFile) {
        instructorData.avatarFile = request.uploadedFile;
      }

      const instructor = await adminAcademyService.updateInstructor(Number(id), Number(instructorId), instructorData);

      return reply.send(successResponse(instructor, 'Instructor updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update instructor', 500, error.message));
    }
  }

  async deleteInstructor(request, reply) {
    try {
      const { id, instructorId } = request.params;

      const result = await adminAcademyService.deleteInstructor(Number(id), Number(instructorId));

      return reply.send(successResponse(result, 'Instructor removed successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to remove instructor', 500, error.message));
    }
  }

  async createTopic(request, reply) {
    try {
      const { id } = request.params;

      const topic = await adminAcademyService.createTopic(Number(id), request.body);

      return reply.status(201).send(successResponse(topic, 'Topic added successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add topic', 500, error.message));
    }
  }

  async updateTopic(request, reply) {
    try {
      const { id, topicId } = request.params;

      const topic = await adminAcademyService.updateTopic(Number(id), Number(topicId), request.body);

      return reply.send(successResponse(topic, 'Topic updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update topic', 500, error.message));
    }
  }

  async deleteTopic(request, reply) {
    try {
      const { id, topicId } = request.params;

      const result = await adminAcademyService.deleteTopic(Number(id), Number(topicId));

      return reply.send(successResponse(result, 'Topic deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete topic', 500, error.message));
    }
  }

  async createTestimonial(request, reply) {
    try {
      const { id } = request.params;

      const testimonialData = request.body || {};

      if (request.uploadedFile) {
        testimonialData.avatarFile = request.uploadedFile;
      }

      const testimonial = await adminAcademyService.createTestimonial(Number(id), testimonialData);

      return reply.status(201).send(successResponse(testimonial, 'Testimonial added successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add testimonial', 500, error.message));
    }
  }

  async updateTestimonial(request, reply) {
    try {
      const { id, testimonialId } = request.params;

      const testimonialData = request.body || {};

      if (request.uploadedFile) {
        testimonialData.avatarFile = request.uploadedFile;
      }

      const testimonial = await adminAcademyService.updateTestimonial(Number(id), Number(testimonialId), testimonialData);

      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update testimonial', 500, error.message));
    }
  }

  async deleteTestimonial(request, reply) {
    try {
      const { id, testimonialId } = request.params;

      const result = await adminAcademyService.deleteTestimonial(Number(id), Number(testimonialId));

      return reply.send(successResponse(result, 'Testimonial deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete testimonial', 500, error.message));
    }
  }

  async createFaq(request, reply) {
    try {
      const { id } = request.params;

      const faq = await adminAcademyService.createFaq(Number(id), request.body);

      return reply.status(201).send(successResponse(faq, 'FAQ added successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add FAQ', 500, error.message));
    }
  }

  async updateFaq(request, reply) {
    try {
      const { id, faqId } = request.params;

      const faq = await adminAcademyService.updateFaq(Number(id), Number(faqId), request.body);

      return reply.send(successResponse(faq, 'FAQ updated successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update FAQ', 500, error.message));
    }
  }

  async deleteFaq(request, reply) {
    try {
      const { id, faqId } = request.params;

      const result = await adminAcademyService.deleteFaq(Number(id), Number(faqId));

      return reply.send(successResponse(result, 'FAQ deleted successfully'));
    } catch (error) {

      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete FAQ', 500, error.message));
    }
  }
}

export const adminAcademyController = new AdminAcademyController();
