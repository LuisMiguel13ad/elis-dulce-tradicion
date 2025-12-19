import rateLimit from 'express-rate-limit';

/**
 * General rate limiter - 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for order creation - 10 requests per minute
 */
export const orderCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 order creations per minute
  message: {
    success: false,
    error: {
      code: 'ORDER_RATE_LIMIT_EXCEEDED',
      message: 'Too many order requests. Please wait a moment before creating another order.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
});

/**
 * Authentication rate limiter - 5 login attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * API key rate limiter - 1000 requests per minute for admin endpoints
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Higher limit for admin operations
  message: {
    success: false,
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Admin rate limit exceeded.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
