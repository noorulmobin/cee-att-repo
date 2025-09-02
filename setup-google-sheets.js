#!/usr/bin/env node

/**
 * Google Sheets Setup Helper Script
 * Run this to help set up your Google Sheets integration
 */

console.log('🚀 Google Sheets Integration Setup Helper');
console.log('==========================================\n');

console.log('📋 Your Google Sheet:');
console.log('https://docs.google.com/spreadsheets/d/1xARuXj-knDcTpyRvUEiUvZKAhVXtgiuQvJltmqxKqeM/edit?gid=0#gid=0\n');

console.log('🔧 Setup Steps:');
console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Enable Google Sheets API');
console.log('4. Go to "IAM & Admin" > "Service Accounts"');
console.log('5. Click "Create Service Account"');
console.log('6. Name it "attendance-app"');
console.log('7. Grant "Editor" role for Google Sheets');
console.log('8. Create and download the JSON key file\n');

console.log('📁 File Setup:');
console.log('1. Rename downloaded JSON to: google-credentials.json');
console.log('2. Place it in your project root directory');
console.log('3. Share your Google Sheet with the service account email\n');

console.log('🌐 Environment Setup:');
console.log('Create a .env.local file with:');
console.log('GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json');
console.log('GOOGLE_SHEET_ID=1xARuXj-knDcTpyRvUEiUvZKAhVXtgiuQvJltmqxKqeM\n');

console.log('✅ Once configured:');
console.log('- Every sign-in/sign-out will auto-save to Google Sheets');
console.log('- Records include: Date, Time, Username, Action, Description, File');
console.log('- Real-time updates in your sheet');
console.log('- Local storage backup if sheets fail\n');

console.log('📖 Full setup guide: GOOGLE_SHEETS_SETUP.md');
console.log('🚨 IMPORTANT: Never commit google-credentials.json to git!\n');

console.log('🎯 Ready to test? Run: npm run dev');
console.log('Then sign in/out and check your Google Sheet!');
