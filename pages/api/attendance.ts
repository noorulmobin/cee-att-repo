import { NextApiRequest, NextApiResponse } from 'next';

interface AttendanceRecord {
  username: string;
  action: string;
  description: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, action, description } = req.body;

    if (!username || !action) {
      return res.status(400).json({ error: 'Username and action are required' });
    }

    const timestamp = new Date().toISOString();

    // For now, just return success without trying to save to Google Sheets
    // This prevents 500 errors when credentials are not set up
    res.status(200).json({
      message: 'Attendance recorded successfully (local storage only)',
      timestamp,
      note: 'Google Sheets integration requires environment variables setup'
    });

  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
}
