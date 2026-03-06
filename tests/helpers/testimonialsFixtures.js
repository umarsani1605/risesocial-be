/**
 * Testimonials Test Fixtures
 * Provides sample data and helper functions for Testimonials testing
 */

import { getTestPrisma } from './testDb.js';

/**
 * Valid testimonial fixture (ACTIVE status)
 */
export const validTestimonial = {
  name: 'John Doe',
  country: 'Indonesia',
  text: 'This program has been life-changing! I learned so much about sustainability and environmental conservation.',
  rating: 5,
  status: 'ACTIVE',
  featured: true,
};

/**
 * Inactive testimonial fixture
 */
export const inactiveTestimonial = {
  name: 'Jane Smith',
  country: 'Singapore',
  text: 'Great experience with the academy. The instructors were knowledgeable and supportive throughout.',
  rating: 4,
  status: 'INACTIVE',
  featured: false,
};

/**
 * Pending testimonial fixture
 */
export const pendingTestimonial = {
  name: 'Ahmad Rahman',
  country: 'Malaysia',
  text: 'Excellent program that helped me understand climate change and what I can do to make a difference.',
  rating: 5,
  status: 'PENDING',
  featured: false,
};

/**
 * Invalid testimonial fixture (for validation testing)
 */
export const invalidTestimonial = {
  name: 'A', // Too short (min 2 chars)
  country: 'X', // Too short (min 2 chars)
  text: 'Short', // Too short (min 10 chars)
  rating: 6, // Invalid (max 5)
  status: 'INVALID_STATUS',
  featured: 'not-a-boolean',
};

/**
 * Additional testimonial fixtures for various test scenarios
 */
export const testimonialFixtures = [
  {
    name: 'Maria Garcia',
    country: 'Philippines',
    text: 'The Rise Young Leaders program opened my eyes to environmental issues and gave me practical skills.',
    rating: 5,
    status: 'ACTIVE',
    featured: true,
  },
  {
    name: 'David Chen',
    country: 'Singapore',
    text: 'Amazing learning experience with dedicated instructors and a supportive community of learners.',
    rating: 4,
    status: 'ACTIVE',
    featured: false,
  },
  {
    name: 'Sarah Johnson',
    country: 'United States',
    text: 'This academy provided me with the knowledge and confidence to pursue a career in sustainability.',
    rating: 5,
    status: 'ACTIVE',
    featured: true,
  },
  {
    name: 'Budi Santoso',
    country: 'Indonesia',
    text: 'Very informative program with practical applications. I highly recommend it to anyone interested.',
    rating: 4,
    status: 'ACTIVE',
    featured: false,
  },
  {
    name: 'Lisa Wong',
    country: 'Malaysia',
    text: 'The program exceeded my expectations. Great content, excellent delivery, and wonderful community.',
    rating: 5,
    status: 'INACTIVE',
    featured: false,
  },
  {
    name: 'Ahmad Rahman',
    country: 'Malaysia',
    text: 'Excellent program that helped me understand climate change and what I can do to make a difference.',
    rating: 5,
    status: 'PENDING',
    featured: false,
  },
];

// Store created testimonials for reference
let createdTestimonials = [];

/**
 * Reset fixture state (call before seeding)
 */
export function resetFixtureState() {
  createdTestimonials = [];
}

/**
 * Seed testimonials into test database
 * @returns {Promise<Array>} Array of created testimonials
 */
export async function seedTestimonials() {
  const prisma = getTestPrisma();
  createdTestimonials = [];

  for (const testimonial of testimonialFixtures) {
    const created = await prisma.testimonial.create({
      data: testimonial,
    });
    createdTestimonials.push(created);
  }

  return createdTestimonials;
}

/**
 * Seed all testimonials data (convenience function)
 * @returns {Promise<Object>} Object containing created testimonials
 */
export async function seedAllTestimonialsData() {
  resetFixtureState();
  const testimonials = await seedTestimonials();
  return {
    testimonials,
  };
}

/**
 * Get created testimonials (after seeding)
 * @returns {Object} Object containing created testimonials
 */
export function getCreatedFixtures() {
  return {
    testimonials: createdTestimonials,
  };
}

/**
 * Create a testimonial with custom overrides
 * @param {Object} overrides - Fields to override in the base testimonial
 * @returns {Object} Testimonial data object
 */
export function createTestimonialWithOverrides(overrides = {}) {
  const timestamp = Date.now();

  return {
    name: `Test User ${timestamp}`,
    country: 'Test Country',
    text: 'This is a test testimonial with sufficient length to meet validation requirements.',
    rating: 5,
    status: 'ACTIVE',
    featured: false,
    ...overrides,
  };
}

