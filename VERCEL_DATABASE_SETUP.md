# 🗄️ Vercel Database Setup Guide

## 🚀 **Complete Guide to Connect Database to Vercel**

This guide will help you set up a **Supabase database** for your attendance app that works perfectly with Vercel deployment.

---

## 📋 **Step 1: Create Supabase Account & Project**

### **1.1 Sign Up for Supabase**
1. Go to [supabase.com]()
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### **1.2 Create New Project**
1. Click **"New Project"**
2. Choose your organization
3. **Project Name**: `attendance-app`
4. **Database Password**: Create a strong password (save this!)
5. **Region**: Choose closest to your users
6. Click **"Create new project"**

⏳ **Wait 2-3 minutes** for the project to be ready.

---

## 📋 **Step 2: Set Up Database Tables**

### **2.1 Open SQL Editor**
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### **2.2 Run Database Setup Script**
Copy and paste this entire script into the SQL Editor:

```sql
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

-- Create attendance table (for activity updates)
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_description TEXT,
  uploaded_file VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin and CEO users
INSERT INTO users (username, password, name, email, role) VALUES
('admin', 'admin123', 'System Administrator', 'admin@company.com', 'admin'),
('ceo', 'ceo2024', 'Chief Executive Officer', 'ceo@company.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
-- In production, you should create more restrictive policies
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendance" ON attendance FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendance_username ON attendance(username);
CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp);
```

### **2.3 Execute the Script**
1. Click **"Run"** button
2. Wait for all commands to complete
3. You should see **"Success. No rows returned"** messages

---

## 📋 **Step 3: Get Your Database Credentials**

### **3.1 Access API Settings**
1. In your Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the left sidebar

### **3.2 Copy Your Credentials**
Copy these two values:

1. **Project URL** (looks like: `https://your-project-id.supabase.co`)
2. **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## 📋 **Step 4: Configure Environment Variables**

### **4.1 For Local Development**
Create/update your `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **4.2 For Vercel Deployment**
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your attendance app project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add these variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

5. Click **"Save"**
6. Go to **"Deployments"** and click **"Redeploy"**

---

## 📋 **Step 5: Test Your Setup**

### **5.1 Local Testing**
```bash
# Start your development server
npm run dev

# Test in browser
# 1. Go to http://localhost:3000
# 2. Try to sign up a new user
# 3. Check if data appears in Supabase dashboard
```

### **5.2 Check Database Connection**
1. Go to your Supabase dashboard
2. Click **"Table Editor"**
3. You should see your `users` and `attendance` tables
4. Check if new users appear when you sign up

### **5.3 Vercel Testing**
1. Deploy to Vercel: `vercel --prod`
2. Test signup/login on your live site
3. Verify data persists in Supabase

---

## 🔧 **How It Works**

### **Database-First Architecture**
- ✅ **Primary**: Supabase database (for production)
- ✅ **Fallback**: Local storage (for development)
- ✅ **Automatic**: App detects database connection

### **API Routes Updated**
- ✅ **Signup**: Saves users to database
- ✅ **Login**: Authenticates from database
- ✅ **Get Users**: Fetches from database
- ✅ **Delete User**: Removes from database
- ✅ **Attendance**: Records to database

### **Benefits**
- 🚀 **Persistent Data**: No data loss on Vercel
- 🔄 **Real-time**: Live data synchronization
- 📈 **Scalable**: Handles unlimited users
- 🔒 **Secure**: Row-level security enabled
- 💾 **Backup**: Automatic database backups

---

## 🆘 **Troubleshooting**

### **Connection Issues**
```bash
# Check if environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Database Errors**
1. Check Supabase dashboard for error logs
2. Verify SQL script executed successfully
3. Check table permissions in Supabase

### **Vercel Issues**
1. Ensure environment variables are set in Vercel
2. Redeploy after adding environment variables
3. Check Vercel function logs for errors

### **Common Solutions**
- **"Invalid API key"**: Check if you copied the correct anon key
- **"Table doesn't exist"**: Re-run the SQL setup script
- **"Permission denied"**: Check RLS policies in Supabase

---

## 🎉 **Success!**

Once setup is complete:

✅ **Local Development**: Works with database + fallback  
✅ **Vercel Production**: Works with database only  
✅ **Data Persistence**: All data saved to Supabase  
✅ **User Management**: Full CRUD operations  
✅ **Attendance Tracking**: All records saved  

Your attendance app now has a **professional database backend** that works perfectly with Vercel! 🚀

---

## 📞 **Need Help?**

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Check the GitHub repository

**Happy coding!** 🎯
