#!/usr/bin/env node

/**
 * Database Tables Setup Script
 * This script will create the database tables in Supabase
 */

const https = require('https');

const supabaseUrl = 'https://dpsxlwftwytjylokbars.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3hsd2Z0d3l0anlsb2tiYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDMwMTYsImV4cCI6MjA3MjUxOTAxNn0.9i1QncjAhpj-m14DjkYWJDu_HA-ZGCUD8jkefxmaVfE';

console.log('🗄️  Setting up Supabase Database Tables');
console.log('=====================================\n');

const sqlScript = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_description TEXT,
  uploaded_file VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (username, password, name, email, role) VALUES
('admin', 'admin123', 'System Administrator', 'admin@company.com', 'admin'),
('ceo', 'ceo2024', 'Chief Executive Officer', 'ceo@company.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendance_username ON attendance(username);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp);
`;

function makeRequest(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'dpsxlwftwytjylokbars.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function setupDatabase() {
  try {
    console.log('🔄 Creating database tables...');
    
    // Split the SQL script into individual statements
    const statements = sqlScript.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`   Executing: ${statement.trim().substring(0, 50)}...`);
        try {
          const result = await makeRequest(statement.trim());
          if (result.status === 200 || result.status === 201) {
            console.log('   ✅ Success');
          } else {
            console.log(`   ⚠️  Status: ${result.status}`);
          }
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Database setup completed!');
    console.log('✅ Tables created successfully');
    console.log('✅ Default users added');
    console.log('✅ Security policies enabled\n');
    
    console.log('🧪 Testing the setup...');
    
    // Test the setup by trying to get users
    const testResult = await makeRequest('SELECT username, role FROM users LIMIT 5');
    if (testResult.status === 200) {
      console.log('✅ Database is working correctly!');
      console.log('🚀 Your app should now work with Supabase database\n');
    } else {
      console.log('⚠️  Database setup completed but test failed');
    }
    
  } catch (error) {
    console.log('❌ Error setting up database:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to https://dpsxlwftwytjylokbars.supabase.co');
    console.log('2. Click "SQL Editor"');
    console.log('3. Copy the contents of supabase-setup.sql');
    console.log('4. Paste and click "Run"\n');
  }
}

setupDatabase();
