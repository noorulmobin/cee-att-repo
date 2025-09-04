#!/bin/bash

echo "🚀 Deploying to Vercel..."
echo "========================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up Supabase database (run: node setup-supabase.js)"
    echo "2. Add environment variables to Vercel dashboard"
    echo "3. Redeploy your app"
    echo ""
    echo "🔧 Environment variables needed:"
    echo "   NEXT_PUBLIC_SUPABASE_URL"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

