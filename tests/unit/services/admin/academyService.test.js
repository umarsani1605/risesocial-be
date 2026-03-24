/**
 * Unit Tests for Admin Academy Service
 * Tests validation logic and delegation to repository
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminAcademyService } from '../../../../src/services/admin/academyService.js';
import { getMockAcademy, getMockPricing } from '../../../helpers/academyFixtures.js';

// Mock the repository modules
vi.mock('../../../../src/repositories/admin/academyRepository.js', () => ({
  adminAcademyRepository: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    // GET list
    findPricingsByAcademyId: vi.fn(),
    findFeaturesByAcademyId: vi.fn(),
    findInstructorsByAcademyId: vi.fn(),
    findTopicsByAcademyId: vi.fn(),
    findTestimonialsByAcademyId: vi.fn(),
    findFaqsByAcademyId: vi.fn(),
    findThemesByAcademyId: vi.fn(),
    // Pricing
    createPricing: vi.fn(),
    updatePricing: vi.fn(),
    deletePricing: vi.fn(),
    // Features
    createFeature: vi.fn(),
    updateFeature: vi.fn(),
    deleteFeature: vi.fn(),
    // Instructors
    createInstructor: vi.fn(),
    updateInstructor: vi.fn(),
    deleteInstructor: vi.fn(),
    // Themes
    createTheme: vi.fn(),
    updateTheme: vi.fn(),
    deleteTheme: vi.fn(),
    // Topics
    createTopic: vi.fn(),
    updateTopic: vi.fn(),
    deleteTopic: vi.fn(),
    // Testimonials
    createTestimonial: vi.fn(),
    updateTestimonial: vi.fn(),
    deleteTestimonial: vi.fn(),
    // FAQs
    createFaq: vi.fn(),
    updateFaq: vi.fn(),
    deleteFaq: vi.fn(),
  },
}));

vi.mock('../../../../src/repositories/shared/academyRepository.js', () => ({
  academyRepository: {
    findById: vi.fn(),
    slugExists: vi.fn(),
  },
}));

vi.mock('../../../../src/services/shared/fileUploadService.js', () => ({
  fileUploadService: {
    generatePublicFileUrl: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('AdminAcademyService', () => {
  let service;
  let mockAdminRepo;
  let mockSharedRepo;
  let mockFileUploadService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked modules
    const { adminAcademyRepository } = await import('../../../../src/repositories/admin/academyRepository.js');
    const { academyRepository } = await import('../../../../src/repositories/shared/academyRepository.js');
    const { fileUploadService } = await import('../../../../src/services/shared/fileUploadService.js');

    mockAdminRepo = adminAcademyRepository;
    mockSharedRepo = academyRepository;
    mockFileUploadService = fileUploadService;

    // Create service instance
    service = new AdminAcademyService();
  });

  describe('createAcademy', () => {
    it('should validate required fields and create academy', async () => {
      const academyData = {
        title: 'Carbon Accounting',
        slug: 'carbon-accounting',
        description: 'Learn carbon accounting fundamentals',
      };

      const mockCreated = getMockAcademy(academyData);
      mockSharedRepo.slugExists.mockResolvedValue(false);
      mockAdminRepo.create.mockResolvedValue(mockCreated);

      const result = await service.createAcademy(academyData);

      expect(mockSharedRepo.slugExists).toHaveBeenCalledWith('carbon-accounting');
      expect(mockAdminRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Carbon Accounting',
          slug: 'carbon-accounting',
          description: 'Learn carbon accounting fundamentals',
          status: 'DRAFT',
          certificate: false,
          portfolio: false,
        }),
      );
      expect(result).toEqual(mockCreated);
    });

    it('should generate slug from title if not provided', async () => {
      const academyData = {
        title: 'Carbon Accounting 101',
        description: 'Learn carbon accounting fundamentals',
      };

      const mockCreated = getMockAcademy({ ...academyData, slug: 'carbon-accounting-101' });
      mockAdminRepo.create.mockResolvedValue(mockCreated);

      await service.createAcademy(academyData);

      expect(mockAdminRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'carbon-accounting-101',
        }),
      );
    });

    it('should throw error if slug already exists', async () => {
      const academyData = {
        title: 'Carbon Accounting',
        slug: 'carbon-accounting',
        description: 'Learn carbon accounting fundamentals',
      };

      mockSharedRepo.slugExists.mockResolvedValue(true);

      await expect(service.createAcademy(academyData)).rejects.toThrow('Slug is already taken');
      expect(mockAdminRepo.create).not.toHaveBeenCalled();
    });

    it('should handle image file upload', async () => {
      const academyData = {
        title: 'Carbon Accounting',
        description: 'Learn carbon accounting fundamentals',
        imageFile: 'mock-file-object',
      };

      const mockCreated = getMockAcademy({ ...academyData, image_url: 'https://cdn.example.com/image.jpg' });
      mockFileUploadService.generatePublicFileUrl.mockReturnValue('https://cdn.example.com/image.jpg');
      mockAdminRepo.create.mockResolvedValue(mockCreated);

      const result = await service.createAcademy(academyData);

      expect(mockFileUploadService.generatePublicFileUrl).toHaveBeenCalledWith('mock-file-object');
      expect(mockAdminRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          image_url: 'https://cdn.example.com/image.jpg',
        }),
      );
      expect(mockAdminRepo.create).toHaveBeenCalledWith(expect.not.objectContaining({ imageFile: expect.anything() }));
      expect(result).toEqual(mockCreated);
    });

    it('should throw error if image upload fails', async () => {
      const academyData = {
        title: 'Carbon Accounting',
        description: 'Learn carbon accounting fundamentals',
        imageFile: 'mock-file-object',
      };

      mockFileUploadService.generatePublicFileUrl.mockImplementation(() => {
        throw new Error('Upload failed');
      });

      await expect(service.createAcademy(academyData)).rejects.toThrow('Failed to upload academy image');
      expect(mockAdminRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateAcademy', () => {
    it('should throw error if academy does not exist', async () => {
      mockSharedRepo.findById.mockResolvedValue(null);

      await expect(service.updateAcademy(999, { title: 'New Title' })).rejects.toThrow('Academy not found');
      expect(mockAdminRepo.update).not.toHaveBeenCalled();
    });

    it('should validate slug uniqueness excluding current academy', async () => {
      const existingAcademy = getMockAcademy({ id: 1, slug: 'old-slug' });
      mockSharedRepo.findById.mockResolvedValue(existingAcademy);
      mockSharedRepo.slugExists.mockResolvedValue(false);
      mockAdminRepo.update.mockResolvedValue({ ...existingAcademy, slug: 'new-slug' });

      await service.updateAcademy(1, { slug: 'new-slug' });

      expect(mockSharedRepo.slugExists).toHaveBeenCalledWith('new-slug', 1);
      expect(mockAdminRepo.update).toHaveBeenCalledWith(1, { slug: 'new-slug' });
    });

    it('should throw error if new slug already exists', async () => {
      const existingAcademy = getMockAcademy({ id: 1, slug: 'old-slug' });
      mockSharedRepo.findById.mockResolvedValue(existingAcademy);
      mockSharedRepo.slugExists.mockResolvedValue(true);

      await expect(service.updateAcademy(1, { slug: 'taken-slug' })).rejects.toThrow('Slug is already taken');
      expect(mockAdminRepo.update).not.toHaveBeenCalled();
    });

    it('should not validate slug if it has not changed', async () => {
      const existingAcademy = getMockAcademy({ id: 1, slug: 'same-slug' });
      mockSharedRepo.findById.mockResolvedValue(existingAcademy);
      mockAdminRepo.update.mockResolvedValue({ ...existingAcademy, title: 'New Title' });

      await service.updateAcademy(1, { title: 'New Title', slug: 'same-slug' });

      expect(mockSharedRepo.slugExists).not.toHaveBeenCalled();
      expect(mockAdminRepo.update).toHaveBeenCalledWith(1, { title: 'New Title', slug: 'same-slug' });
    });

    it('should generate slug from title if title changes but slug not provided', async () => {
      const existingAcademy = getMockAcademy({ id: 1, slug: 'old-slug', title: 'Old Title' });
      mockSharedRepo.findById.mockResolvedValue(existingAcademy);
      mockSharedRepo.slugExists.mockResolvedValue(false);
      mockAdminRepo.update.mockResolvedValue({ ...existingAcademy, title: 'New Title', slug: 'new-title' });

      await service.updateAcademy(1, { title: 'New Title' });

      expect(mockSharedRepo.slugExists).toHaveBeenCalledWith('new-title', 1);
      expect(mockAdminRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'New Title',
          slug: 'new-title',
        }),
      );
    });

    it('should handle image file upload during update', async () => {
      const existingAcademy = getMockAcademy({ id: 1 });
      mockSharedRepo.findById.mockResolvedValue(existingAcademy);
      mockFileUploadService.generatePublicFileUrl.mockReturnValue('https://cdn.example.com/new-image.jpg');
      mockAdminRepo.update.mockResolvedValue({ ...existingAcademy, image_url: 'https://cdn.example.com/new-image.jpg' });

      await service.updateAcademy(1, { imageFile: 'mock-file-object' });

      expect(mockFileUploadService.generatePublicFileUrl).toHaveBeenCalledWith('mock-file-object');
      expect(mockAdminRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          image_url: 'https://cdn.example.com/new-image.jpg',
        }),
      );
      expect(mockAdminRepo.update).toHaveBeenCalledWith(1, expect.not.objectContaining({ imageFile: expect.anything() }));
    });
  });

  describe('deleteAcademy', () => {
    it('should verify academy exists before deletion', async () => {
      const existingAcademy = getMockAcademy({ id: 1 });
      mockSharedRepo.findById.mockResolvedValue(existingAcademy);
      mockAdminRepo.delete.mockResolvedValue(undefined);

      await service.deleteAcademy(1);

      expect(mockSharedRepo.findById).toHaveBeenCalledWith(1);
      expect(mockAdminRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error with 404 status if academy does not exist', async () => {
      mockSharedRepo.findById.mockResolvedValue(null);

      try {
        await service.deleteAcademy(999);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toBe('Academy tidak ditemukan');
        expect(error.statusCode).toBe(404);
      }

      expect(mockAdminRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('createPricing', () => {
    it('should validate required fields and create pricing', async () => {
      const pricingData = {
        name: 'Harga Special',
        original_price: 6889000,
        discount_price: 3889000,
      };

      const mockCreated = getMockPricing(pricingData);
      mockAdminRepo.createPricing.mockResolvedValue(mockCreated);

      const result = await service.createPricing(1, pricingData);

      expect(mockAdminRepo.createPricing).toHaveBeenCalledWith(1, pricingData);
      expect(result).toEqual(mockCreated);
    });

    it('should throw error if discount_price is greater than original_price', async () => {
      const pricingData = {
        name: 'Invalid Pricing',
        original_price: 3000000,
        discount_price: 5000000,
      };

      await expect(service.createPricing(1, pricingData)).rejects.toThrow('Discount price cannot be greater than original price');
      expect(mockAdminRepo.createPricing).not.toHaveBeenCalled();
    });

    it('should allow discount_price equal to original_price', async () => {
      const pricingData = {
        name: 'Equal Pricing',
        original_price: 5000000,
        discount_price: 5000000,
      };

      const mockCreated = getMockPricing(pricingData);
      mockAdminRepo.createPricing.mockResolvedValue(mockCreated);

      const result = await service.createPricing(1, pricingData);

      expect(mockAdminRepo.createPricing).toHaveBeenCalledWith(1, pricingData);
      expect(result).toEqual(mockCreated);
    });

    it('should allow creating pricing without discount_price', async () => {
      const pricingData = {
        name: 'No Discount',
        original_price: 5000000,
      };

      const mockCreated = getMockPricing({ ...pricingData, discount_price: null });
      mockAdminRepo.createPricing.mockResolvedValue(mockCreated);

      const result = await service.createPricing(1, pricingData);

      expect(mockAdminRepo.createPricing).toHaveBeenCalledWith(1, pricingData);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updatePricing', () => {
    it('should validate price relationships during update', async () => {
      const updateData = {
        original_price: 8000000,
        discount_price: 6000000,
      };

      const mockUpdated = getMockPricing(updateData);
      mockAdminRepo.updatePricing.mockResolvedValue(mockUpdated);

      const result = await service.updatePricing(1, 1, updateData);

      expect(mockAdminRepo.updatePricing).toHaveBeenCalledWith(1, 1, updateData);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw error if discount_price is greater than original_price during update', async () => {
      const updateData = {
        original_price: 3000000,
        discount_price: 5000000,
      };

      await expect(service.updatePricing(1, 1, updateData)).rejects.toThrow('Discount price cannot be greater than original price');
      expect(mockAdminRepo.updatePricing).not.toHaveBeenCalled();
    });

    it('should allow partial updates without price validation', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const mockUpdated = getMockPricing({ ...updateData, id: 1 });
      mockAdminRepo.updatePricing.mockResolvedValue(mockUpdated);

      const result = await service.updatePricing(1, 1, updateData);

      expect(mockAdminRepo.updatePricing).toHaveBeenCalledWith(1, 1, updateData);
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('sub-table operations', () => {
    describe('foreign key validation', () => {
      it('should propagate foreign key error when academy_id does not exist for pricing', async () => {
        const pricingData = {
          name: 'Harga Special',
          original_price: 6889000,
          discount_price: 3889000,
        };

        const foreignKeyError = new Error('Foreign key constraint failed');
        foreignKeyError.code = 'P2003';
        mockAdminRepo.createPricing.mockRejectedValue(foreignKeyError);

        await expect(service.createPricing(999, pricingData)).rejects.toThrow('Foreign key constraint failed');
      });

      it('should propagate foreign key error when academy_id does not exist for features', async () => {
        const featureData = {
          title: 'Live Sessions',
          description: 'Weekly live sessions',
        };

        const foreignKeyError = new Error('Foreign key constraint failed');
        foreignKeyError.code = 'P2003';
        mockAdminRepo.createFeature.mockRejectedValue(foreignKeyError);

        await expect(service.createFeature(999, featureData)).rejects.toThrow('Foreign key constraint failed');
      });

      it('should propagate foreign key error when academy_id does not exist for instructors', async () => {
        const instructorData = {
          name: 'John Doe',
          job_title: 'Carbon Analyst',
        };

        const foreignKeyError = new Error('Foreign key constraint failed');
        foreignKeyError.code = 'P2003';
        mockAdminRepo.createInstructor.mockRejectedValue(foreignKeyError);

        await expect(service.createInstructor(999, instructorData)).rejects.toThrow('Foreign key constraint failed');
      });

      it('should propagate foreign key error when academy_id does not exist for testimonials', async () => {
        const testimonialData = {
          name: 'Jane Smith',
          comment: 'Great course!',
        };

        const foreignKeyError = new Error('Foreign key constraint failed');
        foreignKeyError.code = 'P2003';
        mockAdminRepo.createTestimonial.mockRejectedValue(foreignKeyError);

        await expect(service.createTestimonial(999, testimonialData)).rejects.toThrow('Foreign key constraint failed');
      });

      it('should propagate foreign key error when academy_id does not exist for FAQs', async () => {
        const faqData = {
          question: 'Is this for beginners?',
          answer: 'Yes, absolutely!',
        };

        const foreignKeyError = new Error('Foreign key constraint failed');
        foreignKeyError.code = 'P2003';
        mockAdminRepo.createFaq.mockRejectedValue(foreignKeyError);

        await expect(service.createFaq(999, faqData)).rejects.toThrow('Foreign key constraint failed');
      });

      it('should propagate foreign key error when academy_id does not exist for topics', async () => {
        const topicData = {
          theme_id: 1,
          title: 'Carbon Basics',
          description: 'Understanding fundamentals',
        };

        // Mock findThemesByAcademyId to allow theme validation to pass
        mockAdminRepo.findThemesByAcademyId.mockResolvedValue([{ id: 1 }]);
        const foreignKeyError = new Error('Foreign key constraint failed');
        foreignKeyError.code = 'P2003';
        mockAdminRepo.createTopic.mockRejectedValue(foreignKeyError);

        await expect(service.createTopic(999, topicData)).rejects.toThrow('Foreign key constraint failed');
      });
    });

    describe('createInstructor', () => {
      it('should handle avatar file upload', async () => {
        const instructorData = {
          name: 'John Doe',
          job_title: 'Carbon Analyst',
          avatarFile: 'mock-file-object',
        };

        mockFileUploadService.generatePublicFileUrl.mockReturnValue('https://cdn.example.com/avatar.jpg');
        mockAdminRepo.createInstructor.mockResolvedValue({
          id: 1,
          academy_id: 1,
          name: 'John Doe',
          job_title: 'Carbon Analyst',
          avatar_url: 'https://cdn.example.com/avatar.jpg',
        });

        await service.createInstructor(1, instructorData);

        expect(mockFileUploadService.generatePublicFileUrl).toHaveBeenCalledWith('mock-file-object');
        expect(mockAdminRepo.createInstructor).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            name: 'John Doe',
            job_title: 'Carbon Analyst',
            avatar_url: 'https://cdn.example.com/avatar.jpg',
          }),
        );
        expect(mockAdminRepo.createInstructor).toHaveBeenCalledWith(1, expect.not.objectContaining({ avatarFile: expect.anything() }));
      });

      it('should throw error if avatar upload fails', async () => {
        const instructorData = {
          name: 'John Doe',
          job_title: 'Carbon Analyst',
          avatarFile: 'mock-file-object',
        };

        mockFileUploadService.generatePublicFileUrl.mockImplementation(() => {
          throw new Error('Upload failed');
        });

        await expect(service.createInstructor(1, instructorData)).rejects.toThrow('Failed to upload instructor avatar');
        expect(mockAdminRepo.createInstructor).not.toHaveBeenCalled();
      });

      it('should set avatar_url to null if empty string provided', async () => {
        const instructorData = {
          name: 'John Doe',
          job_title: 'Carbon Analyst',
          avatar_url: '',
        };

        mockAdminRepo.createInstructor.mockResolvedValue({
          id: 1,
          academy_id: 1,
          name: 'John Doe',
          job_title: 'Carbon Analyst',
          avatar_url: null,
        });

        await service.createInstructor(1, instructorData);

        expect(mockAdminRepo.createInstructor).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            avatar_url: null,
          }),
        );
      });
    });

    describe('createTestimonial', () => {
      it('should handle avatar file upload', async () => {
        const testimonialData = {
          name: 'Jane Smith',
          comment: 'Great course!',
          avatarFile: 'mock-file-object',
        };

        mockFileUploadService.generatePublicFileUrl.mockReturnValue('https://cdn.example.com/avatar.jpg');
        mockAdminRepo.createTestimonial.mockResolvedValue({
          id: 1,
          academy_id: 1,
          name: 'Jane Smith',
          comment: 'Great course!',
          avatar_url: 'https://cdn.example.com/avatar.jpg',
        });

        await service.createTestimonial(1, testimonialData);

        expect(mockFileUploadService.generatePublicFileUrl).toHaveBeenCalledWith('mock-file-object');
        expect(mockAdminRepo.createTestimonial).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            name: 'Jane Smith',
            comment: 'Great course!',
            avatar_url: 'https://cdn.example.com/avatar.jpg',
          }),
        );
        expect(mockAdminRepo.createTestimonial).toHaveBeenCalledWith(1, expect.not.objectContaining({ avatarFile: expect.anything() }));
      });

      it('should throw error if avatar upload fails', async () => {
        const testimonialData = {
          name: 'Jane Smith',
          comment: 'Great course!',
          avatarFile: 'mock-file-object',
        };

        mockFileUploadService.generatePublicFileUrl.mockImplementation(() => {
          throw new Error('Upload failed');
        });

        await expect(service.createTestimonial(1, testimonialData)).rejects.toThrow('Failed to upload testimonial avatar');
        expect(mockAdminRepo.createTestimonial).not.toHaveBeenCalled();
      });
    });

    describe('feature operations', () => {
      it('should delegate createFeature to repository', async () => {
        const featureData = {
          title: 'Live Sessions',
          description: 'Weekly live sessions',
          icon: 'video',
        };

        mockAdminRepo.createFeature.mockResolvedValue({
          id: 1,
          academy_id: 1,
          ...featureData,
          order: 1,
        });

        await service.createFeature(1, featureData);

        expect(mockAdminRepo.createFeature).toHaveBeenCalledWith(1, featureData);
      });

      it('should delegate updateFeature to repository', async () => {
        const updateData = { title: 'Updated Feature' };

        mockAdminRepo.updateFeature.mockResolvedValue({
          id: 1,
          academy_id: 1,
          title: 'Updated Feature',
          order: 1,
        });

        await service.updateFeature(1, 1, updateData);

        expect(mockAdminRepo.updateFeature).toHaveBeenCalledWith(1, 1, updateData);
      });

      it('should delegate deleteFeature to repository', async () => {
        mockAdminRepo.deleteFeature.mockResolvedValue(undefined);

        await service.deleteFeature(1, 1);

        expect(mockAdminRepo.deleteFeature).toHaveBeenCalledWith(1, 1);
      });
    });

    describe('FAQ operations', () => {
      it('should delegate createFaq to repository', async () => {
        const faqData = {
          question: 'Is this for beginners?',
          answer: 'Yes, absolutely!',
        };

        mockAdminRepo.createFaq.mockResolvedValue({
          id: 1,
          academy_id: 1,
          ...faqData,
          order: 1,
        });

        await service.createFaq(1, faqData);

        expect(mockAdminRepo.createFaq).toHaveBeenCalledWith(1, faqData);
      });

      it('should delegate updateFaq to repository', async () => {
        const updateData = { answer: 'Updated answer' };

        mockAdminRepo.updateFaq.mockResolvedValue({
          id: 1,
          academy_id: 1,
          question: 'Is this for beginners?',
          answer: 'Updated answer',
          order: 1,
        });

        await service.updateFaq(1, 1, updateData);

        expect(mockAdminRepo.updateFaq).toHaveBeenCalledWith(1, 1, updateData);
      });

      it('should delegate deleteFaq to repository', async () => {
        mockAdminRepo.deleteFaq.mockResolvedValue(undefined);

        await service.deleteFaq(1, 1);

        expect(mockAdminRepo.deleteFaq).toHaveBeenCalledWith(1, 1);
      });
    });

    describe('topic operations', () => {
      it('should delegate createTopic to repository', async () => {
        const topicData = {
          theme_id: 1,
          title: 'Carbon Basics',
          description: 'Understanding fundamentals',
        };

        // Set up findThemesByAcademyId to pass theme validation
        mockAdminRepo.findThemesByAcademyId.mockResolvedValue([{ id: 1 }]);
        mockAdminRepo.createTopic.mockResolvedValue({
          id: 1,
          academy_id: 1,
          ...topicData,
          order: 1,
        });

        await service.createTopic(1, topicData);

        expect(mockAdminRepo.createTopic).toHaveBeenCalledWith(1, topicData);
      });

      it('should delegate updateTopic to repository', async () => {
        const updateData = { title: 'Updated Topic' };

        mockAdminRepo.updateTopic.mockResolvedValue({
          id: 1,
          academy_id: 1,
          theme_id: 1,
          title: 'Updated Topic',
          order: 1,
        });

        await service.updateTopic(1, 1, updateData);

        expect(mockAdminRepo.updateTopic).toHaveBeenCalledWith(1, 1, updateData);
      });

      it('should delegate deleteTopic to repository', async () => {
        mockAdminRepo.deleteTopic.mockResolvedValue(undefined);

        await service.deleteTopic(1, 1);

        expect(mockAdminRepo.deleteTopic).toHaveBeenCalledWith(1, 1);
      });

      it('should throw 404 when theme_id does not belong to academy on createTopic', async () => {
        const { getMockTheme } = await import('../../../helpers/academyFixtures.js');
        mockAdminRepo.findThemesByAcademyId.mockResolvedValue([getMockTheme({ id: 5 })]);

        await expect(service.createTopic(1, { theme_id: 99, title: 'Topic' })).rejects.toThrow(
          'Theme not found or does not belong to this academy',
        );
      });

      it('should pass through createTopic when theme_id is valid', async () => {
        const { getMockTheme, getMockTopic } = await import('../../../helpers/academyFixtures.js');
        mockAdminRepo.findThemesByAcademyId.mockResolvedValue([getMockTheme({ id: 1 })]);
        mockAdminRepo.createTopic.mockResolvedValue(getMockTopic());

        await service.createTopic(1, { theme_id: 1, title: 'Topic' });

        expect(mockAdminRepo.createTopic).toHaveBeenCalledWith(1, { theme_id: 1, title: 'Topic' });
      });

      it('should throw 404 when theme_id is invalid on updateTopic', async () => {
        const { getMockTheme } = await import('../../../helpers/academyFixtures.js');
        mockAdminRepo.findThemesByAcademyId.mockResolvedValue([getMockTheme({ id: 1 })]);

        await expect(service.updateTopic(1, 1, { theme_id: 999 })).rejects.toThrow(
          'Theme not found or does not belong to this academy',
        );
      });
    });

    describe('GET sub-resource methods', () => {
      it('should return pricings for an academy', async () => {
        const { getMockPricing } = await import('../../../helpers/academyFixtures.js');
        const mockPricings = [getMockPricing()];
        mockAdminRepo.findPricingsByAcademyId.mockResolvedValue(mockPricings);

        const result = await service.getPricings(1);

        expect(mockAdminRepo.findPricingsByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockPricings);
      });

      it('should return features for an academy', async () => {
        const { getMockFeature } = await import('../../../helpers/academyFixtures.js');
        const mockFeatures = [getMockFeature()];
        mockAdminRepo.findFeaturesByAcademyId.mockResolvedValue(mockFeatures);

        const result = await service.getFeatures(1);

        expect(mockAdminRepo.findFeaturesByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockFeatures);
      });

      it('should return instructors for an academy', async () => {
        const { getMockInstructor } = await import('../../../helpers/academyFixtures.js');
        const mockInstructors = [getMockInstructor()];
        mockAdminRepo.findInstructorsByAcademyId.mockResolvedValue(mockInstructors);

        const result = await service.getInstructors(1);

        expect(mockAdminRepo.findInstructorsByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockInstructors);
      });

      it('should return topics for an academy', async () => {
        const { getMockTopic } = await import('../../../helpers/academyFixtures.js');
        const mockTopics = [getMockTopic()];
        mockAdminRepo.findTopicsByAcademyId.mockResolvedValue(mockTopics);

        const result = await service.getTopics(1);

        expect(mockAdminRepo.findTopicsByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockTopics);
      });

      it('should return testimonials for an academy', async () => {
        const { getMockTestimonial } = await import('../../../helpers/academyFixtures.js');
        const mockTestimonials = [getMockTestimonial()];
        mockAdminRepo.findTestimonialsByAcademyId.mockResolvedValue(mockTestimonials);

        const result = await service.getTestimonials(1);

        expect(mockAdminRepo.findTestimonialsByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockTestimonials);
      });

      it('should return FAQs for an academy', async () => {
        const { getMockFaq } = await import('../../../helpers/academyFixtures.js');
        const mockFaqs = [getMockFaq()];
        mockAdminRepo.findFaqsByAcademyId.mockResolvedValue(mockFaqs);

        const result = await service.getFaqs(1);

        expect(mockAdminRepo.findFaqsByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockFaqs);
      });
    });

    describe('Theme CRUD', () => {
      it('should return themes with nested topics for an academy', async () => {
        const { getMockTheme } = await import('../../../helpers/academyFixtures.js');
        const mockThemes = [getMockTheme()];
        mockAdminRepo.findThemesByAcademyId.mockResolvedValue(mockThemes);

        const result = await service.getThemes(1);

        expect(mockAdminRepo.findThemesByAcademyId).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockThemes);
        expect(result[0].topics).toBeDefined();
      });

      it('should throw 404 when academy does not exist on createTheme', async () => {
        mockSharedRepo.findById.mockResolvedValue(null);

        await expect(service.createTheme(999, { title: 'New Theme' })).rejects.toThrow('Academy not found');
      });

      it('should create theme when academy exists', async () => {
        const { getMockAcademy, getMockTheme } = await import('../../../helpers/academyFixtures.js');
        mockSharedRepo.findById.mockResolvedValue(getMockAcademy());
        mockAdminRepo.createTheme.mockResolvedValue(getMockTheme({ title: 'New Theme' }));

        const result = await service.createTheme(1, { title: 'New Theme' });

        expect(mockAdminRepo.createTheme).toHaveBeenCalledWith(1, { title: 'New Theme' });
        expect(result.title).toBe('New Theme');
      });

      it('should delegate updateTheme to repository', async () => {
        const { getMockTheme } = await import('../../../helpers/academyFixtures.js');
        mockAdminRepo.updateTheme.mockResolvedValue(getMockTheme({ title: 'Updated Theme' }));

        const result = await service.updateTheme(1, 1, { title: 'Updated Theme' });

        expect(mockAdminRepo.updateTheme).toHaveBeenCalledWith(1, 1, { title: 'Updated Theme' });
        expect(result.title).toBe('Updated Theme');
      });

      it('should delegate deleteTheme to repository', async () => {
        mockAdminRepo.deleteTheme.mockResolvedValue({ message: 'Theme deleted successfully' });

        const result = await service.deleteTheme(1, 1);

        expect(mockAdminRepo.deleteTheme).toHaveBeenCalledWith(1, 1);
        expect(result.message).toBe('Theme deleted successfully');
      });
    });
  });
});

