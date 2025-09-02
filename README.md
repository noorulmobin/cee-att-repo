# Attendance App

A simple Next.js attendance management system with Google Sheets integration.

## Features

- User authentication (login/signup)
- Sign in/out functionality
- Activity description for sign-out
- Google Sheets integration for data storage
- Responsive design with TailwindCSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory with your Google Sheets credentials:
```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Users

The app comes with these pre-configured users:
- Username: `admin`, Password: `1234`
- Username: `mobin`, Password: `abcd`
- Username: `john`, Password: `password123`

## Google Sheets Setup

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a service account
4. Download the service account JSON file
5. Share your Google Sheet with the service account email
6. Add the credentials to your `.env.local` file

## Project Structure

- `src/app/` - Next.js app router pages
- `src/lib/` - Utility functions and Google Sheets integration
- `src/data/` - User data storage
- `src/app/api/` - API routes for authentication and attendance
