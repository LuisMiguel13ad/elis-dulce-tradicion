/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication required or invalid token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: "UNAUTHORIZED"
 *               message: "Authentication required"
 *
 *     ForbiddenError:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: "FORBIDDEN"
 *               message: "Access denied"
 *
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: "NOT_FOUND"
 *               message: "Resource not found"
 *
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: "VALIDATION_ERROR"
 *               message: "Invalid input data"
 *               details:
 *                 field: "customer_email"
 *                 message: "Invalid email format"
 *
 *     RateLimitError:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: "RATE_LIMIT_EXCEEDED"
 *               message: "Too many requests. Please try again later."
 *
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             success: false
 *             error:
 *               code: "INTERNAL_SERVER_ERROR"
 *               message: "An unexpected error occurred"
 */
