import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../src/lib/databaseService';
import { storage } from '../../../src/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Try database first, fallback to storage
    let user = null;

    if (db.isConnected()) {
      // Use database
      user = await db.findUserByUsername(username);
    } else {
      // Use storage fallback
      const users = storage.getUsers();
      user = users.find(u => u.username === username);
    }

    if (user && user.password === password) {
      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword
      });
    } else {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}