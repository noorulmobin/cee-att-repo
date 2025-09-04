#!/usr/bin/env node

/**
 * Quick Supabase Setup Script
 * This script helps you set up Supabase for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Supabase Setup for Vercel Deployment');
console.log('=====================================\n');

console.log('📋 Step 1: Create Supabase Project');
console.log('1. Go to https://supabase.com');
console.log('2. Click "New Project"');
console.log('3. Choose your organization');
console.log('4. Enter project name: attendance-app');
console.log('5. Enter database password (save this!)');
console.log('6. Choose region closest to your users');
console.log('7. Click "Create new project"\n');

console.log('📋 Step 2: Set Up Database Tables');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Click on "SQL Editor" in the left sidebar');
console.log('3. Click "New query"');
console.log('4. Copy and paste the contents of supabase-setup.sql');
console.log('5. Click "Run" to execute the script\n');

console.log('📋 Step 3: Get Your Credentials');
console.log('1. Go to "Settings" → "API" in your Supabase dashboard');
console.log('2. Copy the following values:');
console.log('   - Project URL (looks like: https://your-project.supabase.co)');
console.log('   - Anon/Public Key (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)\n');

console.log('📋 Step 4: Add Environment Variables to Vercel');
console.log('1. Go to your Vercel project dashboard');
console.log('2. Go to "Settings" → "Environment Variables"');
console.log('3. Add these variables:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL = your_project_url');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key');
console.log('4. Click "Save"');
console.log('5. Go to "Deployments" and click "Redeploy"\n');

console.log('✅ After setup, your app will work on both:');
console.log('   - Local development (with local JSON fallback)');
console.log('   - Vercel production (with Supabase database)\n');

console.log('🔧 Need help? Check VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('💡 Tip: Create a .env.local file for local development:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key\n');
}
