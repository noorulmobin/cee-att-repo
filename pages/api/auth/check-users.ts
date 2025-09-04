import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../src/lib/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if users exist using storage
    const hasUsers = storage.hasUsers();

    return res.status(200).json({ hasUsers });
  } catch (error) {
    console.error('Error reading users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
