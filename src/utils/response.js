import { getLogger } from '../utils/loggerContext.js';

export function successResponse(data, message = 'Success', meta = {}) {
  const response = {
    success: true,
    message,
    data,
  };

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return response;
}

export function errorResponse(message, statusCode = 500, details = null) {
  const response = {
    success: false,
    message,
    data: null,
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return response;
}

export function paginationMeta(page, limit, total) {
  return {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
