import { adminAnalyticsService } from '../../services/admin/analyticsService.js';
import { successResponse } from '../../utils/response.js';

export class AdminAnalyticsController {
  constructor(service = adminAnalyticsService) {
    this.service = service;
  }

  getOverview = async (_request, reply) => {
    const result = await this.service.getOverview();
    return reply.send(successResponse(result, 'Analytics overview retrieved successfully'));
  };

  getRevenueTrend = async (request, reply) => {
    const result = await this.service.getRevenueTrend(request.query);
    return reply.send(successResponse(result, 'Revenue trend retrieved successfully'));
  };

  getPaymentStatusBreakdown = async (request, reply) => {
    const result = await this.service.getPaymentStatusBreakdown(request.query);
    return reply.send(successResponse(result, 'Payment status breakdown retrieved successfully'));
  };

  getRevenueByType = async (request, reply) => {
    const result = await this.service.getRevenueByType(request.query);
    return reply.send(successResponse(result, 'Revenue by type retrieved successfully'));
  };

  getUserRegistrationsTrend = async (request, reply) => {
    const result = await this.service.getUserRegistrationsTrend(request.query);
    return reply.send(successResponse(result, 'User registrations trend retrieved successfully'));
  };

  getUserDistribution = async (request, reply) => {
    const result = await this.service.getUserDistribution(request.query);
    return reply.send(successResponse(result, 'User distribution retrieved successfully'));
  };

  getAcademyEnrollments = async (request, reply) => {
    const result = await this.service.getAcademyEnrollments(request.query);
    return reply.send(successResponse(result, 'Academy enrollments retrieved successfully'));
  };

  getCohortStudents = async (request, reply) => {
    const result = await this.service.getCohortStudents(request.query);
    return reply.send(successResponse(result, 'Cohort students retrieved successfully'));
  };

  getProgramSummary = async (request, reply) => {
    const result = await this.service.getProgramSummary(request.query);
    return reply.send(successResponse(result, 'Program analytics summary retrieved successfully'));
  };

  getProgramTrend = async (request, reply) => {
    const result = await this.service.getProgramTrend(request.query);
    return reply.send(successResponse(result, 'Program analytics trend retrieved successfully'));
  };

  getProgramDemographics = async (request, reply) => {
    const result = await this.service.getProgramDemographics(request.query);
    return reply.send(successResponse(result, 'Program analytics demographics retrieved successfully'));
  };
}

export const adminAnalyticsController = new AdminAnalyticsController();
