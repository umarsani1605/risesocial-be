import { testimonialsRepository } from '../repositories/testimonialsRepository.js';
import { getLogger } from '../lib/loggerContext.js';

class TestimonialsService {
  constructor() {
    this.testimonialsRepository = testimonialsRepository;
  }

  get logger() {
    return getLogger();
  }

  async getTestimonials(filters = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    this.logger.info('[testimonialsService] getTestimonials start');
    try {
      const result = await this.testimonialsRepository.findMany(filters, page, limit, sortBy, sortOrder);
      this.logger.info('[testimonialsService] getTestimonials success');
      return result;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonials error');
      throw new Error('Failed to get testimonial data');
    }
  }

  async getTestimonialById(id) {
    this.logger.info('[testimonialsService] getTestimonialById start');
    try {
      const testimonial = await this.testimonialsRepository.findById(id);
      this.logger.info('[testimonialsService] getTestimonialById success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialById error');
      throw new Error('Failed to get testimonial data');
    }
  }

  async getFeaturedTestimonials(limit = 6) {
    this.logger.info('[testimonialsService] getFeaturedTestimonials start');
    try {
      const testimonials = await this.testimonialsRepository.getFeatured(limit);
      this.logger.info('[testimonialsService] getFeaturedTestimonials success');
      return testimonials;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getFeaturedTestimonials error');
      throw new Error('Failed to get featured testimonials');
    }
  }

  async getTestimonialsByCountry(country, limit = 10) {
    this.logger.info('[testimonialsService] getTestimonialsByCountry start');
    try {
      const testimonials = await this.testimonialsRepository.getByCountry(country, limit);
      this.logger.info('[testimonialsService] getTestimonialsByCountry success');
      return testimonials;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialsByCountry error');
      throw new Error('Failed to get testimonials by country');
    }
  }

  async getTestimonialsByRating(minRating, limit = 10) {
    this.logger.info('[testimonialsService] getTestimonialsByRating start');
    try {
      const testimonials = await this.testimonialsRepository.getByRating(minRating, limit);
      this.logger.info('[testimonialsService] getTestimonialsByRating success');
      return testimonials;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getTestimonialsByRating error');
      throw new Error('Failed to get testimonials by rating');
    }
  }

  async createTestimonial(data) {
    this.logger.info('[testimonialsService] createTestimonial start');
    try {
      const testimonialData = {
        name: data.name.trim(),
        country: data.country.trim(),
        text: data.text.trim(),
        rating: data.rating || 5,
        status: data.status || 'ACTIVE',
        featured: data.featured || false,
      };

      const testimonial = await this.testimonialsRepository.create(testimonialData);
      this.logger.info('[testimonialsService] createTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] createTestimonial error');
      throw error;
    }
  }

  async updateTestimonial(id, data) {
    this.logger.info('[testimonialsService] updateTestimonial start');
    try {
      const updateData = {};
      if (data.name) updateData.name = data.name.trim();
      if (data.country) updateData.country = data.country.trim();
      if (data.text) updateData.text = data.text.trim();
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.status) updateData.status = data.status;
      if (data.featured !== undefined) updateData.featured = data.featured;

      const testimonial = await this.testimonialsRepository.update(id, updateData);
      this.logger.info('[testimonialsService] updateTestimonial success');
      return testimonial;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] updateTestimonial error');
      throw error;
    }
  }

  async deleteTestimonial(id) {
    this.logger.info('[testimonialsService] deleteTestimonial start');
    try {
      const deleted = await this.testimonialsRepository.delete(id);
      this.logger.info('[testimonialsService] deleteTestimonial success');
      return deleted;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] deleteTestimonial error');
      throw error;
    }
  }

  async getCountriesWithCounts() {
    this.logger.info('[testimonialsService] getCountriesWithCounts start');
    try {
      const countries = await this.testimonialsRepository.getCountriesWithCounts();
      this.logger.info('[testimonialsService] getCountriesWithCounts success');
      return countries;
    } catch (error) {
      this.logger.error({ err: error }, '[testimonialsService] getCountriesWithCounts error');
      throw new Error('Failed to get country data');
    }
  }
}

export const testimonialsService = new TestimonialsService();
