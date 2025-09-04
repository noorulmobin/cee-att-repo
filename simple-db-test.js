#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Tests if your Supabase database is properly connected
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://dpsxlwftwytjylokbars.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3hsd2Z0d3l0anlsb2tiYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDMwMTYsImV4cCI6MjA3MjUxOTAxNn0.9i1QncjAhpj-m14DjkYWJDu_HA-ZGCUD8jkefxmaVfE';

console.log('🔍 Testing Supabase Database Connection');
console.log('=====================================\n');

console.log('✅ Using your Supabase credentials');
console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:');
      console.log(`   Error: ${error.message}\n`);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 Solution: You need to create the database tables first!');
        console.log('1. Go to your Supabase dashboard: https://dpsxlwftwytjylokbars.supabase.co');
        console.log('2. Click "SQL Editor"');
        console.log('3. Copy the contents of setup-supabase-tables.sql');
        console.log('4. Paste and click "Run"\n');
      }
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ Tables exist and are accessible\n');
    
    // Test 2: Check if default users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('username, role')
      .limit(5);
    
    if (usersError) {
      console.log('⚠️  Could not fetch users:', usersError.message);
    } else {
      console.log('👥 Current users in database:');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
      console.log('');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('🎉 Database is ready! Your app should work with Supabase now.');
    console.log('🚀 You can now:');
    console.log('   1. Test signup/login locally');
    console.log('   2. Deploy to Vercel with database support');
    console.log('   3. All data will be saved to Supabase\n');
  } else {
    console.log('🔧 Please follow the steps above to set up your database tables.\n');
  }
});
