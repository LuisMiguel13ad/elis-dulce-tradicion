import express from 'express';
import pool from '../db/connection.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API and all dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         responseTime:
 *                           type: number
 *                           example: 12
 *                     supabase:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                     square:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: configured
 *       503:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 services:
 *                   type: object
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: {},
  };

  try {
    // Check database connection
    const dbStart = Date.now();
    try {
      await pool.query('SELECT 1');
      health.services.database = {
        status: 'connected',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      health.services.database = {
        status: 'error',
        error: error.message,
      };
      health.status = 'error';
    }

    // Check Supabase connection
    health.services.supabase = {
      status: process.env.SUPABASE_URL ? 'configured' : 'not_configured',
      url: process.env.SUPABASE_URL ? 'configured' : null,
    };

    // Check Square configuration
    health.services.square = {
      status: process.env.SQUARE_ACCESS_TOKEN ? 'configured' : 'not_configured',
      environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
    };

    // Check email service (Resend)
    health.services.email = {
      status: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
    };

    const statusCode = health.status === 'ok' ? 200 : 503;
    health.responseTime = Date.now() - startTime;

    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
