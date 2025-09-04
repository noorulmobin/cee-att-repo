#!/usr/bin/env node

/**
 * Database Setup Helper Script
 * This script helps you set up Supabase database for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️  Vercel Database Setup Helper');
console.log('================================\n');

console.log('📋 Step 1: Create Supabase Project');
console.log('1. Go to https://supabase.com');
console.log('2. Sign up and create a new project');
console.log('3. Wait for project to be ready (2-3 minutes)\n');

console.log('📋 Step 2: Set Up Database Tables');
console.log('1. In Supabase dashboard, go to "SQL Editor"');
console.log('2. Click "New query"');
console.log('3. Copy the contents of supabase-setup.sql');
console.log('4. Paste and click "Run"\n');

console.log('📋 Step 3: Get Your Credentials');
console.log('1. Go to "Settings" → "API" in Supabase');
console.log('2. Copy your Project URL and Anon Key\n');

console.log('📋 Step 4: Configure Environment Variables');
console.log('For local development, create/update .env.local:');
console.log('NEXT_PUBLIC_SUPABASE_URL=your_project_url_here');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here\n');

console.log('For Vercel deployment:');
console.log('1. Go to Vercel dashboard → Settings → Environment Variables');
console.log('2. Add the same variables');
console.log('3. Redeploy your project\n');

console.log('📋 Step 5: Test Your Setup');
console.log('1. Run: npm run dev');
console.log('2. Try signing up a new user');
console.log('3. Check Supabase dashboard to see the data\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('💡 Tip: Create .env.local for local development:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key\n');
} else {
  console.log('✅ .env.local file found');
  
  // Check if Supabase variables are set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase environment variables found in .env.local');
  } else {
    console.log('⚠️  Supabase environment variables not found in .env.local');
    console.log('   Add them to enable database connection\n');
  }
}

console.log('🎯 Your app will now work with:');
console.log('   ✅ Local development (database + fallback)');
console.log('   ✅ Vercel production (database only)');
console.log('   ✅ Persistent data storage');
console.log('   ✅ Real-time synchronization\n');

console.log('📖 For detailed instructions, see: VERCEL_DATABASE_SETUP.md\n');

console.log('🚀 Ready to deploy to Vercel with database support!');
