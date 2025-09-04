#!/usr/bin/env node

/**
 * Test Supabase Connection
 * This script tests if your Supabase configuration is working
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase environment variables not found!');
    console.log('Please create a .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key\n');
    return;
  }

  if (supabaseUrl.includes('your-project') || supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
    console.log('❌ Please replace the placeholder values with your actual Supabase credentials!\n');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...\n`);

    // Test database connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:');
      console.log(`   Error: ${error.message}\n`);
      console.log('💡 Make sure you have:');
      console.log('   1. Created the users table in Supabase');
      console.log('   2. Run the SQL script from supabase-setup.sql');
      console.log('   3. Enabled Row Level Security policies\n');
      return;
    }

    console.log('✅ Database connection successful!');
    console.log('✅ Your Supabase setup is working correctly!\n');
    console.log('🚀 You can now deploy to Vercel with confidence!\n');

  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}\n`);
  }
}

testSupabase();
