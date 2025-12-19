import pool from '../db/connection.js';

/**
 * Standardized error response format
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Log error to database
 */
async function logErrorToDatabase(error, req) {
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO error_logs (
          error_code, error_message, stack_trace, request_path, 
          request_method, user_id, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [
          error.code || 'UNKNOWN_ERROR',
          error.message || 'Unknown error',
          error.stack || null,
          req.path || null,
          req.method || null,
          req.user?.id || null,
          req.ip || null,
          req.get('user-agent') || null,
        ]
      );
    } finally {
      client.release();
    }
  } catch (logError) {
    // Don't throw - logging failure shouldn't break error handling
    console.error('Failed to log error to database:', logError);
  }
}

/**
 * Send error to Sentry (if configured)
 */
function sendToSentry(error, req) {
  // Only in production
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    try {
      // Import Sentry dynamically (only if configured)
      import('@sentry/node').then((Sentry) => {
        Sentry.captureException(error, {
          tags: {
            path: req.path,
            method: req.method,
            userId: req.user?.id,
          },
          extra: {
            body: req.body,
            query: req.query,
            params: req.params,
          },
        });
      }).catch(() => {
        // Sentry not available, skip
      });
    } catch (err) {
      // Sentry not configured, skip
    }
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = async (err, req, res, next) => {
  // Set default error
  let error = err;
  
  // If error is not an AppError, wrap it
  if (!error.isOperational) {
    error = new AppError(
      error.message || 'Internal server error',
      500,
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error.stack : null
    );
  }
  
  // Log error
  console.error('Error:', {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
  
  // Log to database
  await logErrorToDatabase(error, req);
  
  // Send to Sentry (production only)
  sendToSentry(error, req);
  
  // Send response
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack }),
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Async error wrapper - catches errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
