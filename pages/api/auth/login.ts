import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../src/lib/storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user using storage
    const user = storage.findUserByUsername(username);

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