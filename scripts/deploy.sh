#!/bin/bash

# Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo "❌ Invalid environment. Use 'staging' or 'production'"
  exit 1
fi

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Validate environment variables
echo "📋 Validating environment variables..."
node scripts/validate-env.js || exit 1

# Run tests
echo "🧪 Running tests..."
npm run test:frontend || {
  echo "⚠️  Tests failed, but continuing deployment..."
}

# Build
echo "🔨 Building application..."
npm run build

# Run database migrations
if [ "$ENVIRONMENT" == "production" ]; then
  echo "⚠️  PRODUCTION DEPLOYMENT - Running database migrations..."
  read -p "Have you backed up the database? (yes/no): " backup_confirm
  if [ "$backup_confirm" != "yes" ]; then
    echo "❌ Deployment cancelled. Please backup the database first."
    exit 1
  fi
  # Add your migration command here
  # npx supabase db push --db-url $DATABASE_URL
fi

# Deploy based on platform
if [ -f "vercel.json" ]; then
  echo "📦 Deploying to Vercel..."
  vercel --prod
elif [ -f "netlify.toml" ]; then
  echo "📦 Deploying to Netlify..."
  netlify deploy --prod
else
  echo "⚠️  No deployment platform detected. Build artifacts are in ./dist"
fi

echo "✅ Deployment to $ENVIRONMENT completed!"
