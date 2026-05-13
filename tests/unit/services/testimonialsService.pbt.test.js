/**
 * TestimonialsService Property-Based Tests
 * Tests validation logic using fast-check for property-based testing
 *
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Mock user repository
const mockUserTestimonialsRepository = {
  findMany: vi.fn(),
  findById: vi.fn(),
};

vi.mock('../../../src/repositories/user/testimonialsRepository.js', () => ({
  userTestimonialsRepository: mockUserTestimonialsRepository,
}));

// Mock admin repository
const mockAdminTestimonialsRepository = {
  findMany: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getStatistics: vi.fn(),
};

vi.mock('../../../src/repositories/admin/testimonialsRepository.js', () => ({
  adminTestimonialsRepository: mockAdminTestimonialsRepository,
}));

// Mock logger

// Import after mocking
const { userTestimonialsService } = await import('../../../src/services/user/testimonialsService.js');
const { adminTestimonialsService } = await import('../../../src/services/admin/testimonialsService.js');

// Custom arbitraries that respect trimming behavior
const validNameArb = () => fc.string({ minLength: 2, maxLength: 255 }).filter((s) => s.trim().length >= 2 && s.trim().length <= 255);
const validCountryArb = () => fc.string({ minLength: 2, maxLength: 100 }).filter((s) => s.trim().length >= 2 && s.trim().length <= 100);
const validTextArb = () => fc.string({ minLength: 10, maxLength: 1000 }).filter((s) => s.trim().length >= 10 && s.trim().length <= 1000);

describe('TestimonialsService - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Name Validation Properties', () => {
    it('property: any string with trimmed length 2-255 is valid name', () => {
      fc.assert(
        fc.property(validNameArb(), validTextArb(), fc.integer({ min: 1, max: 5 }), (name, text, rating) => {
          const data = {
            name,
            country: 'Valid Country',
            text,
            rating,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: any string with trimmed length < 2 is invalid name', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 10 }).filter((s) => s.trim().length < 2),
          (name) => {
            const data = {
              name,
              country: 'Valid Country',
              text: 'Valid text with sufficient length',
              rating: 5,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('Name'))).toBe(true);
          },
        ),
      );
    });

    it('property: any string with trimmed length > 255 is invalid name', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 256, maxLength: 300 }), (name) => {
          const data = {
            name,
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('Name'))).toBe(true);
        }),
      );
    });

    it('property: whitespace-only names are invalid after trimming', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length === 0),
          (name) => {
            const data = {
              name,
              country: 'Valid Country',
              text: 'Valid text with sufficient length',
              rating: 5,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
          },
        ),
      );
    });
  });

  describe('Country Validation Properties', () => {
    it('property: any string with trimmed length 2-100 is valid country', () => {
      fc.assert(
        fc.property(validCountryArb(), validNameArb(), validTextArb(), fc.integer({ min: 1, max: 5 }), (country, name, text, rating) => {
          const data = {
            name,
            country,
            text,
            rating,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: any string with trimmed length < 2 is invalid country', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 10 }).filter((s) => s.trim().length < 2),
          (country) => {
            const data = {
              name: 'Valid Name',
              country,
              text: 'Valid text with sufficient length',
              rating: 5,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('Country'))).toBe(true);
          },
        ),
      );
    });

    it('property: any string with trimmed length > 100 is invalid country', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 150 }).filter((s) => s.trim().length > 100),
          (country) => {
            const data = {
              name: 'Valid Name',
              country,
              text: 'Valid text with sufficient length',
              rating: 5,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('Country'))).toBe(true);
          },
        ),
      );
    });
  });

  describe('Text Validation Properties', () => {
    it('property: any string with trimmed length 10-1000 is valid text', () => {
      fc.assert(
        fc.property(validTextArb(), validNameArb(), validCountryArb(), fc.integer({ min: 1, max: 5 }), (text, name, country, rating) => {
          const data = {
            name,
            country,
            text,
            rating,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: any string with trimmed length < 10 is invalid text', () => {
      fc.assert(
        fc.property(
          fc.string({ maxLength: 20 }).filter((s) => s.trim().length < 10),
          (text) => {
            const data = {
              name: 'Valid Name',
              country: 'Valid Country',
              text,
              rating: 5,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('Text'))).toBe(true);
          },
        ),
      );
    });

    it('property: any string with trimmed length > 1000 is invalid text', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1001, maxLength: 1100 }).filter((s) => s.trim().length > 1000),
          (text) => {
            const data = {
              name: 'Valid Name',
              country: 'Valid Country',
              text,
              rating: 5,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('Text'))).toBe(true);
          },
        ),
      );
    });
  });

  describe('Rating Validation Properties', () => {
    it('property: any integer 1-5 is valid rating', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (rating) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: any integer < 1 is invalid rating', () => {
      fc.assert(
        fc.property(fc.integer({ max: 0 }), (rating) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('Rating'))).toBe(true);
        }),
      );
    });

    it('property: any integer > 5 is invalid rating', () => {
      fc.assert(
        fc.property(fc.integer({ min: 6, max: 100 }), (rating) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('Rating'))).toBe(true);
        }),
      );
    });

    it('property: string representations of valid ratings are accepted', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (rating) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: rating.toString(),
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });
  });

  describe('Status Validation Properties', () => {
    it('property: valid status values are accepted', () => {
      fc.assert(
        fc.property(fc.constantFrom('ACTIVE', 'INACTIVE', 'PENDING'), (status) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
            status,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: invalid status values are rejected', () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => s !== '' && !['ACTIVE', 'INACTIVE', 'PENDING'].includes(s)),
          (status) => {
            const data = {
              name: 'Valid Name',
              country: 'Valid Country',
              text: 'Valid text with sufficient length',
              rating: 5,
              status,
            };
            const result = adminTestimonialsService.validateTestimonialData(data, false);
            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.includes('Status'))).toBe(true);
          },
        ),
      );
    });
  });

  describe('Featured Validation Properties', () => {
    it('property: boolean values are valid for featured', () => {
      fc.assert(
        fc.property(fc.boolean(), (featured) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
            featured,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: non-boolean values are invalid for featured', () => {
      fc.assert(
        fc.property(fc.oneof(fc.string(), fc.integer(), fc.constant(null)), (featured) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
            featured,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('Featured'))).toBe(true);
        }),
      );
    });
  });

  describe('Avatar URL Validation Properties', () => {
    it('property: strings up to 500 chars are valid avatar URLs', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 500 }), (avatar_url) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
            avatar_url,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: strings > 500 chars are invalid avatar URLs', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 501, maxLength: 600 }), (avatar_url) => {
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
            avatar_url,
          };
          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(false);
          expect(result.errors.some((e) => e.includes('Avatar URL'))).toBe(true);
        }),
      );
    });
  });

  describe('Data Sanitization Properties', () => {
    it('property: trimming whitespace preserves valid names', () => {
      fc.assert(
        fc.property(validNameArb(), fc.nat({ max: 20 }), fc.nat({ max: 20 }), (name, leftSpaces, rightSpaces) => {
          const paddedName = ' '.repeat(leftSpaces) + name + ' '.repeat(rightSpaces);
          const data = {
            name: paddedName,
            country: 'Valid Country',
            text: 'Valid text with sufficient length',
            rating: 5,
          };

          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: trimming whitespace preserves valid countries', () => {
      fc.assert(
        fc.property(validCountryArb(), fc.nat({ max: 20 }), fc.nat({ max: 20 }), (country, leftSpaces, rightSpaces) => {
          const paddedCountry = ' '.repeat(leftSpaces) + country + ' '.repeat(rightSpaces);
          const data = {
            name: 'Valid Name',
            country: paddedCountry,
            text: 'Valid text with sufficient length',
            rating: 5,
          };

          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });

    it('property: trimming whitespace preserves valid text', () => {
      fc.assert(
        fc.property(validTextArb(), fc.nat({ max: 20 }), fc.nat({ max: 20 }), (text, leftSpaces, rightSpaces) => {
          const paddedText = ' '.repeat(leftSpaces) + text + ' '.repeat(rightSpaces);
          const data = {
            name: 'Valid Name',
            country: 'Valid Country',
            text: paddedText,
            rating: 5,
          };

          const result = adminTestimonialsService.validateTestimonialData(data, false);
          expect(result.isValid).toBe(true);
        }),
      );
    });
  });

  describe('Update Validation Properties', () => {
    it('property: partial updates with valid fields are accepted', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.option(validNameArb(), { nil: undefined }),
            country: fc.option(validCountryArb(), { nil: undefined }),
            text: fc.option(validTextArb(), { nil: undefined }),
            rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
          }),
          (data) => {
            // Filter out undefined values
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

            if (Object.keys(cleanData).length === 0) return; // Skip empty updates

            const result = adminTestimonialsService.validateTestimonialData(cleanData, true);
            expect(result.isValid).toBe(true);
          },
        ),
      );
    });

    it('property: update validation does not require all fields', () => {
      fc.assert(
        fc.property(fc.constantFrom('name', 'country', 'text', 'rating'), (field) => {
          let value;
          if (field === 'name') value = 'Valid Name';
          else if (field === 'country') value = 'Valid Country';
          else if (field === 'text') value = 'Valid text with sufficient length';
          else if (field === 'rating') value = 3;

          const data = { [field]: value };

          const result = adminTestimonialsService.validateTestimonialData(data, true);
          expect(result.isValid).toBe(true);
        }),
      );
    });
  });

  describe('Validation Consistency Properties', () => {
    it('property: validation is deterministic (same input = same output)', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: validNameArb(),
            country: validCountryArb(),
            text: validTextArb(),
            rating: fc.integer({ min: 1, max: 5 }),
          }),
          (data) => {
            const result1 = adminTestimonialsService.validateTestimonialData(data, false);
            const result2 = adminTestimonialsService.validateTestimonialData(data, false);

            expect(result1.isValid).toBe(result2.isValid);
            expect(result1.errors).toEqual(result2.errors);
          },
        ),
      );
    });

    it('property: valid data always returns isValid=true and empty errors', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: validNameArb(),
            country: validCountryArb(),
            text: validTextArb(),
            rating: fc.integer({ min: 1, max: 5 }),
          }),
          (data) => {
            const result = adminTestimonialsService.validateTestimonialData(data, false);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
          },
        ),
      );
    });

    it('property: invalid data always returns isValid=false and non-empty errors', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.record({
              name: fc.string({ maxLength: 1 }),
              country: fc.constant('Valid'),
              text: fc.constant('Valid text here'),
              rating: fc.constant(5),
            }),
            fc.record({
              name: fc.constant('Valid'),
              country: fc.string({ maxLength: 1 }),
              text: fc.constant('Valid text here'),
              rating: fc.constant(5),
            }),
            fc.record({ name: fc.constant('Valid'), country: fc.constant('Valid'), text: fc.string({ maxLength: 9 }), rating: fc.constant(5) }),
            fc.record({
              name: fc.constant('Valid'),
              country: fc.constant('Valid'),
              text: fc.constant('Valid text here'),
              rating: fc.integer({ max: 0 }),
            }),
          ),
          (data) => {
            const result = adminTestimonialsService.validateTestimonialData(data, false);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
      );
    });
  });

  describe('Default Value Properties', () => {
    it('property: createTestimonial sets default status to ACTIVE when not provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: validNameArb(),
            country: validCountryArb(),
            text: validTextArb(),
            rating: fc.integer({ min: 1, max: 5 }),
          }),
          async (data) => {
            const mockCreated = { id: 1, ...data, status: 'ACTIVE', featured: false };
            mockAdminTestimonialsRepository.create.mockResolvedValue(mockCreated);

            await adminTestimonialsService.createTestimonial(data);

            expect(mockAdminTestimonialsRepository.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACTIVE' }));
          },
        ),
      );
    });

    it('property: createTestimonial sets default featured to false when not provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: validNameArb(),
            country: validCountryArb(),
            text: validTextArb(),
            rating: fc.integer({ min: 1, max: 5 }),
          }),
          async (data) => {
            const mockCreated = { id: 1, ...data, status: 'ACTIVE', featured: false };
            mockAdminTestimonialsRepository.create.mockResolvedValue(mockCreated);

            await adminTestimonialsService.createTestimonial(data);

            expect(mockAdminTestimonialsRepository.create).toHaveBeenCalledWith(expect.objectContaining({ featured: false }));
          },
        ),
      );
    });
  });
});
