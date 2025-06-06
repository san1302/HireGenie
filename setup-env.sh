#!/bin/bash

# HireGenie Environment Setup Script
# This script helps you set up environment variables for local development

echo "🚀 HireGenie Environment Setup"
echo "================================"

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Create .env.local file
cat > .env.local << 'ENVEOF'
# HireGenie Environment Variables
# Fill in your actual values below

# ================================
# DATABASE CONFIGURATION (Supabase)
# ================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ================================
# AI SERVICE CONFIGURATION
# ================================
OPENAI_API_KEY=sk-your_openai_api_key_here

# ================================
# PAYMENT SERVICE (Polar)
# ================================
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_ORGANIZATION_ID=your_polar_organization_id

# ================================
# EXTERNAL SERVICES
# ================================
RESUME_PARSER_URL=http://localhost:8000

# ================================
# APPLICATION CONFIGURATION
# ================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVEOF

echo "✅ Created .env.local file"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and fill in your actual values"
echo "2. Get Supabase keys from: https://supabase.com/dashboard"
echo "3. Get OpenAI key from: https://platform.openai.com/api-keys"
echo "4. Get Polar keys from: https://polar.sh"
echo "5. Run 'npm run dev' to start development"
echo ""
echo "📖 For detailed instructions, see ENV_SETUP_GUIDE.md" 