/**
 * Create multiple testimonials for pagination and filtering tests
 * @param {number} count - Number of testimonials to create
 * @param {Object} baseOverrides - Base overrides to apply to all testimonials
 * @returns {Promise<Array>} Array of created testimonials
 */
export async function createMultipleTestimonials(count, baseOverrides = {}) {
  const prisma = getTestPrisma();
  const testimonials = [];

  for (let i = 0; i < count; i++) {
    const timestamp = Date.now();
    const testimonialData = {
      name: `Test User ${i + 1} ${timestamp}`,
      country: `Country ${(i % 5) + 1}`,
      text: `This is test testimonial number ${i + 1} with sufficient content for validation.`,
      rating: (i % 5) + 1, // Ratings from 1-5
      status: 'ACTIVE',
      featured: i % 3 === 0, // Every 3rd testimonial is featured
      ...baseOverrides,
    };

    const created = await prisma.testimonial.create({
      data: testimonialData,
    });

    testimonials.push(created);
  }

  return testimonials;
}

/**
 * Get mock testimonial (for unit tests with mocked Prisma)
 * @param {Object} overrides - Fields to override
 * @returns {Object} Mock testimonial object
 */
export function getMockTestimonial(overrides = {}) {
  return {
    id: 1,
    name: 'John Doe',
    country: 'Indonesia',
    text: 'This program has been life-changing! I learned so much about sustainability and environmental conservation.',
    rating: 5,
    status: 'ACTIVE',
    featured: true,
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Get mock paginated result (for unit tests)
 * @param {Array} testimonials - Array of testimonials
 * @param {Object} pagination - Pagination metadata
 * @returns {Object} Mock paginated result
 */
export function getMockPaginatedResult(testimonials = [], pagination = {}) {
  return {
    testimonials,
    pagination: {
      page: 1,
      limit: 10,
      total: testimonials.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      ...pagination,
    },
  };
}

/**
 * Get mock result without pagination (for unit tests)
 * @param {Array} testimonials - Array of testimonials
 * @returns {Object} Mock result without pagination
 */
export function getMockResultWithoutPagination(testimonials = []) {
  return {
    testimonials,
  };
}

/**
 * Generate edge case testimonials for validation testing
 * @returns {Object} Object containing various edge case testimonials
 */
export function getEdgeCaseTestimonials() {
  return {
    // Minimum valid lengths
    minValidName: {
      name: 'AB', // Exactly 2 chars (minimum)
      country: 'US', // Exactly 2 chars (minimum)
      text: 'Ten chars!', // Exactly 10 chars (minimum)
      rating: 1, // Minimum rating
      status: 'ACTIVE',
      featured: false,
    },

    // Maximum valid lengths
    maxValidName: {
      name: 'A'.repeat(100), // Maximum 100 chars
      country: 'B'.repeat(100), // Maximum 100 chars
      text: 'C'.repeat(1000), // Maximum 1000 chars
      rating: 5, // Maximum rating
      status: 'ACTIVE',
      featured: true,
    },

    // Invalid - name too short
    nameTooShort: {
      name: 'A', // 1 char (invalid)
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - name too long
    nameTooLong: {
      name: 'A'.repeat(256), // 256 chars (invalid, max is 255)
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - country too short
    countryTooShort: {
      name: 'John Doe',
      country: 'A', // 1 char (invalid)
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - country too long
    countryTooLong: {
      name: 'John Doe',
      country: 'B'.repeat(101), // 101 chars (invalid)
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - text too short
    textTooShort: {
      name: 'John Doe',
      country: 'Indonesia',
      text: 'Too short', // 9 chars (invalid, min is 10)
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - text too long
    textTooLong: {
      name: 'John Doe',
      country: 'Indonesia',
      text: 'C'.repeat(1001), // 1001 chars (invalid)
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - rating too low
    ratingTooLow: {
      name: 'John Doe',
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 0, // Invalid (min is 1)
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - rating too high
    ratingTooHigh: {
      name: 'John Doe',
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 6, // Invalid (max is 5)
      status: 'ACTIVE',
      featured: false,
    },

    // Invalid - invalid status
    invalidStatus: {
      name: 'John Doe',
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'INVALID_STATUS', // Not in enum
      featured: false,
    },

    // Invalid - featured not boolean
    invalidFeatured: {
      name: 'John Doe',
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: 'yes', // Should be boolean
    },

    // Missing required fields
    missingName: {
      country: 'Indonesia',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    missingCountry: {
      name: 'John Doe',
      text: 'This is a valid testimonial text with sufficient length.',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    missingText: {
      name: 'John Doe',
      country: 'Indonesia',
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },

    // Whitespace handling
    withWhitespace: {
      name: '  John Doe  ', // Should be trimmed
      country: '  Indonesia  ', // Should be trimmed
      text: '  This is a valid testimonial text with sufficient length.  ', // Should be trimmed
      rating: 5,
      status: 'ACTIVE',
      featured: false,
    },
  };
}

/**
 * Generate testimonials for filtering tests
 * @returns {Array} Array of testimonials with specific attributes for filter testing
 */
export function getFilterTestimonials() {
  return [
    // High rating, featured, Indonesia
    {
      name: 'Alice Johnson',
      country: 'Indonesia',
      text: 'Excellent program with great instructors and comprehensive curriculum.',
      rating: 5,
      status: 'ACTIVE',
      featured: true,
    },
    // Medium rating, not featured, Singapore
    {
      name: 'Bob Smith',
      country: 'Singapore',
      text: 'Good experience overall, learned a lot about sustainability.',
      rating: 3,
      status: 'ACTIVE',
      featured: false,
    },
    // High rating, featured, Malaysia
    {
      name: 'Charlie Wong',
      country: 'Malaysia',
      text: 'Amazing learning journey that transformed my perspective on climate change.',
      rating: 5,
      status: 'ACTIVE',
      featured: true,
    },
    // Low rating, not featured, Indonesia
    {
      name: 'Diana Lee',
      country: 'Indonesia',
      text: 'The program was okay but could be improved in some areas.',
      rating: 2,
      status: 'ACTIVE',
      featured: false,
    },
    // High rating, not featured, Philippines
    {
      name: 'Edward Garcia',
      country: 'Philippines',
      text: 'Very informative and practical program with real-world applications.',
      rating: 4,
      status: 'ACTIVE',
      featured: false,
    },
    // Inactive testimonial (should not appear in public endpoints)
    {
      name: 'Fiona Chen',
      country: 'Singapore',
      text: 'Great program but this testimonial is inactive for testing purposes.',
      rating: 5,
      status: 'INACTIVE',
      featured: true,
    },
    // Pending testimonial (should not appear in public endpoints)
    {
      name: 'George Kumar',
      country: 'Malaysia',
      text: 'Pending testimonial for testing admin vs public endpoint visibility.',
      rating: 4,
      status: 'PENDING',
      featured: false,
    },
  ];
}

/**
 * Generate testimonials for sorting tests
 * @returns {Array} Array of testimonials with varied attributes for sort testing
 */
export function getSortTestimonials() {
  const baseDate = new Date('2025-01-01T00:00:00.000Z');

  return [
    {
      name: 'Zara Ahmed',
      country: 'Zimbabwe',
      text: 'Last alphabetically by name and country for sorting tests.',
      rating: 3,
      status: 'ACTIVE',
      featured: false,
      created_at: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days later
    },
    {
      name: 'Adam Brown',
      country: 'Australia',
      text: 'First alphabetically by name and country for sorting tests.',
      rating: 5,
      status: 'ACTIVE',
      featured: true,
      created_at: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day later
    },
    {
      name: 'Maria Santos',
      country: 'Mexico',
      text: 'Middle alphabetically for sorting tests with medium rating.',
      rating: 4,
      status: 'ACTIVE',
      featured: false,
      created_at: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days later
    },
    {
      name: 'John Doe',
      country: 'Brazil',
      text: 'Another middle entry for comprehensive sorting validation.',
      rating: 2,
      status: 'ACTIVE',
      featured: true,
      created_at: baseDate, // Oldest
    },
  ];
}

/**
 * Generate testimonials for pagination tests
 * @param {number} totalCount - Total number of testimonials to generate
 * @returns {Array} Array of testimonials for pagination testing
 */
export function getPaginationTestimonials(totalCount = 25) {
  const testimonials = [];
  const baseDate = new Date('2025-01-01T00:00:00.000Z');

  for (let i = 0; i < totalCount; i++) {
    testimonials.push({
      name: `User ${String(i + 1).padStart(3, '0')}`,
      country: `Country ${(i % 10) + 1}`,
      text: `Testimonial number ${i + 1} with sufficient content for validation requirements.`,
      rating: (i % 5) + 1, // Cycle through ratings 1-5
      status: 'ACTIVE',
      featured: i % 5 === 0, // Every 5th is featured
      created_at: new Date(baseDate.getTime() + i * 60 * 60 * 1000), // 1 hour apart
    });
  }

  return testimonials;
}
