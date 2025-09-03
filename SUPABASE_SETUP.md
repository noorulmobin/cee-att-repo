# 🗄️ Supabase Database Setup Guide

## 🚀 **Quick Setup for Vercel Deployment**

### **Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub/Google
3. Create a new project

### **Step 2: Get Your Credentials**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Add them to your `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### **Step 3: Create Database Tables**

Run these SQL commands in your Supabase SQL Editor:

#### **Users Table**
```sql
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
```

#### **Attendance Table**
```sql
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view attendance" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert attendance" ON attendance
  FOR INSERT WITH CHECK (true);
```

### **Step 4: Install Dependencies**
```bash
npm install @supabase/supabase-js
```

### **Step 5: Migrate Existing Data**
After setting up Supabase, call this endpoint to migrate your local data:
```bash
curl -X POST http://localhost:3000/api/migrate-data
```

## 🌐 **Vercel Deployment**

### **Environment Variables in Vercel**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Deploy**
```bash
vercel --prod
```

## 🔒 **Security Features**

- **Row Level Security (RLS)** enabled on all tables
- **Password hashing** (implement bcrypt in production)
- **JWT authentication** support
- **Real-time subscriptions** available

## 📊 **Database Benefits**

✅ **Unlimited users** - No local file size limits  
✅ **Real-time updates** - Live data synchronization  
✅ **Automatic backups** - Data safety guaranteed  
✅ **Scalable** - Handles millions of users  
✅ **Vercel optimized** - Perfect for serverless deployment  

## 🧪 **Testing**

1. **Local Development**: `npm run dev`
2. **Test Signup**: Create new user accounts
3. **Test Login**: Authenticate existing users
4. **Check Database**: View data in Supabase dashboard

## 🆘 **Troubleshooting**

- **Connection Issues**: Check environment variables
- **Table Errors**: Verify SQL commands were executed
- **Migration Issues**: Check console logs for errors
- **Vercel Issues**: Ensure environment variables are set

## 📞 **Support**

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Project Issues: Check GitHub repository
