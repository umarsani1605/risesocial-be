import { adminAcademyService } from '../../services/admin/academyService.js';
import { academyService } from '../../services/shared/academyService.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AdminAcademyController {
  async createAcademy(request, reply) {
    try {
      request.log.info('[adminAcademyController] createAcademy start');
      request.log.debug({ body: request.body, user: request.user }, '[adminAcademyController] rawBody');

      const createData = request.body || {};

      if (request.uploadedFile) {
        createData.imageFile = request.uploadedFile;
        request.log.info('[adminAcademyController] image file received from middleware');
      }

      const academy = await adminAcademyService.createAcademy(createData);

      request.log.info('[adminAcademyController] createAcademy success');

      return reply.status(201).send(successResponse(academy, 'Academy created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createAcademy error');

      if (error.statusCode === 400) {
        request.log.info({ body: request.body }, '[adminAcademyController] createAcademy validation_failed');
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
      request.log.info('[adminAcademyController] updateAcademy start');
      request.log.debug({ params: request.params, body: request.body }, '[adminAcademyController] rawParams');

      const { id } = request.params;
      const updateData = request.body || {};

      request.log.debug({ updateData }, '[adminAcademyController] updateData before file processing');

      if (request.uploadedFile) {
        updateData.imageFile = request.uploadedFile;
        request.log.info('[adminAcademyController] image file received from middleware');
      }

      const academy = await adminAcademyService.updateAcademy(Number(id), updateData);

      request.log.info('[adminAcademyController] updateAcademy success');

      return reply.send(successResponse(academy, 'Academy updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateAcademy error');

      if (error.statusCode === 404) {
        request.log.info({ id }, '[adminAcademyController] updateAcademy not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      if (error.statusCode === 400) {
        request.log.info({ id, body: request.body }, '[adminAcademyController] updateAcademy validation_failed');
        return reply.status(400).send(errorResponse(error.message, 400));
      }

      return reply.status(500).send(errorResponse('Failed to update academy', 500, error.message));
    }
  }

  async deleteAcademy(request, reply) {
    try {
      request.log.info('[adminAcademyController] deleteAcademy start');
      request.log.debug({ params: request.params }, '[adminAcademyController] rawParams');

      const { id } = request.params;
      await adminAcademyService.deleteAcademy(Number(id));

      request.log.info('[adminAcademyController] deleteAcademy success');

      return reply.send(successResponse(null, 'Academy deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteAcademy error');

      if (error.statusCode === 404) {
        request.log.info({ id }, '[adminAcademyController] deleteAcademy not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete academy', 500, error.message));
    }
  }

  async getAllAcademies(request, reply) {
    try {
      request.log.info('[adminAcademyController] getAllAcademies start');

      const result = await academyService.getAllAcademies(request.query);

      request.log.info('[adminAcademyController] getAllAcademies success');

      if (result.meta) {
        return reply.send(successResponse(result.data, 'Academies retrieved successfully', result.meta));
      } else {
        return reply.send(successResponse(result.data, 'Academies retrieved successfully'));
      }
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getAllAcademies error');
      return reply.status(500).send(errorResponse('Failed to fetch academies', 500, error.message));
    }
  }

  async getAcademyBySlug(request, reply) {
    try {
      const { slug } = request.params;
      request.log.info({ slug }, '[adminAcademyController] getAcademyBySlug start');

      const academy = await academyService.getAcademyBySlug(slug);

      request.log.info('[adminAcademyController] getAcademyBySlug success');

      return reply.send(successResponse(academy, 'Academy retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getAcademyBySlug error');

      if (error.statusCode === 404) {
        request.log.info({ slug: request.params.slug }, '[adminAcademyController] getAcademyBySlug not_found');
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
      request.log.error({ err: error }, '[adminAcademyController] getPricings error');
      return reply.status(500).send(errorResponse('Failed to fetch pricings', 500, error.message));
    }
  }

  async getFeatures(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getFeatures(Number(id));
      return reply.send(successResponse(data, 'Features retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getFeatures error');
      return reply.status(500).send(errorResponse('Failed to fetch features', 500, error.message));
    }
  }

  async getInstructors(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getInstructors(Number(id));
      return reply.send(successResponse(data, 'Instructors retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getInstructors error');
      return reply.status(500).send(errorResponse('Failed to fetch instructors', 500, error.message));
    }
  }

  async getTopics(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getTopics(Number(id));
      return reply.send(successResponse(data, 'Topics retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getTopics error');
      return reply.status(500).send(errorResponse('Failed to fetch topics', 500, error.message));
    }
  }

  async getTestimonials(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getTestimonials(Number(id));
      return reply.send(successResponse(data, 'Testimonials retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getTestimonials error');
      return reply.status(500).send(errorResponse('Failed to fetch testimonials', 500, error.message));
    }
  }

  async getFaqs(request, reply) {
    try {
      const { id } = request.params;
      const data = await adminAcademyService.getFaqs(Number(id));
      return reply.send(successResponse(data, 'FAQs retrieved successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] getFaqs error');
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
      request.log.error({ err: error }, '[adminAcademyController] getThemes error');
      return reply.status(500).send(errorResponse('Failed to fetch themes', 500, error.message));
    }
  }

  async createTheme(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createTheme start');
      const theme = await adminAcademyService.createTheme(Number(id), request.body);
      request.log.info('[adminAcademyController] createTheme success');
      return reply.status(201).send(successResponse(theme, 'Theme created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createTheme error');
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to create theme', 500, error.message));
    }
  }

  async updateTheme(request, reply) {
    try {
      const { id, themeId } = request.params;
      request.log.info({ academyId: id, themeId }, '[adminAcademyController] updateTheme start');
      const theme = await adminAcademyService.updateTheme(Number(id), Number(themeId), request.body);
      request.log.info('[adminAcademyController] updateTheme success');
      return reply.send(successResponse(theme, 'Theme updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateTheme error');
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to update theme', 500, error.message));
    }
  }

  async deleteTheme(request, reply) {
    try {
      const { id, themeId } = request.params;
      request.log.info({ academyId: id, themeId }, '[adminAcademyController] deleteTheme start');
      const result = await adminAcademyService.deleteTheme(Number(id), Number(themeId));
      request.log.info('[adminAcademyController] deleteTheme success');
      return reply.send(successResponse(result, 'Theme deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteTheme error');
      if (error.statusCode === 404) {
        return reply.status(404).send(errorResponse(error.message, 404));
      }
      return reply.status(500).send(errorResponse('Failed to delete theme', 500, error.message));
    }
  }

  async createPricing(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createPricing start');

      const pricing = await adminAcademyService.createPricing(Number(id), request.body);

      request.log.info('[adminAcademyController] createPricing success');

      return reply.status(201).send(successResponse(pricing, 'Pricing created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createPricing error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id }, '[adminAcademyController] createPricing academy_not_found');
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

      request.log.info({ academyId: id, pricingId }, '[adminAcademyController] updatePricing start');

      const pricing = await adminAcademyService.updatePricing(Number(id), Number(pricingId), request.body);

      request.log.info('[adminAcademyController] updatePricing success');

      return reply.send(successResponse(pricing, 'Pricing updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updatePricing error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, pricingId: request.params.pricingId }, '[adminAcademyController] updatePricing not_found');
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
      request.log.info({ academyId: id, pricingId }, '[adminAcademyController] deletePricing start');

      const result = await adminAcademyService.deletePricing(Number(id), Number(pricingId));

      request.log.info('[adminAcademyController] deletePricing success');

      return reply.send(successResponse(result, 'Pricing deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deletePricing error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, pricingId: request.params.pricingId }, '[adminAcademyController] deletePricing not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete pricing', 500, error.message));
    }
  }

  async createFeature(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createFeature start');

      const feature = await adminAcademyService.createFeature(Number(id), request.body);

      request.log.info('[adminAcademyController] createFeature success');
      return reply.status(201).send(successResponse(feature, 'Feature created successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createFeature error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id }, '[adminAcademyController] createFeature academy_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to create feature', 500, error.message));
    }
  }

  async updateFeature(request, reply) {
    try {
      const { id, featureId } = request.params;
      request.log.info({ academyId: id, featureId }, '[adminAcademyController] updateFeature start');

      const feature = await adminAcademyService.updateFeature(Number(id), Number(featureId), request.body);

      request.log.info('[adminAcademyController] updateFeature success');
      return reply.send(successResponse(feature, 'Feature updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateFeature error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, featureId: request.params.featureId }, '[adminAcademyController] updateFeature not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update feature', 500, error.message));
    }
  }

  async deleteFeature(request, reply) {
    try {
      const { id, featureId } = request.params;
      request.log.info({ academyId: id, featureId }, '[adminAcademyController] deleteFeature start');

      const result = await adminAcademyService.deleteFeature(Number(id), Number(featureId));

      request.log.info('[adminAcademyController] deleteFeature success');
      return reply.send(successResponse(result, 'Feature deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteFeature error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, featureId: request.params.featureId }, '[adminAcademyController] deleteFeature not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete feature', 500, error.message));
    }
  }

  async createInstructor(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createInstructor start');

      const instructorData = request.body || {};

      if (request.uploadedFile) {
        instructorData.avatarFile = request.uploadedFile;
        request.log.info('[adminAcademyController] instructor avatar file received from middleware');
      }

      const instructor = await adminAcademyService.createInstructor(Number(id), instructorData);

      request.log.info({ instructorId: instructor.id }, '[adminAcademyController] createInstructor success');
      return reply.status(201).send(successResponse(instructor, 'Instructor added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createInstructor error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id }, '[adminAcademyController] createInstructor academy_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add instructor', 500, error.message));
    }
  }

  async updateInstructor(request, reply) {
    try {
      const { id, instructorId } = request.params;
      request.log.info({ academyId: id, instructorId }, '[adminAcademyController] updateInstructor start');

      const instructorData = request.body || {};

      if (request.uploadedFile) {
        instructorData.avatarFile = request.uploadedFile;
        request.log.info('[adminAcademyController] instructor avatar file received from middleware');
      }

      const instructor = await adminAcademyService.updateInstructor(Number(id), Number(instructorId), instructorData);

      request.log.info({ instructorId: instructor.id }, '[adminAcademyController] updateInstructor success');
      return reply.send(successResponse(instructor, 'Instructor updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateInstructor error');

      if (error.statusCode === 404) {
        request.log.info(
          { academyId: request.params.id, instructorId: request.params.instructorId },
          '[adminAcademyController] updateInstructor not_found',
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update instructor', 500, error.message));
    }
  }

  async deleteInstructor(request, reply) {
    try {
      const { id, instructorId } = request.params;
      request.log.info({ academyId: id, instructorId }, '[adminAcademyController] deleteInstructor start');

      const result = await adminAcademyService.deleteInstructor(Number(id), Number(instructorId));

      request.log.info('[adminAcademyController] deleteInstructor success');
      return reply.send(successResponse(result, 'Instructor removed successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteInstructor error');

      if (error.statusCode === 404) {
        request.log.info(
          { academyId: request.params.id, instructorId: request.params.instructorId },
          '[adminAcademyController] deleteInstructor not_found',
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to remove instructor', 500, error.message));
    }
  }

  async createTopic(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createTopic start');

      const topic = await adminAcademyService.createTopic(Number(id), request.body);

      request.log.info('[adminAcademyController] createTopic success');
      return reply.status(201).send(successResponse(topic, 'Topic added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createTopic error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id }, '[adminAcademyController] createTopic academy_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add topic', 500, error.message));
    }
  }

  async updateTopic(request, reply) {
    try {
      const { id, topicId } = request.params;
      request.log.info({ academyId: id, topicId }, '[adminAcademyController] updateTopic start');

      const topic = await adminAcademyService.updateTopic(Number(id), Number(topicId), request.body);

      request.log.info('[adminAcademyController] updateTopic success');
      return reply.send(successResponse(topic, 'Topic updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateTopic error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, topicId: request.params.topicId }, '[adminAcademyController] updateTopic not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update topic', 500, error.message));
    }
  }

  async deleteTopic(request, reply) {
    try {
      const { id, topicId } = request.params;
      request.log.info({ academyId: id, topicId }, '[adminAcademyController] deleteTopic start');

      const result = await adminAcademyService.deleteTopic(Number(id), Number(topicId));

      request.log.info('[adminAcademyController] deleteTopic success');
      return reply.send(successResponse(result, 'Topic deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteTopic error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, topicId: request.params.topicId }, '[adminAcademyController] deleteTopic not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete topic', 500, error.message));
    }
  }

  async createTestimonial(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createTestimonial start');

      const testimonialData = request.body || {};

      if (request.uploadedFile) {
        testimonialData.avatarFile = request.uploadedFile;
        request.log.info('[adminAcademyController] testimonial avatar file received from middleware');
      }

      const testimonial = await adminAcademyService.createTestimonial(Number(id), testimonialData);

      request.log.info('[adminAcademyController] createTestimonial success');
      return reply.status(201).send(successResponse(testimonial, 'Testimonial added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createTestimonial error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id }, '[adminAcademyController] createTestimonial academy_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add testimonial', 500, error.message));
    }
  }

  async updateTestimonial(request, reply) {
    try {
      const { id, testimonialId } = request.params;
      request.log.info({ academyId: id, testimonialId }, '[adminAcademyController] updateTestimonial start');

      const testimonialData = request.body || {};

      if (request.uploadedFile) {
        testimonialData.avatarFile = request.uploadedFile;
        request.log.info('[adminAcademyController] testimonial avatar file received from middleware');
      }

      const testimonial = await adminAcademyService.updateTestimonial(Number(id), Number(testimonialId), testimonialData);

      request.log.info('[adminAcademyController] updateTestimonial success');
      return reply.send(successResponse(testimonial, 'Testimonial updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateTestimonial error');

      if (error.statusCode === 404) {
        request.log.info(
          { academyId: request.params.id, testimonialId: request.params.testimonialId },
          '[adminAcademyController] updateTestimonial not_found',
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update testimonial', 500, error.message));
    }
  }

  async deleteTestimonial(request, reply) {
    try {
      const { id, testimonialId } = request.params;
      request.log.info({ academyId: id, testimonialId }, '[adminAcademyController] deleteTestimonial start');

      const result = await adminAcademyService.deleteTestimonial(Number(id), Number(testimonialId));

      request.log.info('[adminAcademyController] deleteTestimonial success');
      return reply.send(successResponse(result, 'Testimonial deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteTestimonial error');

      if (error.statusCode === 404) {
        request.log.info(
          { academyId: request.params.id, testimonialId: request.params.testimonialId },
          '[adminAcademyController] deleteTestimonial not_found',
        );
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete testimonial', 500, error.message));
    }
  }

  async createFaq(request, reply) {
    try {
      const { id } = request.params;
      request.log.info({ academyId: id }, '[adminAcademyController] createFaq start');

      const faq = await adminAcademyService.createFaq(Number(id), request.body);

      request.log.info('[adminAcademyController] createFaq success');
      return reply.status(201).send(successResponse(faq, 'FAQ added successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] createFaq error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id }, '[adminAcademyController] createFaq academy_not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to add FAQ', 500, error.message));
    }
  }

  async updateFaq(request, reply) {
    try {
      const { id, faqId } = request.params;
      request.log.info({ academyId: id, faqId }, '[adminAcademyController] updateFaq start');

      const faq = await adminAcademyService.updateFaq(Number(id), Number(faqId), request.body);

      request.log.info('[adminAcademyController] updateFaq success');
      return reply.send(successResponse(faq, 'FAQ updated successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] updateFaq error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, faqId: request.params.faqId }, '[adminAcademyController] updateFaq not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to update FAQ', 500, error.message));
    }
  }

  async deleteFaq(request, reply) {
    try {
      const { id, faqId } = request.params;
      request.log.info({ academyId: id, faqId }, '[adminAcademyController] deleteFaq start');

      const result = await adminAcademyService.deleteFaq(Number(id), Number(faqId));

      request.log.info('[adminAcademyController] deleteFaq success');
      return reply.send(successResponse(result, 'FAQ deleted successfully'));
    } catch (error) {
      request.log.error({ err: error }, '[adminAcademyController] deleteFaq error');

      if (error.statusCode === 404) {
        request.log.info({ academyId: request.params.id, faqId: request.params.faqId }, '[adminAcademyController] deleteFaq not_found');
        return reply.status(404).send(errorResponse(error.message, 404));
      }

      return reply.status(500).send(errorResponse('Failed to delete FAQ', 500, error.message));
    }
  }
}

export const adminAcademyController = new AdminAcademyController();
