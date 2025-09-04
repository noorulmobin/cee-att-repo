# 🚀 Deployment Guide - Local & Vercel

## ✅ **Universal Solution Implemented**

Your attendance app now works on **both local development AND Vercel deployment**!

### 🔧 **How It Works**

The app automatically detects the environment:
- **Local Development**: Uses JSON file storage (`src/data/users.json`)
- **Vercel Production**: Uses in-memory storage with default users

### 📁 **Files Modified**

1. **`src/lib/storage.ts`** - Universal storage solution
2. **`pages/api/auth/signup.ts`** - Updated to use universal storage
3. **`pages/api/auth/login.ts`** - Updated to use universal storage  
4. **`pages/api/auth/check-users.ts`** - Updated to use universal storage
5. **`vercel.json`** - Vercel configuration

---

## 🏠 **Local Development**

### **Start Development Server:**
```bash
npm run dev
```

### **Access Your App:**
- **URL**: http://localhost:3000
- **Features**: Full functionality with persistent JSON file storage

### **Test Accounts:**
- **Admin**: `admin` / `admin123`
- **CEO**: `ceo` / `ceo2024`
- **Create New**: Unlimited user signup

---

## 🌐 **Vercel Deployment**

### **Method 1: Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

### **Method 2: GitHub Integration**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

---

## ✅ **What Works on Both Platforms**

### **Local Development:**
- ✅ **Persistent Storage**: Users saved in `src/data/users.json`
- ✅ **Unlimited Signup**: Create as many users as needed
- ✅ **Immediate Login**: New users can login right after signup
- ✅ **Admin/CEO Access**: Default accounts work perfectly

### **Vercel Production:**
- ✅ **In-Memory Storage**: Users stored in memory (resets on restart)
- ✅ **Default Users**: Admin and CEO accounts always available
- ✅ **New User Signup**: Works during session
- ✅ **Session-Based**: Users persist during active sessions

---

## 🔑 **Default Accounts (Always Available)**

Both local and Vercel deployments include these accounts:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Admin | `admin` | `admin123` | admin@company.com |
| CEO | `ceo` | `ceo2024` | ceo@company.com |

---

## 🎯 **Testing Your Deployment**

### **Local Testing:**
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","name":"Test User","email":"test@example.com"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### **Vercel Testing:**
Replace `localhost:3000` with your Vercel URL in the above commands.

---

## 🚨 **Important Notes**

### **Vercel Limitations:**
- **In-Memory Storage**: Users reset when serverless functions restart
- **Session-Based**: New users persist only during active sessions
- **No File System**: Cannot write to files on Vercel

### **For Production Use:**
If you need persistent user data on Vercel, consider:
1. **Supabase** (PostgreSQL database)
2. **MongoDB Atlas** (NoSQL database)
3. **PlanetScale** (MySQL database)

---

## 🎉 **Success!**

Your app now works perfectly on:
- ✅ **Local Development** (with persistent storage)
- ✅ **Vercel Production** (with session-based storage)
- ✅ **Unlimited user signup**
- ✅ **Immediate login after signup**
- ✅ **Admin/CEO access**
- ✅ **Beautiful UI**

**Deploy to Vercel now: `vercel --prod`** 🚀
