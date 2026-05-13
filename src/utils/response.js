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

  if (details && (process.env.NODE_ENV === 'development' || statusCode < 500)) {
    // eslint-disable-next-line no-control-regex
    const stripAnsi = (str) => typeof str === 'string' ? str.replace(/\u001b\[[0-9;]*m/g, '') : str;
    response.details = stripAnsi(details);
  }

  return response;
}

export function toFileUrl(filePath) {
  if (!filePath) return null;
  const base = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');
  return `${base}/uploads/${filePath}`;
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
