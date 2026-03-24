/**
 * Verification test for academyFixtures.js
 * This test verifies that all seeding functions work correctly
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  seedAcademy,
  seedAcademyWithRelations,
  seedMultipleAcademies,
  seedAcademyWithOrderedSubTables,
  resetFixtureState,
  getCreatedFixtures,
  getMockAcademy,
  getMockAcademyWithRelations,
  getMockPricing,
  getMockFeature,
  getMockTheme,
  getMockTopic,
  getMockInstructor,
  getMockTestimonial,
  getMockFaq,
  getMockPaginationResult,
} from './academyFixtures.js';
import { getTestPrisma, resetDatabase, closeConnection } from './testDb.js';

describe('Academy Fixtures - Mock Functions', () => {
  it('should provide getMockAcademy function', () => {
    const academy = getMockAcademy();
    expect(academy).toHaveProperty('id');
    expect(academy).toHaveProperty('title');
    expect(academy).toHaveProperty('slug');
    expect(academy.status).toBe('ACTIVE');
  });

  it('should provide getMockAcademyWithRelations function', () => {
    const academy = getMockAcademyWithRelations();
    expect(academy).toHaveProperty('pricing');
    expect(academy).toHaveProperty('features');
    expect(academy).toHaveProperty('themes');
    expect(academy).toHaveProperty('instructors');
    expect(academy).toHaveProperty('testimonials');
    expect(academy).toHaveProperty('faqs');
    expect(Array.isArray(academy.pricing)).toBe(true);
  });

  it('should provide mock functions for all sub-table types', () => {
    expect(getMockPricing()).toHaveProperty('name');
    expect(getMockFeature()).toHaveProperty('title');
    expect(getMockTheme()).toHaveProperty('title');
    expect(getMockTopic()).toHaveProperty('title');
    expect(getMockInstructor()).toHaveProperty('name');
    expect(getMockTestimonial()).toHaveProperty('comment');
    expect(getMockFaq()).toHaveProperty('question');
  });

  it('should provide getMockPaginationResult function', () => {
    const data = [getMockAcademy()];
    const result = getMockPaginationResult(data, { page: 1, limit: 10 });
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.meta).toHaveProperty('page');
    expect(result.meta).toHaveProperty('limit');
    expect(result.meta).toHaveProperty('total');
  });
});

describe('Academy Fixtures - Seeding Functions', () => {
  beforeEach(async () => {
    await resetDatabase();
    resetFixtureState();
  });

  afterAll(async () => {
    await closeConnection();
  });

  it('should seed a single academy (Requirement 9.4)', async () => {
    const academy = await seedAcademy({ title: 'Test Academy' });

    expect(academy).toHaveProperty('id');
    expect(academy.title).toBe('Test Academy');
    expect(academy.slug).toContain('test-academy');

    const fixtures = getCreatedFixtures();
    expect(fixtures.academies).toHaveLength(1);
  });

  it('should seed academy with all relations (Requirement 9.5)', async () => {
    const academy = await seedAcademyWithRelations();

    expect(academy).toHaveProperty('id');
    expect(academy.pricing).toHaveLength(2);
    expect(academy.features).toHaveLength(3);
    expect(academy.themes).toHaveLength(1);
    expect(academy.instructors).toHaveLength(2);
    expect(academy.testimonials).toHaveLength(2);
    expect(academy.faqs).toHaveLength(3);

    // Verify nested relations
    expect(academy.themes[0].topics).toHaveLength(1);
  });

  it('should ensure seeded data has valid foreign key relationships (Requirement 9.7)', async () => {
    const academy = await seedAcademyWithRelations();

    // All pricing records should reference the academy
    academy.pricing.forEach((pricing) => {
      expect(pricing.academy_id).toBe(academy.id);
    });

    // All features should reference the academy
    academy.features.forEach((feature) => {
      expect(feature.academy_id).toBe(academy.id);
    });

    // Topics should reference both academy and theme
    academy.themes[0].topics.forEach((topic) => {
      expect(topic.academy_id).toBe(academy.id);
      expect(topic.theme_id).toBe(academy.themes[0].id);
    });
  });

  it('should ensure seeded data has correct order sequences (Requirement 9.8)', async () => {
    const academy = await seedAcademyWithRelations();

    // Verify pricing orders are sequential
    expect(academy.pricing[0].order).toBe(1);
    expect(academy.pricing[1].order).toBe(2);

    // Verify features orders are sequential
    expect(academy.features[0].order).toBe(1);
    expect(academy.features[1].order).toBe(2);
    expect(academy.features[2].order).toBe(3);

    // Verify topics orders are sequential
    expect(academy.themes[0].topics[0].order).toBe(1);
  });

  it('should seed multiple academies for pagination (Requirement 9.6)', async () => {
    const academies = await seedMultipleAcademies(5);

    expect(academies).toHaveLength(5);
    expect(academies[0].title).toBe('Test Academy 1');
    expect(academies[4].title).toBe('Test Academy 5');

    const fixtures = getCreatedFixtures();
    expect(fixtures.academies).toHaveLength(5);
  });

  it('should seed academy with ordered sub-tables for order management tests', async () => {
    const academy = await seedAcademyWithOrderedSubTables();

    // Verify 5 pricing tiers with sequential orders
    expect(academy.pricing).toHaveLength(5);
    expect(academy.pricing[0].order).toBe(1);
    expect(academy.pricing[4].order).toBe(5);

    // Verify 5 features with sequential orders
    expect(academy.features).toHaveLength(5);
    expect(academy.features[0].order).toBe(1);
    expect(academy.features[4].order).toBe(5);

    // Verify 3 instructors with sequential orders
    expect(academy.instructors).toHaveLength(3);
    expect(academy.instructors[0].order).toBe(1);
    expect(academy.instructors[2].order).toBe(3);

    // Verify topic-scoped ordering (3 topics in theme)
    expect(academy.themes[0].topics).toHaveLength(3);
    expect(academy.themes[0].topics[0].order).toBe(1);
    expect(academy.themes[0].topics[1].order).toBe(2);
    expect(academy.themes[0].topics[2].order).toBe(3);
  });

  it('should reset fixture state (Requirement 9.9)', async () => {
    await seedAcademy();
    await seedAcademy();

    let fixtures = getCreatedFixtures();
    expect(fixtures.academies).toHaveLength(2);

    resetFixtureState();

    fixtures = getCreatedFixtures();
    expect(fixtures.academies).toHaveLength(0);
  });
});
