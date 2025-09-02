# Google Sheets Integration Setup Guide

## 🚀 **Automatic Attendance Recording to Google Sheets**

Your attendance app now automatically saves all sign-in/sign-out records to your Google Sheet: [Daily working updates-Sep-2025](https://docs.google.com/spreadsheets/d/1xARuXj-knDcTpyRvUEiUvZKAhVXtgiuQvJltmqxKqeM/edit?gid=0#gid=0)

## 📋 **What Gets Recorded Automatically:**

| Column | Data | Example |
|--------|------|---------|
| A | Date | 1/22/2025 |
| B | Time | 2:30:45 PM |
| C | Username | john_doe |
| D | Action | sign-in / sign-out |
| E | Description | Working on project X |
| F | Uploaded File | report.pdf |
| G | Record Timestamp | 2025-01-22T14:30:45.123Z |

## 🔧 **Setup Steps:**

### **1. Create Google Cloud Project:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Enable Google Sheets API

### **2. Create Service Account:**
- Go to "IAM & Admin" > "Service Accounts"
- Click "Create Service Account"
- Give it a name (e.g., "attendance-app")
- Grant "Editor" role for Google Sheets
- Create and download the JSON key file

### **3. Share Your Google Sheet:**
- Open your [attendance sheet](https://docs.google.com/spreadsheets/d/1xARuXj-knDcTpyRvUEiUvZKAhVXtgiuQvJltmqxKqeM/edit?gid=0#gid=0)
- Click "Share" button
- Add your service account email: `your-service-account@your-project.iam.gserviceaccount.com`
- Give it "Editor" access

### **4. Configure Environment Variables:**
Create a `.env.local` file in your project root:

```env
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_SHEET_ID=1xARuXj-knDcTpyRvUEiUvZKAhVXtgiuQvJltmqxKqeM
```

### **5. Place Credentials File:**
- Rename your downloaded JSON key to `google-credentials.json`
- Place it in your project root directory
- **IMPORTANT**: Add `google-credentials.json` to `.gitignore`

## 🎯 **How It Works:**

1. **User Signs In/Out** → Dashboard records the action
2. **API Call** → Sends data to `/api/attendance`
3. **Google Sheets** → Automatically appends new row
4. **Local Storage** → Backup copy saved locally
5. **Real-time** → Records appear instantly in your sheet

## 📱 **Features:**

- ✅ **Automatic Recording**: Every action saved to Google Sheets
- ✅ **Real-time Updates**: See records immediately
- ✅ **File Attachments**: Document names saved with records
- ✅ **Backup System**: Local storage as fallback
- ✅ **Error Handling**: Continues working even if sheets fail
- ✅ **Mobile Friendly**: Works on all devices

## 🔒 **Security:**

- Service account has limited access (only to your sheet)
- Credentials stored securely
- No user data exposed
- Private key never sent to client

## 🚨 **Troubleshooting:**

### **If records aren't saving:**
1. Check service account permissions
2. Verify sheet sharing settings
3. Check console for error messages
4. Ensure credentials file is in correct location

### **If you get authentication errors:**
1. Verify Google Sheets API is enabled
2. Check service account roles
3. Ensure sheet is shared with service account email

## 📊 **View Your Data:**

Your attendance records will automatically appear in the Google Sheet with:
- **Date & Time** of each action
- **Username** who performed the action
- **Action Type** (sign-in/sign-out)
- **Work Description** (if provided)
- **File Attachments** (if uploaded)
- **Exact Timestamp** for tracking

## 🎉 **Ready to Use!**

Once configured, every time a user signs in or out, their record will automatically appear in your Google Sheet in real-time!

---

**Need Help?** Check the console logs for detailed error messages during setup.
