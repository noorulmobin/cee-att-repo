# 🚀 Vercel Deployment Guide

This guide will help you deploy your attendance app to Vercel with proper database support.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Account**: For code repository

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `attendance-app`
5. Enter database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

### 1.2 Set Up Database Tables
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the contents of `supabase-setup.sql`
5. Click "Run" to execute the script

### 1.3 Get Your Credentials
1. Go to "Settings" → "API" in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push to GitHub
```bash
git add .
git commit -m "Add Supabase integration for Vercel deployment"
git push origin main
```

### 2.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"

### 2.3 Add Environment Variables
1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |

3. Click "Save"
4. Go to "Deployments" and click "Redeploy" on your latest deployment

## ✅ Step 3: Test Your Deployment

### 3.1 Test User Creation
1. Visit your Vercel app URL
2. Go to `/signup`
3. Create a new user account
4. Verify the user appears in your Supabase dashboard

### 3.2 Test Login
1. Go to `/login`
2. Login with your new account
3. Verify you can access the dashboard

### 3.3 Test Default Accounts
Try logging in with:
- **Admin**: `admin` / `admin123`
- **CEO**: `ceo` / `ceo2024`

## 🔧 How It Works

### Local Development
- **Without Supabase**: Uses local JSON file (`src/data/users.json`)
- **With Supabase**: Uses Supabase database (if environment variables are set)

### Vercel Production
- **Always uses Supabase**: Environment variables are required
- **Persistent data**: All user data is stored in Supabase
- **Scalable**: Handles unlimited users

## 🛠️ Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure you've pushed all files to GitHub and redeployed

### Issue: Users can't login after signup
**Solution**: Check that Supabase environment variables are set correctly

### Issue: Database connection errors
**Solution**: Verify your Supabase URL and API key are correct

### Issue: Local development not working
**Solution**: The app will automatically fall back to local JSON if Supabase is not configured

## 📊 Monitoring

### Supabase Dashboard
- Monitor user registrations
- View database performance
- Check API usage

### Vercel Dashboard
- Monitor deployment status
- View function logs
- Check performance metrics

## 🔒 Security Notes

- **Passwords**: Currently stored in plain text (for demo purposes)
- **Production**: Consider implementing password hashing
- **RLS**: Row Level Security is enabled but set to permissive for demo
- **API Keys**: Never commit environment variables to Git

## 🎉 Success!

Your attendance app is now deployed and working on both:
- ✅ **Local development** (with local JSON fallback)
- ✅ **Vercel production** (with Supabase database)

Users can now:
- ✅ Create unlimited accounts
- ✅ Login immediately after signup
- ✅ Access the dashboard
- ✅ Have their data persist across sessions
