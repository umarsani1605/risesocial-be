import { createErrorResponseSchema, createSuccessResponseSchema } from '../shared/baseSchemas.js';

const timeSeriesPointSchema = {
  type: 'object',
  required: ['date', 'value'],
  properties: {
    date: { type: 'string' },
    value: { type: 'number' },
    label: { type: 'string' },
  },
};

const categoryBreakdownSchema = {
  type: 'object',
  required: ['name', 'value'],
  properties: {
    name: { type: 'string' },
    value: { type: 'number' },
    color: { type: 'string' },
  },
};

const analyticsRangeQuerystring = {
  type: 'object',
  properties: {
    period: {
      type: 'string',
      enum: ['all-time', 'today', 'yesterday', '7d', '30d', '1m', '3m', '6m', '1y', 'custom'],
    },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  if: {
    properties: { period: { const: 'custom' } },
    required: ['period'],
  },
  then: {
    required: ['startDate', 'endDate'],
  },
};

const overviewSchema = {
  type: 'object',
  properties: {
    totalRevenue: { type: 'number' },
    totalRevenueTrend: { type: 'number' },
    totalUsers: { type: 'number' },
    totalUsersTrend: { type: 'number' },
    activeCohorts: { type: 'number' },
    activeCohortsTrend: { type: 'number' },
    rylsRegistrations: { type: 'number' },
    rylsRegistrationsTrend: { type: 'number' },
    revenueTrend: { type: 'array', items: timeSeriesPointSchema },
    usersTrend: { type: 'array', items: timeSeriesPointSchema },
  },
};

const rylsSummarySchema = {
  type: 'object',
  properties: {
    submitted: { type: 'number' },
    drafts: { type: 'number' },
  },
};

const rylsTrendPointSchema = {
  type: 'object',
  properties: {
    date: { type: 'string' },
    count: { type: 'number' },
  },
};

const rylsDemographicsItemSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    count: { type: 'number' },
  },
};

const rylsDemographicsSchema = {
  type: 'object',
  properties: {
    byNationality: { type: 'array', items: rylsDemographicsItemSchema },
    byDiscoverSource: { type: 'array', items: rylsDemographicsItemSchema },
    byGender: { type: 'array', items: rylsDemographicsItemSchema },
    byAgeRange: { type: 'array', items: rylsDemographicsItemSchema },
    byScholarshipType: { type: 'array', items: rylsDemographicsItemSchema },
  },
};

const tag = ['Admin - Analytics'];

export const getAnalyticsOverviewSchema = {
  tags: tag,
  summary: 'Get admin analytics overview',
  response: {
    200: createSuccessResponseSchema(overviewSchema, 'Admin analytics overview'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getTimeSeriesAnalyticsSchema = {
  tags: tag,
  querystring: analyticsRangeQuerystring,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: timeSeriesPointSchema }, 'Time series analytics'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getCategoryBreakdownAnalyticsSchema = {
  tags: tag,
  querystring: analyticsRangeQuerystring,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: categoryBreakdownSchema }, 'Category breakdown analytics'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getProgramSummaryAnalyticsSchema = {
  tags: tag,
  querystring: analyticsRangeQuerystring,
  response: {
    200: createSuccessResponseSchema(rylsSummarySchema, 'Program analytics summary'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getProgramTrendAnalyticsSchema = {
  tags: tag,
  querystring: analyticsRangeQuerystring,
  response: {
    200: createSuccessResponseSchema({ type: 'array', items: rylsTrendPointSchema }, 'Program analytics trend'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};

export const getProgramDemographicsAnalyticsSchema = {
  tags: tag,
  querystring: analyticsRangeQuerystring,
  response: {
    200: createSuccessResponseSchema(rylsDemographicsSchema, 'Program analytics demographics'),
    500: createErrorResponseSchema(500, 'Internal Server Error'),
  },
};
