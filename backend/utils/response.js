/**
 * Standardized API response utilities
 */

/**
 * Send success response
 */
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send error response
 */
export function sendError(res, error, statusCode = 400) {
  const errorResponse = {
    success: false,
    error: {
      code: error.code || 'ERROR',
      message: error.message || 'An error occurred',
      ...(error.details && { details: error.details }),
    },
  };

  return res.status(statusCode).json(errorResponse);
}

/**
 * Send paginated response
 */
export function sendPaginated(res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page || 1,
      perPage: pagination.perPage || 20,
      total: pagination.total || data.length,
      totalPages: Math.ceil((pagination.total || data.length) / (pagination.perPage || 20)),
    },
  });
}
