/**
 * Validate required environment variables on startup
 */

const requiredEnvVars = {
  // Database
  SUPABASE_URL: 'Supabase project URL',
  SUPABASE_ANON_KEY: 'Supabase anonymous key',
  
  // Optional but recommended
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (optional, for admin operations)',
  ADMIN_API_KEY: 'Admin API key (optional, defaults to development key)',
  
  // Payment
  SQUARE_ACCESS_TOKEN: 'Square API access token (optional, for payments)',
  SQUARE_LOCATION_ID: 'Square location ID (optional, for payments)',
  
  // Email
  RESEND_API_KEY: 'Resend API key (optional, for email notifications)',
  
  // Frontend
  FRONTEND_URL: 'Frontend URL (optional, for CORS)',
};

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_API_KEY',
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'RESEND_API_KEY',
  'FRONTEND_URL',
  'SENTRY_DSN',
  'NODE_ENV',
  'PORT',
];

/**
 * Validate environment variables
 */
export function validateEnvironment() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (optionalEnvVars.includes(key)) {
      // Optional but warn if missing in production
      if (!process.env[key] && process.env.NODE_ENV === 'production') {
        warnings.push(`${key} (${description}) is recommended in production`);
      }
    } else {
      // Required
      if (!process.env[key]) {
        missing.push(`${key} (${description})`);
      }
    }
  }

  // Check critical variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ CRITICAL: Missing required Supabase configuration');
    console.error('   The application cannot function without Supabase credentials');
    process.exit(1);
  }

  // Report missing variables
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease set these variables in your .env file or environment');
    process.exit(1);
  }

  // Report warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  // Validate format of critical variables
  if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('https://')) {
    console.warn('⚠️  SUPABASE_URL should start with https://');
  }

  if (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.length < 100) {
    console.warn('⚠️  SUPABASE_ANON_KEY seems too short. Please verify it is correct.');
  }

  console.log('✅ Environment variables validated');
}
