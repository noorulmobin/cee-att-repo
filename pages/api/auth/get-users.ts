import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../src/lib/databaseService';
import { storage } from '../../../src/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try database first, fallback to storage
    let users = [];

    if (db.isConnected()) {
      // Use database
      users = await db.getAllUsers();
    } else {
      // Use storage fallback
      users = storage.getUsers();
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
