#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set
 * Run before starting the application in production
 */

const fs = require('fs');
const path = require('path');

// Required environment variables by environment
const REQUIRED_VARS = {
  development: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
  staging: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SQUARE_APPLICATION_ID',
    'VITE_SQUARE_LOCATION_ID',
    'SQUARE_ACCESS_TOKEN',
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'FRONTEND_URL',
  ],
  production: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SQUARE_APPLICATION_ID',
    'VITE_SQUARE_LOCATION_ID',
    'SQUARE_ACCESS_TOKEN',
    'SQUARE_WEBHOOK_SIGNATURE_KEY',
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'FROM_NAME',
    'OWNER_EMAIL',
    'FRONTEND_URL',
    'VITE_GOOGLE_MAPS_API_KEY',
  ],
};

// Critical variables that will cause app to fail if missing
const CRITICAL_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'VITE_SENTRY_DSN',
  'VITE_GOOGLE_MAPS_API_KEY',
];

function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const env = nodeEnv === 'production' ? 'production' : nodeEnv === 'staging' ? 'staging' : 'development';
  
  console.log(`🔍 Validating environment variables for: ${env}`);
  console.log('─'.repeat(50));
  
  const required = REQUIRED_VARS[env] || REQUIRED_VARS.development;
  const missing = [];
  const criticalMissing = [];
  const recommendedMissing = [];
  
  // Check required variables
  for (const varName of required) {
    const value = process.env[varName];
    if (!value || value.trim() === '' || value.includes('your_') || value.includes('${')) {
      missing.push(varName);
      if (CRITICAL_VARS.includes(varName)) {
        criticalMissing.push(varName);
      }
    }
  }
  
  // Check recommended variables
  for (const varName of RECOMMENDED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '' || value.includes('your_') || value.includes('${')) {
      recommendedMissing.push(varName);
    }
  }
  
  // Report results
  if (criticalMissing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    criticalMissing.forEach(v => console.error(`   - ${v}`));
    console.error('\n⚠️  Application will not function without these variables!');
    process.exit(1);
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\n⚠️  Please set these variables before starting the application.');
    process.exit(1);
  }
  
  if (recommendedMissing.length > 0) {
    console.warn('⚠️  Recommended environment variables not set:');
    recommendedMissing.forEach(v => console.warn(`   - ${v}`));
    console.warn('\n💡 These are optional but recommended for production.');
  }
  
  // Validate specific values
  validateSpecificValues(env);
  
  console.log('✅ All required environment variables are set!');
  console.log('─'.repeat(50));
  
  return true;
}

function validateSpecificValues(env) {
  // Validate URLs
  const urlVars = ['VITE_SUPABASE_URL', 'FRONTEND_URL'];
  for (const varName of urlVars) {
    const value = process.env[varName];
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      console.warn(`⚠️  ${varName} should be a valid URL (starts with http:// or https://)`);
    }
  }
  
  // Validate email format
  const emailVars = ['FROM_EMAIL', 'OWNER_EMAIL'];
  for (const varName of emailVars) {
    const value = process.env[varName];
    if (value && !value.includes('@')) {
      console.warn(`⚠️  ${varName} should be a valid email address`);
    }
  }
  
  // Validate Square environment
  if (process.env.SQUARE_ENVIRONMENT) {
    const squareEnv = process.env.SQUARE_ENVIRONMENT;
    if (!['sandbox', 'production'].includes(squareEnv)) {
      console.warn(`⚠️  SQUARE_ENVIRONMENT should be 'sandbox' or 'production', got: ${squareEnv}`);
    }
  }
  
  // Production-specific validations
  if (env === 'production') {
    if (process.env.SQUARE_ENVIRONMENT !== 'production') {
      console.warn('⚠️  SQUARE_ENVIRONMENT should be "production" in production!');
    }
    
    if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('https://')) {
      console.warn('⚠️  FRONTEND_URL should use HTTPS in production!');
    }
    
    if (process.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.warn('⚠️  VITE_ENABLE_DEBUG_MODE should be false in production!');
    }
  }
}

// Run validation
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };
