import { adminAnalyticsController } from '../../controllers/admin/analyticsController.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/permissionMiddleware.js';
import {
  getAnalyticsOverviewSchema,
  getCategoryBreakdownAnalyticsSchema,
  getProgramDemographicsAnalyticsSchema,
  getProgramSummaryAnalyticsSchema,
  getProgramTrendAnalyticsSchema,
  getTimeSeriesAnalyticsSchema,
} from '../../schemas/admin/analyticsSchemas.js';

export default async function adminAnalyticsRoutes(fastify) {
  fastify.addHook('preHandler', adminMiddleware);

  fastify.get('/overview', {
    schema: getAnalyticsOverviewSchema,
    preHandler: requirePermission('admin.dashboard'),
    handler: adminAnalyticsController.getOverview,
  });

  fastify.get('/revenue/trend', {
    schema: getTimeSeriesAnalyticsSchema,
    preHandler: requirePermission('admin.transactions'),
    handler: adminAnalyticsController.getRevenueTrend,
  });

  fastify.get('/revenue/payment-status', {
    schema: getCategoryBreakdownAnalyticsSchema,
    preHandler: requirePermission('admin.transactions'),
    handler: adminAnalyticsController.getPaymentStatusBreakdown,
  });

  fastify.get('/revenue/by-type', {
    schema: getCategoryBreakdownAnalyticsSchema,
    preHandler: requirePermission('admin.transactions'),
    handler: adminAnalyticsController.getRevenueByType,
  });

  fastify.get('/users/registrations-trend', {
    schema: getTimeSeriesAnalyticsSchema,
    preHandler: requirePermission('admin.users'),
    handler: adminAnalyticsController.getUserRegistrationsTrend,
  });

  fastify.get('/users/distribution', {
    schema: getCategoryBreakdownAnalyticsSchema,
    preHandler: requirePermission('admin.users'),
    handler: adminAnalyticsController.getUserDistribution,
  });

  fastify.get('/academies/enrollments', {
    schema: getCategoryBreakdownAnalyticsSchema,
    preHandler: requirePermission('admin.academy'),
    handler: adminAnalyticsController.getAcademyEnrollments,
  });

  fastify.get('/academies/cohort-students', {
    schema: getCategoryBreakdownAnalyticsSchema,
    preHandler: requirePermission('admin.academy'),
    handler: adminAnalyticsController.getCohortStudents,
  });

  fastify.get('/programs/summary', {
    schema: getProgramSummaryAnalyticsSchema,
    preHandler: requirePermission('admin.ryls'),
    handler: adminAnalyticsController.getProgramSummary,
  });

  fastify.get('/programs/trend', {
    schema: getProgramTrendAnalyticsSchema,
    preHandler: requirePermission('admin.ryls'),
    handler: adminAnalyticsController.getProgramTrend,
  });

  fastify.get('/programs/demographics', {
    schema: getProgramDemographicsAnalyticsSchema,
    preHandler: requirePermission('admin.ryls'),
    handler: adminAnalyticsController.getProgramDemographics,
  });
}
