/**
 * Academy Test Fixtures
 * Provides mock data and seeding functions for academy tests
 */

import { getTestPrisma } from './testDb.js';

// Store created IDs for reference
let createdAcademies = [];

/**
 * Reset fixture state (call before seeding)
 */
export function resetFixtureState() {
  createdAcademies = [];
}

/**
 * Get created fixtures (after seeding)
 */
export function getCreatedFixtures() {
  return {
    academies: createdAcademies,
  };
}

// ============================================================================
// MOCK DATA FUNCTIONS (for unit tests)
// ============================================================================

export const getMockAcademy = (overrides = {}) => ({
  id: 1,
  title: 'Carbon Accounting',
  slug: 'carbon-accounting',
  description: 'Learn carbon accounting fundamentals',
  duration: '2 months',
  format: 'Online Live Class',
  category: 'INTAKE: 24 January 2026',
  image_url: 'https://example.com/image.jpg',
  certificate: true,
  portfolio: true,
  status: 'ACTIVE',
  pixel_id: null,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockAcademyWithRelations = (overrides = {}) => ({
  ...getMockAcademy(overrides),
  pricing: [
    {
      id: 1,
      academy_id: 1,
      name: 'Harga Special',
      original_price: 6889000,
      discount_price: 3889000,
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
  ],
  features: [
    {
      id: 1,
      academy_id: 1,
      title: 'Exclusive Community Group',
      description: 'Join our vibrant community',
      icon: 'lucide:users',
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
  ],
  themes: [
    {
      id: 1,
      academy_id: 1,
      title: 'Introduction to Carbon Accounting',
      description: 'Exploring fundamentals',
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
      topics: [
        {
          id: 1,
          academy_id: 1,
          theme_id: 1,
          title: 'Carbon Accounting Basics',
          description: 'Understanding fundamentals',
          order: 1,
          created_at: new Date('2025-01-01'),
          updated_at: new Date('2025-01-01'),
        },
      ],
    },
  ],
  instructors: [
    {
      id: 1,
      academy_id: 1,
      name: 'John Doe',
      job_title: 'Carbon Analyst',
      avatar_url: 'https://example.com/avatar.jpg',
      description: 'Expert in carbon accounting',
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
  ],
  testimonials: [
    {
      id: 1,
      academy_id: 1,
      name: 'Jane Smith',
      avatar_url: null,
      comment: 'Great course!',
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
  ],
  faqs: [
    {
      id: 1,
      academy_id: 1,
      question: 'Is this for beginners?',
      answer: 'Yes, absolutely!',
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
  ],
  _count: {
    enrollments: 250,
  },
});

export const getMockPricing = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  name: 'Regular',
  original_price: 5000000,
  discount_price: 3500000,
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockFeature = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  title: 'Live Sessions',
  description: 'Weekly live sessions',
  icon: 'video',
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockTheme = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  title: 'Introduction',
  description: 'Getting started',
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  topics: [
    {
      id: 1,
      academy_id: 1,
      theme_id: 1,
      title: 'Basics',
      description: 'Understanding basics',
      order: 1,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-01'),
    },
  ],
  ...overrides,
});

export const getMockTopic = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  theme_id: 1,
  title: 'Basics',
  description: 'Understanding basics',
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockInstructor = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  name: 'John Doe',
  job_title: 'Senior Instructor',
  avatar_url: 'https://example.com/avatar.jpg',
  description: 'Expert instructor',
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockTestimonial = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  name: 'Jane Smith',
  avatar_url: null,
  comment: 'Excellent course!',
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockFaq = (overrides = {}) => ({
  id: 1,
  academy_id: 1,
  question: 'What is this course about?',
  answer: 'This course teaches...',
  order: 1,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  ...overrides,
});

export const getMockPaginationResult = (data, meta = {}) => ({
  data,
  meta: {
    page: 1,
    limit: 10,
    total: data.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    ...meta,
  },
});

// ============================================================================
// DATABASE SEEDING FUNCTIONS (for integration/E2E tests)
// ============================================================================

/**
 * Seed a single academy into test database
 * @param {Object} overrides - Fields to override
 * @returns {Object} Created academy
 */
export async function seedAcademy(overrides = {}) {
  const prisma = getTestPrisma();

  const slug = overrides.slug || `test-academy-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  const academyData = {
    title: 'Carbon Accounting',
    slug,
    description: 'Learn carbon accounting fundamentals',
    duration: '2 months',
    format: 'Online Live Class',
    category: 'INTAKE: 24 January 2026',
    image_url: 'https://example.com/image.jpg',
    certificate: true,
    portfolio: true,
    status: 'ACTIVE',
    ...overrides,
  };

  const created = await prisma.academy.create({
    data: academyData,
  });

  createdAcademies.push(created);
  return created;
}

/**
 * Seed academy with all related sub-tables
 * @param {Object} overrides - Fields to override for academy
 * @returns {Object} Created academy with all relations
 */
export async function seedAcademyWithRelations(overrides = {}) {
  const prisma = getTestPrisma();

  // Create academy first
  const academy = await seedAcademy(overrides);

  // Create pricing (2 tiers)
  await prisma.academyPricing.createMany({
    data: [
      {
        academy_id: academy.id,
        name: 'Harga Special',
        original_price: 6889000,
        discount_price: 3889000,
        order: 1,
      },
      {
        academy_id: academy.id,
        name: 'Harga Normal',
        original_price: 8889000,
        discount_price: 5889000,
        order: 2,
      },
    ],
  });

  // Create features (3 features)
  await prisma.academyFeature.createMany({
    data: [
      {
        academy_id: academy.id,
        title: 'Exclusive Community Group',
        description: 'Join our vibrant community',
        icon: 'lucide:users',
        order: 1,
      },
      {
        academy_id: academy.id,
        title: 'Live Sessions',
        description: 'Weekly live sessions with experts',
        icon: 'lucide:video',
        order: 2,
      },
      {
        academy_id: academy.id,
        title: 'Certificate',
        description: 'Get certified upon completion',
        icon: 'lucide:award',
        order: 3,
      },
    ],
  });

  // Create theme with topics and sessions
  const theme = await prisma.academyTheme.create({
    data: {
      academy_id: academy.id,
      title: 'Introduction to Carbon Accounting',
      description: 'Exploring fundamentals',
      order: 1,
    },
  });

  await prisma.academyTopic.create({
    data: {
      academy_id: academy.id,
      theme_id: theme.id,
      title: 'Carbon Accounting Basics',
      description: 'Understanding fundamentals',
      order: 1,
    },
  });

  // Create instructors (2 instructors)
  await prisma.academyInstructor.createMany({
    data: [
      {
        academy_id: academy.id,
        name: 'John Doe',
        job_title: 'Carbon Analyst',
        avatar_url: 'https://example.com/avatar1.jpg',
        description: 'Expert in carbon accounting',
        order: 1,
      },
      {
        academy_id: academy.id,
        name: 'Jane Smith',
        job_title: 'Sustainability Consultant',
        avatar_url: 'https://example.com/avatar2.jpg',
        description: 'Specialist in environmental sustainability',
        order: 2,
      },
    ],
  });

  // Create testimonials (2 testimonials)
  await prisma.academyTestimonial.createMany({
    data: [
      {
        academy_id: academy.id,
        name: 'Alice Johnson',
        avatar_url: null,
        comment: 'Great course! Learned a lot about carbon accounting.',
        order: 1,
      },
      {
        academy_id: academy.id,
        name: 'Bob Williams',
        avatar_url: 'https://example.com/avatar3.jpg',
        comment: 'Highly recommend this academy to anyone interested in sustainability.',
        order: 2,
      },
    ],
  });

  // Create FAQs (3 FAQs)
  await prisma.academyFaq.createMany({
    data: [
      {
        academy_id: academy.id,
        question: 'Is this course suitable for beginners?',
        answer: 'Yes, absolutely! This course is designed for all levels.',
        order: 1,
      },
      {
        academy_id: academy.id,
        question: 'How long does it take to complete?',
        answer: 'The course duration is 2 months with flexible learning.',
        order: 2,
      },
      {
        academy_id: academy.id,
        question: 'Will I get a certificate?',
        answer: 'Yes, you will receive a certificate upon successful completion.',
        order: 3,
      },
    ],
  });

  // Fetch and return academy with all relations
  const academyWithRelations = await prisma.academy.findUnique({
    where: { id: academy.id },
    include: {
      pricing: { orderBy: { order: 'asc' } },
      features: { orderBy: { order: 'asc' } },
      themes: {
        orderBy: { order: 'asc' },
        include: {
          topics: {
            orderBy: { order: 'asc' },
          },
        },
      },
      instructors: { orderBy: { order: 'asc' } },
      testimonials: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
    },
  });

  return academyWithRelations;
}

/**
 * Seed multiple academies for pagination testing
 * @param {number} count - Number of academies to create
 * @param {Object} baseOverrides - Base overrides for all academies
 * @returns {Array} Array of created academies
 */
export async function seedMultipleAcademies(count, baseOverrides = {}) {
  const prisma = getTestPrisma();
  const academies = [];

  for (let i = 0; i < count; i++) {
    // Generate unique slug with timestamp, random string, and index
    const randomStr = Math.random().toString(36).substring(2, 11);
    const slug = `test-academy-${Date.now()}-${randomStr}-${i}`;

    const academyData = {
      title: `Test Academy ${i + 1}`,
      slug,
      description: `Test academy ${i + 1} for pagination`,
      duration: '2 months',
      format: 'Online Live Class',
      category: 'INTAKE: 24 January 2026',
      image_url: 'https://example.com/image.jpg',
      certificate: true,
      portfolio: true,
      status: 'ACTIVE',
      ...baseOverrides,
    };

    const created = await prisma.academy.create({
      data: academyData,
    });

    academies.push(created);
    createdAcademies.push(created);
  }

  return academies;
}

/**
 * Seed academy with multiple themes and topics for theme order management tests
 * @param {number} themeCount - Number of themes to create (default: 3)
 * @param {number} topicsPerTheme - Topics per theme (default: 2)
 * @returns {Object} { academy, themes } with full nested data
 */
export async function seedAcademyWithMultipleThemes(themeCount = 3, topicsPerTheme = 2) {
  const prisma = getTestPrisma();
  const academy = await seedAcademy();

  const themes = [];
  for (let t = 0; t < themeCount; t++) {
    const theme = await prisma.academyTheme.create({
      data: {
        academy_id: academy.id,
        title: `Theme ${t + 1}`,
        description: `Description for theme ${t + 1}`,
        order: t + 1,
      },
    });

    for (let tp = 0; tp < topicsPerTheme; tp++) {
      await prisma.academyTopic.create({
        data: {
          academy_id: academy.id,
          theme_id: theme.id,
          title: `Topic ${tp + 1} of Theme ${t + 1}`,
          description: `Topic description`,
          order: tp + 1,
        },
      });
    }

    themes.push(theme);
  }

  const academyWithThemes = await prisma.academy.findUnique({
    where: { id: academy.id },
    include: {
      themes: {
        orderBy: { order: 'asc' },
        include: { topics: { orderBy: { order: 'asc' } } },
      },
    },
  });

  return academyWithThemes;
}

/**
 * Seed academy with ordered sub-tables for order management tests
 * Creates an academy with multiple records in each ordered sub-table
 * @returns {Object} Created academy with ordered sub-tables
 */
export async function seedAcademyWithOrderedSubTables() {
  const prisma = getTestPrisma();

  // Create academy
  const academy = await seedAcademy({ slug: 'order-test-academy' });

  // Create 5 pricing tiers with sequential orders
  await prisma.academyPricing.createMany({
    data: [
      {
        academy_id: academy.id,
        name: 'Tier 1',
        original_price: 1000000,
        discount_price: 800000,
        order: 1,
      },
      {
        academy_id: academy.id,
        name: 'Tier 2',
        original_price: 2000000,
        discount_price: 1600000,
        order: 2,
      },
      {
        academy_id: academy.id,
        name: 'Tier 3',
        original_price: 3000000,
        discount_price: 2400000,
        order: 3,
      },
      {
        academy_id: academy.id,
        name: 'Tier 4',
        original_price: 4000000,
        discount_price: 3200000,
        order: 4,
      },
      {
        academy_id: academy.id,
        name: 'Tier 5',
        original_price: 5000000,
        discount_price: 4000000,
        order: 5,
      },
    ],
  });

  // Create 5 features with sequential orders
  await prisma.academyFeature.createMany({
    data: [
      {
        academy_id: academy.id,
        title: 'Feature 1',
        description: 'First feature',
        icon: 'icon1',
        order: 1,
      },
      {
        academy_id: academy.id,
        title: 'Feature 2',
        description: 'Second feature',
        icon: 'icon2',
        order: 2,
      },
      {
        academy_id: academy.id,
        title: 'Feature 3',
        description: 'Third feature',
        icon: 'icon3',
        order: 3,
      },
      {
        academy_id: academy.id,
        title: 'Feature 4',
        description: 'Fourth feature',
        icon: 'icon4',
        order: 4,
      },
      {
        academy_id: academy.id,
        title: 'Feature 5',
        description: 'Fifth feature',
        icon: 'icon5',
        order: 5,
      },
    ],
  });

  // Create 3 instructors with sequential orders
  await prisma.academyInstructor.createMany({
    data: [
      {
        academy_id: academy.id,
        name: 'Instructor 1',
        job_title: 'Senior Instructor',
        description: 'First instructor',
        order: 1,
      },
      {
        academy_id: academy.id,
        name: 'Instructor 2',
        job_title: 'Lead Instructor',
        description: 'Second instructor',
        order: 2,
      },
      {
        academy_id: academy.id,
        name: 'Instructor 3',
        job_title: 'Expert Instructor',
        description: 'Third instructor',
        order: 3,
      },
    ],
  });

  // Create 3 testimonials with sequential orders
  await prisma.academyTestimonial.createMany({
    data: [
      {
        academy_id: academy.id,
        name: 'Student 1',
        comment: 'First testimonial',
        order: 1,
      },
      {
        academy_id: academy.id,
        name: 'Student 2',
        comment: 'Second testimonial',
        order: 2,
      },
      {
        academy_id: academy.id,
        name: 'Student 3',
        comment: 'Third testimonial',
        order: 3,
      },
    ],
  });

  // Create 3 FAQs with sequential orders
  await prisma.academyFaq.createMany({
    data: [
      {
        academy_id: academy.id,
        question: 'Question 1?',
        answer: 'Answer 1',
        order: 1,
      },
      {
        academy_id: academy.id,
        question: 'Question 2?',
        answer: 'Answer 2',
        order: 2,
      },
      {
        academy_id: academy.id,
        question: 'Question 3?',
        answer: 'Answer 3',
        order: 3,
      },
    ],
  });

  // Create theme with topics and sessions for topic-scoped order testing
  const theme = await prisma.academyTheme.create({
    data: {
      academy_id: academy.id,
      title: 'Theme 1',
      description: 'First theme',
      order: 1,
    },
  });

  const topic1 = await prisma.academyTopic.create({
    data: {
      academy_id: academy.id,
      theme_id: theme.id,
      title: 'Topic 1',
      description: 'First topic',
      order: 1,
    },
  });

  const topic2 = await prisma.academyTopic.create({
    data: {
      academy_id: academy.id,
      theme_id: theme.id,
      title: 'Topic 2',
      description: 'Second topic',
      order: 2,
    },
  });

  const topic3 = await prisma.academyTopic.create({
    data: {
      academy_id: academy.id,
      theme_id: theme.id,
      title: 'Topic 3',
      description: 'Third topic',
      order: 3,
    },
  });

  // Fetch and return academy with all relations
  const academyWithRelations = await prisma.academy.findUnique({
    where: { id: academy.id },
    include: {
      pricing: { orderBy: { order: 'asc' } },
      features: { orderBy: { order: 'asc' } },
      themes: {
        orderBy: { order: 'asc' },
        include: {
          topics: {
            orderBy: { order: 'asc' },
          },
        },
      },
      instructors: { orderBy: { order: 'asc' } },
      testimonials: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
    },
  });

  return academyWithRelations;
}
