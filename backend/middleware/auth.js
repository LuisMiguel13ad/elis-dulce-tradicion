// Middleware to protect admin routes
// Supports both API key (admin) and Supabase JWT (customer)

import { AppError } from './errorHandler.js';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// Security: Fail if ADMIN_API_KEY is not set in production
if (!ADMIN_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('❌ CRITICAL: ADMIN_API_KEY environment variable must be set in production');
  process.exit(1);
}
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabaseClient = null;

// Initialize Supabase client once
async function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return supabaseClient;
}

/**
 * Verify Supabase JWT token
 */
async function verifySupabaseToken(token) {
  if (!SUPABASE_URL) {
    throw new AppError('Supabase not configured', 500, 'CONFIG_ERROR');
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    throw new AppError('Failed to initialize Supabase client', 500, 'CONFIG_ERROR');
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: profile?.role || 'customer',
  };
}

/**
 * Require authentication (API key or JWT token)
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Check for API key in headers (admin access)
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey && apiKey === ADMIN_API_KEY) {
      // Admin access - set user from API key context
      req.user = { isAdmin: true, role: 'owner' };
      return next();
    }
    
    // Check for Supabase JWT token (customer/admin access)
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const user = await verifySupabaseToken(token);
    req.user = user;
    
    next();
  } catch (error) {
    console.log(`⛔ Blocked unauthorized access to ${req.path} from ${req.ip}`);
    
    if (error instanceof AppError) {
      return next(error);
    }
    
    next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
  }
};

/**
 * Require admin role (owner or baker)
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // First check authentication
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    // Check if user is admin via API key
    if (req.user.isAdmin) {
      return next();
    }

    // Check if user has admin role
    const adminRoles = ['owner', 'baker'];
    if (!adminRoles.includes(req.user.role)) {
      throw new AppError('Admin access required', 403, 'FORBIDDEN');
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Admin access required', 403, 'FORBIDDEN'));
  }
};

/**
 * Require owner role specifically
 */
export const requireOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    if (req.user.isAdmin || req.user.role === 'owner') {
      return next();
    }

    throw new AppError('Owner access required', 403, 'FORBIDDEN');
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Owner access required', 403, 'FORBIDDEN'));
  }
};

// Middleware to protect PII in public responses
// This wraps the response json method to filter sensitive fields
export const maskPII = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // If it's an array of orders (public list) and NOT authenticated
    // we should mask the data. But actually, we should just block public access 
    // to the full order list entirely (which requireAuth does).
    
    // This middleware might be useful if we want to return a "public status view" 
    // of an order without revealing the customer email/phone.
    
    // For now, requireAuth is the primary defense.
    return originalJson.call(this, data);
  };
  
  next();
};
