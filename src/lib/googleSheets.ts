import { google } from 'googleapis';

// Get credentials from environment variables
const getCredentials = () => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google Sheets credentials in environment variables');
  }

  return { sheetId, serviceAccountEmail, privateKey };
};

// Initialize Google Sheets client
const initializeGoogleSheets = () => {
  const { serviceAccountEmail, privateKey } = getCredentials();

  const auth = new google.auth.JWT(
    serviceAccountEmail,
    undefined,
    privateKey.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  return google.sheets({ version: 'v4', auth });
};

// Append a row to Google Sheets
export async function appendRow(username: string, action: string, description: string, timestamp: string): Promise<void> {
  try {
    const { sheetId } = getCredentials();
    const sheets = initializeGoogleSheets();

    const values = [
      [username, action, timestamp, description]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    console.log('Row appended successfully to Google Sheets');
  } catch (error) {
    console.error('Error appending row to Google Sheets:', error);
    throw error;
  }
}

// Initialize the sheet with headers if it doesn't exist
export async function initializeSheet(): Promise<void> {
  try {
    const { sheetId } = getCredentials();
    const sheets = initializeGoogleSheets();

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:D1',
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      const headers = [['Username', 'Action', 'Timestamp', 'Activity Description']];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Sheet1!A1:D1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: headers,
        },
      });

      console.log('Sheet initialized with headers');
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    throw error;
  }
}
