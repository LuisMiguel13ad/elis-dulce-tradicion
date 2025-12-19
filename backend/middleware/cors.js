import cors from 'cors';

/**
 * CORS configuration with security best practices
 */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5178',
  process.env.FRONTEND_URL,
].filter(Boolean);

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      // In production, be more strict
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS - origin required in production'));
      }
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins (for testing)
      callback(null, true);
    } else {
      console.log('⛔ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Requested-With',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};

export const corsMiddleware = cors(corsOptions);
