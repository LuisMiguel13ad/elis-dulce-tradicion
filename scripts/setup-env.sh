#!/bin/bash
# Environment Setup Script
# Helps set up environment files from examples

set -e

echo "🚀 Setting up environment files..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to copy example file if it doesn't exist
setup_env_file() {
    local env_name=$1
    local example_file=".env.${env_name}.example"
    local env_file=".env.${env_name}"
    
    if [ -f "$env_file" ]; then
        echo -e "${YELLOW}⚠️  $env_file already exists. Skipping...${NC}"
    else
        if [ -f "$example_file" ]; then
            cp "$example_file" "$env_file"
            echo -e "${GREEN}✅ Created $env_file from example${NC}"
            echo -e "${YELLOW}⚠️  Don't forget to fill in your actual values!${NC}"
        else
            echo -e "${RED}❌ Example file $example_file not found${NC}"
        fi
    fi
}

# Setup environment files
echo ""
echo "Setting up development environment..."
setup_env_file "development"

echo ""
echo "Setting up staging environment..."
setup_env_file "staging"

echo ""
echo "Setting up production environment..."
setup_env_file "production"

# Make validate script executable
if [ -f "scripts/validate-env.js" ]; then
    chmod +x scripts/validate-env.js
    echo -e "${GREEN}✅ Made validate-env.js executable${NC}"
fi

echo ""
echo -e "${GREEN}✨ Environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env.development and fill in your development values"
echo "2. Edit .env.staging and fill in your staging values"
echo "3. Edit .env.production and fill in your production values"
echo "4. Run 'npm run validate-env' to verify your configuration"
echo ""
