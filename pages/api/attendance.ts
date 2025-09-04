import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../src/lib/databaseService';
import { google } from 'googleapis';

// Google Sheets API configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '1xARuXj-knDcTpyRvUEiUvZKAhVXtgiuQvJltmqxKqeM';

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  try {
    // For development, you can use API key or service account
    // This is a simplified version - you'll need to set up proper authentication
    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
      // Add your service account credentials here
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json',
    });
    
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, username, description, timestamp, uploadedFile } = req.body;

    if (!action || !username || !timestamp) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Prepare data for Google Sheets
    const rowData = [
      new Date(timestamp).toLocaleDateString(), // Date
      new Date(timestamp).toLocaleTimeString(), // Time
      username,                                 // Username
      action,                                   // Action (sign-in/sign-out)
      description || '',                        // Description
      uploadedFile || '',                       // Uploaded file name
      new Date().toISOString()                 // Record timestamp
    ];

    // Try to save to Google Sheets
    const sheets = getGoogleSheetsClient();
    if (sheets) {
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SHEET_ID,
          range: 'Sheet1!A:G', // Adjust range based on your sheet structure
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData]
          }
        });
        
        console.log('Record saved to Google Sheets successfully');
      } catch (sheetsError) {
        console.error('Google Sheets error:', sheetsError);
        // Continue with local storage even if Google Sheets fails
      }
    }

    // Save to database
    const activityData = {
      username,
      action,
      timestamp,
      description: description || '',
      uploadedFile: uploadedFile || ''
    };

    let savedRecord = null;
    if (db.isConnected()) {
      // Use database
      savedRecord = await db.createActivity(activityData);
    }

    // Return success response
    res.status(200).json({ 
      message: 'Attendance recorded successfully',
      record: savedRecord || {
        id: Date.now().toString(),
        ...activityData
      },
      sheetsSaved: !!sheets,
      databaseSaved: !!savedRecord
    });

  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Failed to record attendance' });
  }
}
