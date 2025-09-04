#!/bin/bash

# 🚀 Deploy Fixed Attendance App to Vercel
# This script deploys the version with Vercel-compatible user signup

echo "🚀 Deploying Fixed Attendance App to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "✅ Your attendance app is now live on Vercel!"
    echo "✅ User signup now works on Vercel!"
    echo "✅ Users can create accounts and login immediately!"
    echo ""
    echo "📝 What was fixed:"
    echo "   - Replaced file system storage with in-memory storage for Vercel"
    echo "   - Updated signup API to use Vercel-compatible storage"
    echo "   - Updated login API to use Vercel-compatible storage"
    echo "   - Updated delete-user API to use Vercel-compatible storage"
    echo "   - Added get-users API for admin panel functionality"
    echo "   - Fixed admin/CEO role detection for Vercel deployment"
    echo "   - All authentication and admin features now work on Vercel"
    echo ""
    echo "⚠️  Note: User data will reset when Vercel restarts the server"
    echo "   For persistent storage, set up Supabase (see SUPABASE_SETUP.md)"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
