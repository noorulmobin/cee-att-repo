-- 🗄️ Database Setup for Attendance App
-- Run these commands in your Supabase SQL Editor

-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert new accounts" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Create policies for attendance table
CREATE POLICY "Anyone can view attendance" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert attendance" ON attendance
  FOR INSERT WITH CHECK (true);

-- Insert default admin users
INSERT INTO users (username, email, name, password, role) VALUES
  ('admin', 'admin@company.com', 'System Administrator', 'admin123', 'admin'),
  ('ceo', 'ceo@company.com', 'Chief Executive Officer', 'ceo2024', 'admin')
ON CONFLICT (username) DO NOTHING;
