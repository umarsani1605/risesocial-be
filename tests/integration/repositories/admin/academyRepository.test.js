/**
 * Admin AcademyRepository Integration Tests
 * Tests with real database connection and transactions
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestPrisma, resetDatabase, closeConnection, isTestDatabase } from '../../../helpers/testDb.js';
import {
  seedAcademy,
  seedAcademyWithRelations,
  seedAcademyWithOrderedSubTables,
  seedAcademyWithMultipleThemes,
  resetFixtureState,
} from '../../../helpers/academyFixtures.js';
import { AdminAcademyRepository } from '../../../../src/repositories/admin/academyRepository.js';

describe('Admin AcademyRepository Integration Tests', { concurrent: false }, () => {
  let repository;
  let prisma;

  beforeAll(async () => {
    // Verify we're using test database
    expect(isTestDatabase()).toBe(true);

    prisma = getTestPrisma();
    repository = new AdminAcademyRepository();
  });

  beforeEach(async () => {
    // Reset database before each test
    await resetDatabase();
    // Reset fixture state
    resetFixtureState();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('Order Management - Pricing', () => {
    it('should auto-increment order when not specified', async () => {
      const academy = await seedAcademy();

      // Create first pricing without order
      const pricing1 = await repository.createPricing(academy.id, {
        name: 'Tier 1',
        original_price: 1000000,
        discount_price: 800000,
      });

      expect(pricing1.order).toBe(1);

      // Create second pricing without order
      const pricing2 = await repository.createPricing(academy.id, {
        name: 'Tier 2',
        original_price: 2000000,
        discount_price: 1600000,
      });

      expect(pricing2.order).toBe(2);

      // Create third pricing without order
      const pricing3 = await repository.createPricing(academy.id, {
        name: 'Tier 3',
        original_price: 3000000,
        discount_price: 2400000,
      });

      expect(pricing3.order).toBe(3);
    });

    it('should insert at specified order and shift existing records', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Verify initial state (5 pricing tiers with orders 1-5)
      const initialPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(initialPricing).toHaveLength(5);
      expect(initialPricing[0].order).toBe(1);
      expect(initialPricing[1].order).toBe(2);
      expect(initialPricing[2].order).toBe(3);

      // Insert new pricing at order 2
      const newPricing = await repository.createPricing(academy.id, {
        name: 'New Tier',
        original_price: 1500000,
        discount_price: 1200000,
        order: 2,
      });

      expect(newPricing.order).toBe(2);

      // Verify all pricing after insertion
      const afterPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterPricing).toHaveLength(6);
      expect(afterPricing[0].name).toBe('Tier 1');
      expect(afterPricing[0].order).toBe(1);
      expect(afterPricing[1].name).toBe('New Tier');
      expect(afterPricing[1].order).toBe(2);
      expect(afterPricing[2].name).toBe('Tier 2');
      expect(afterPricing[2].order).toBe(3); // Shifted from 2 to 3
      expect(afterPricing[3].name).toBe('Tier 3');
      expect(afterPricing[3].order).toBe(4); // Shifted from 3 to 4
      expect(afterPricing[4].name).toBe('Tier 4');
      expect(afterPricing[4].order).toBe(5); // Shifted from 4 to 5
      expect(afterPricing[5].name).toBe('Tier 5');
      expect(afterPricing[5].order).toBe(6); // Shifted from 5 to 6
    });

    it('should reorder when updating order forward', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      const pricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      // Move Tier 2 (order 2) to order 4
      await repository.updatePricing(academy.id, pricing[1].id, {
        order: 4,
      });

      // Verify reordering
      const afterPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterPricing[0].name).toBe('Tier 1');
      expect(afterPricing[0].order).toBe(1);
      expect(afterPricing[1].name).toBe('Tier 3');
      expect(afterPricing[1].order).toBe(2); // Shifted down from 3
      expect(afterPricing[2].name).toBe('Tier 4');
      expect(afterPricing[2].order).toBe(3); // Shifted down from 4
      expect(afterPricing[3].name).toBe('Tier 2');
      expect(afterPricing[3].order).toBe(4); // Moved from 2 to 4
      expect(afterPricing[4].name).toBe('Tier 5');
      expect(afterPricing[4].order).toBe(5);
    });

    it('should reorder when updating order backward', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      const pricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      // Move Tier 4 (order 4) to order 2
      await repository.updatePricing(academy.id, pricing[3].id, {
        order: 2,
      });

      // Verify reordering
      const afterPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterPricing[0].name).toBe('Tier 1');
      expect(afterPricing[0].order).toBe(1);
      expect(afterPricing[1].name).toBe('Tier 4');
      expect(afterPricing[1].order).toBe(2); // Moved from 4 to 2
      expect(afterPricing[2].name).toBe('Tier 2');
      expect(afterPricing[2].order).toBe(3); // Shifted up from 2
      expect(afterPricing[3].name).toBe('Tier 3');
      expect(afterPricing[3].order).toBe(4); // Shifted up from 3
      expect(afterPricing[4].name).toBe('Tier 5');
      expect(afterPricing[4].order).toBe(5);
    });

    it('should shift subsequent records when deleting', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      const pricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      // Delete Tier 3 (order 3)
      await repository.deletePricing(academy.id, pricing[2].id);

      // Verify shift after deletion
      const afterPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterPricing).toHaveLength(4);
      expect(afterPricing[0].name).toBe('Tier 1');
      expect(afterPricing[0].order).toBe(1);
      expect(afterPricing[1].name).toBe('Tier 2');
      expect(afterPricing[1].order).toBe(2);
      expect(afterPricing[2].name).toBe('Tier 4');
      expect(afterPricing[2].order).toBe(3); // Shifted down from 4
      expect(afterPricing[3].name).toBe('Tier 5');
      expect(afterPricing[3].order).toBe(4); // Shifted down from 5
    });
  });

  describe('Order Management - Features', () => {
    it('should maintain correct order sequences', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Verify initial state
      const initialFeatures = await prisma.academyFeature.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(initialFeatures).toHaveLength(5);
      expect(initialFeatures.map((f) => f.order)).toEqual([1, 2, 3, 4, 5]);

      // Insert at position 3
      await repository.createFeature(academy.id, {
        title: 'New Feature',
        description: 'Inserted feature',
        icon: 'new-icon',
        order: 3,
      });

      // Verify order integrity
      const afterFeatures = await prisma.academyFeature.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterFeatures).toHaveLength(6);
      expect(afterFeatures.map((f) => f.order)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(afterFeatures[2].title).toBe('New Feature');
    });
  });

  describe('Order Management - Instructors', () => {
    it('should maintain correct order sequences', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      const instructors = await prisma.academyInstructor.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      // Delete middle instructor
      await repository.deleteInstructor(academy.id, instructors[1].id);

      // Verify shift
      const afterInstructors = await prisma.academyInstructor.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterInstructors).toHaveLength(2);
      expect(afterInstructors[0].order).toBe(1);
      expect(afterInstructors[1].order).toBe(2); // Shifted from 3
    });
  });

  describe('Order Management - Testimonials', () => {
    it('should maintain correct order sequences', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Update testimonial order
      const testimonials = await prisma.academyTestimonial.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      // Move first to last
      await repository.updateTestimonial(academy.id, testimonials[0].id, {
        order: 3,
      });

      // Verify reordering
      const afterTestimonials = await prisma.academyTestimonial.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterTestimonials[0].name).toBe('Student 2');
      expect(afterTestimonials[0].order).toBe(1); // Shifted from 2
      expect(afterTestimonials[1].name).toBe('Student 3');
      expect(afterTestimonials[1].order).toBe(2); // Shifted from 3
      expect(afterTestimonials[2].name).toBe('Student 1');
      expect(afterTestimonials[2].order).toBe(3); // Moved from 1
    });
  });

  describe('Order Management - FAQs', () => {
    it('should maintain correct order sequences', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Create new FAQ at beginning
      await repository.createFaq(academy.id, {
        question: 'New Question?',
        answer: 'New Answer',
        order: 1,
      });

      // Verify all FAQs shifted
      const faqs = await prisma.academyFaq.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(faqs).toHaveLength(4);
      expect(faqs[0].question).toBe('New Question?');
      expect(faqs[0].order).toBe(1);
      expect(faqs[1].question).toBe('Question 1?');
      expect(faqs[1].order).toBe(2); // Shifted from 1
      expect(faqs[2].question).toBe('Question 2?');
      expect(faqs[2].order).toBe(3); // Shifted from 2
      expect(faqs[3].question).toBe('Question 3?');
      expect(faqs[3].order).toBe(4); // Shifted from 3
    });
  });

  describe('Cascade Delete', () => {
    it('should delete all related records when academy is deleted', async () => {
      const academy = await seedAcademyWithRelations();

      // Verify all relations exist
      const pricingBefore = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
      });
      const featuresBefore = await prisma.academyFeature.findMany({
        where: { academy_id: academy.id },
      });
      const themesBefore = await prisma.academyTheme.findMany({
        where: { academy_id: academy.id },
      });
      const topicsBefore = await prisma.academyTopic.findMany({
        where: { academy_id: academy.id },
      });
      const instructorsBefore = await prisma.academyInstructor.findMany({
        where: { academy_id: academy.id },
      });
      const testimonialsBefore = await prisma.academyTestimonial.findMany({
        where: { academy_id: academy.id },
      });
      const faqsBefore = await prisma.academyFaq.findMany({
        where: { academy_id: academy.id },
      });

      expect(pricingBefore.length).toBeGreaterThan(0);
      expect(featuresBefore.length).toBeGreaterThan(0);
      expect(themesBefore.length).toBeGreaterThan(0);
      expect(topicsBefore.length).toBeGreaterThan(0);
      expect(instructorsBefore.length).toBeGreaterThan(0);
      expect(testimonialsBefore.length).toBeGreaterThan(0);
      expect(faqsBefore.length).toBeGreaterThan(0);

      // Delete academy
      await prisma.academy.delete({
        where: { id: academy.id },
      });

      // Verify all related records are deleted (cascade)
      const pricingAfter = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
      });
      const featuresAfter = await prisma.academyFeature.findMany({
        where: { academy_id: academy.id },
      });
      const themesAfter = await prisma.academyTheme.findMany({
        where: { academy_id: academy.id },
      });
      const topicsAfter = await prisma.academyTopic.findMany({
        where: { academy_id: academy.id },
      });
      const instructorsAfter = await prisma.academyInstructor.findMany({
        where: { academy_id: academy.id },
      });
      const testimonialsAfter = await prisma.academyTestimonial.findMany({
        where: { academy_id: academy.id },
      });
      const faqsAfter = await prisma.academyFaq.findMany({
        where: { academy_id: academy.id },
      });

      expect(pricingAfter).toHaveLength(0);
      expect(featuresAfter).toHaveLength(0);
      expect(themesAfter).toHaveLength(0);
      expect(topicsAfter).toHaveLength(0);
      expect(instructorsAfter).toHaveLength(0);
      expect(testimonialsAfter).toHaveLength(0);
      expect(faqsAfter).toHaveLength(0);
    });
  });

  describe('Transaction Rollback', () => {
    it('should rollback on constraint violation during order management', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Get initial state
      const initialPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      const initialCount = initialPricing.length;
      const initialOrders = initialPricing.map((p) => ({ id: p.id, order: p.order }));

      // Attempt to create pricing with invalid academy_id (should fail)
      try {
        await repository.createPricing(999999, {
          name: 'Invalid Tier',
          original_price: 1000000,
          discount_price: 800000,
          order: 2,
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }

      // Verify database state unchanged
      const afterPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterPricing.length).toBe(initialCount);
      afterPricing.forEach((pricing, index) => {
        expect(pricing.id).toBe(initialOrders[index].id);
        expect(pricing.order).toBe(initialOrders[index].order);
      });
    });

    it('should rollback on error during update order operation', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Get initial state
      const initialPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      const initialOrders = initialPricing.map((p) => ({ id: p.id, order: p.order, name: p.name }));

      // Attempt to update non-existent pricing (should fail)
      try {
        await repository.updatePricing(academy.id, 999999, {
          order: 3,
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }

      // Verify database state unchanged
      const afterPricing = await prisma.academyPricing.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterPricing.length).toBe(initialOrders.length);
      afterPricing.forEach((pricing, index) => {
        expect(pricing.id).toBe(initialOrders[index].id);
        expect(pricing.order).toBe(initialOrders[index].order);
        expect(pricing.name).toBe(initialOrders[index].name);
      });
    });

    it('should rollback on error during delete operation', async () => {
      const academy = await seedAcademyWithOrderedSubTables();

      // Get initial state
      const initialFeatures = await prisma.academyFeature.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      const initialCount = initialFeatures.length;
      const initialOrders = initialFeatures.map((f) => ({ id: f.id, order: f.order }));

      // Attempt to delete non-existent feature (should fail)
      try {
        await repository.deleteFeature(academy.id, 999999);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }

      // Verify database state unchanged
      const afterFeatures = await prisma.academyFeature.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(afterFeatures.length).toBe(initialCount);
      afterFeatures.forEach((feature, index) => {
        expect(feature.id).toBe(initialOrders[index].id);
        expect(feature.order).toBe(initialOrders[index].order);
      });
    });
  });

  describe('GET Sub-resource List Methods', () => {
    it('findPricingsByAcademyId should return ordered pricing list', async () => {
      const academy = await seedAcademyWithRelations();
      const result = await repository.findPricingsByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // Verify ordering
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });

    it('findFeaturesByAcademyId should return ordered features list', async () => {
      const academy = await seedAcademyWithRelations();
      const result = await repository.findFeaturesByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });

    it('findInstructorsByAcademyId should return ordered instructors list', async () => {
      const academy = await seedAcademyWithRelations();
      const result = await repository.findInstructorsByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('findTopicsByAcademyId should return all topics across all themes', async () => {
      const academy = await seedAcademyWithRelations();
      const result = await repository.findTopicsByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((topic) => {
        expect(topic.academy_id).toBe(academy.id);
        expect(topic.theme_id).toBeDefined();
      });
    });

    it('findTestimonialsByAcademyId should return ordered testimonials list', async () => {
      const academy = await seedAcademyWithRelations();
      const result = await repository.findTestimonialsByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('findFaqsByAcademyId should return ordered FAQs list', async () => {
      const academy = await seedAcademyWithRelations();
      const result = await repository.findFaqsByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('findThemesByAcademyId should return themes with nested topics', async () => {
      const academy = await seedAcademyWithMultipleThemes(2, 3);
      const result = await repository.findThemesByAcademyId(academy.id);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      result.forEach((theme) => {
        expect(theme.topics).toBeDefined();
        expect(Array.isArray(theme.topics)).toBe(true);
        expect(theme.topics).toHaveLength(3);
      });
    });
  });

  describe('Theme Order Management', () => {
    it('should auto-append theme when no order is specified', async () => {
      const academy = await seedAcademy();

      const theme1 = await repository.createTheme(academy.id, { title: 'Theme A' });
      const theme2 = await repository.createTheme(academy.id, { title: 'Theme B' });

      expect(theme1.order).toBe(1);
      expect(theme2.order).toBe(2);
    });

    it('should shift existing themes when inserting at specific position', async () => {
      const academy = await seedAcademyWithMultipleThemes(3, 0);

      // Insert at position 2
      await repository.createTheme(academy.id, { title: 'Injected Theme', order: 2 });

      const themes = await prisma.academyTheme.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(themes).toHaveLength(4);
      expect(themes[1].title).toBe('Injected Theme');
      expect(themes[1].order).toBe(2);
      // Old theme 2 should now be 3
      expect(themes[2].order).toBe(3);
      // Old theme 3 should now be 4
      expect(themes[3].order).toBe(4);
    });

    it('should reorder themes forward (move up in list)', async () => {
      const academy = await seedAcademyWithMultipleThemes(4, 0);
      const themes = await repository.findThemesByAcademyId(academy.id);
      const themeToMove = themes[0]; // order 1

      // Move from position 1 to position 3
      await repository.updateTheme(academy.id, themeToMove.id, { order: 3 });

      const updated = await prisma.academyTheme.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      const movedTheme = updated.find((t) => t.id === themeToMove.id);
      expect(movedTheme.order).toBe(3);
      // Verify no duplicate orders
      const orders = updated.map((t) => t.order);
      expect(new Set(orders).size).toBe(orders.length);
    });

    it('should shift-on-delete and keep orders contiguous', async () => {
      const academy = await seedAcademyWithMultipleThemes(3, 0);
      const themes = await repository.findThemesByAcademyId(academy.id);
      const themeToDelete = themes[1]; // order 2

      await repository.deleteTheme(academy.id, themeToDelete.id);

      const remaining = await prisma.academyTheme.findMany({
        where: { academy_id: academy.id },
        orderBy: { order: 'asc' },
      });

      expect(remaining).toHaveLength(2);
      expect(remaining[0].order).toBe(1);
      expect(remaining[1].order).toBe(2);
    });

    it('should cascade delete topics when theme is deleted', async () => {
      const academy = await seedAcademyWithMultipleThemes(2, 3);
      const themes = await repository.findThemesByAcademyId(academy.id);
      const themeToDelete = themes[0];

      const topicsBefore = await prisma.academyTopic.findMany({
        where: { theme_id: themeToDelete.id },
      });
      expect(topicsBefore).toHaveLength(3);

      await repository.deleteTheme(academy.id, themeToDelete.id);

      const topicsAfter = await prisma.academyTopic.findMany({
        where: { theme_id: themeToDelete.id },
      });
      expect(topicsAfter).toHaveLength(0);
    });
  });

  describe('Topic Order Management (scoped by theme_id)', () => {
    it('should keep topic orders independent per theme', async () => {
      const academy = await seedAcademy();
      const theme1 = await prisma.academyTheme.create({
        data: { academy_id: academy.id, title: 'Theme 1', order: 1 },
      });
      const theme2 = await prisma.academyTheme.create({
        data: { academy_id: academy.id, title: 'Theme 2', order: 2 },
      });

      await repository.createTopic(academy.id, { theme_id: theme1.id, title: 'T1 Topic A' });
      await repository.createTopic(academy.id, { theme_id: theme1.id, title: 'T1 Topic B' });
      await repository.createTopic(academy.id, { theme_id: theme2.id, title: 'T2 Topic A' });

      const theme1Topics = await prisma.academyTopic.findMany({
        where: { theme_id: theme1.id },
        orderBy: { order: 'asc' },
      });
      const theme2Topics = await prisma.academyTopic.findMany({
        where: { theme_id: theme2.id },
        orderBy: { order: 'asc' },
      });

      // Each theme has its own sequence starting from 1
      expect(theme1Topics[0].order).toBe(1);
      expect(theme1Topics[1].order).toBe(2);
      expect(theme2Topics[0].order).toBe(1);
    });

    it('should only shift topics within the same theme on insert', async () => {
      const academy = await seedAcademy();
      const theme1 = await prisma.academyTheme.create({
        data: { academy_id: academy.id, title: 'Theme 1', order: 1 },
      });
      const theme2 = await prisma.academyTheme.create({
        data: { academy_id: academy.id, title: 'Theme 2', order: 2 },
      });

      await repository.createTopic(academy.id, { theme_id: theme1.id, title: 'T1-1', order: 1 });
      await repository.createTopic(academy.id, { theme_id: theme1.id, title: 'T1-2', order: 2 });
      await repository.createTopic(academy.id, { theme_id: theme2.id, title: 'T2-1', order: 1 });

      // Insert at position 1 in theme1 only
      await repository.createTopic(academy.id, { theme_id: theme1.id, title: 'Injected', order: 1 });

      const t1Topics = await prisma.academyTopic.findMany({
        where: { theme_id: theme1.id },
        orderBy: { order: 'asc' },
      });
      const t2Topics = await prisma.academyTopic.findMany({
        where: { theme_id: theme2.id },
        orderBy: { order: 'asc' },
      });

      expect(t1Topics[0].title).toBe('Injected');
      expect(t1Topics[0].order).toBe(1);
      expect(t1Topics[1].order).toBe(2);
      expect(t1Topics[2].order).toBe(3);
      // theme2 topics must be unaffected
      expect(t2Topics[0].order).toBe(1);
    });
  });

  describe('Database Cleanup', () => {
    it('should have clean state after resetDatabase', async () => {
      // Seed some data
      await seedAcademyWithRelations();

      // Reset database
      await resetDatabase();

      // Verify all tables are empty
      const academies = await prisma.academy.findMany();
      const pricing = await prisma.academyPricing.findMany();
      const features = await prisma.academyFeature.findMany();
      const themes = await prisma.academyTheme.findMany();
      const topics = await prisma.academyTopic.findMany();
      const instructors = await prisma.academyInstructor.findMany();
      const testimonials = await prisma.academyTestimonial.findMany();
      const faqs = await prisma.academyFaq.findMany();

      expect(academies).toHaveLength(0);
      expect(pricing).toHaveLength(0);
      expect(features).toHaveLength(0);
      expect(themes).toHaveLength(0);
      expect(topics).toHaveLength(0);
      expect(instructors).toHaveLength(0);
      expect(testimonials).toHaveLength(0);
      expect(faqs).toHaveLength(0);
    });
  });
});
