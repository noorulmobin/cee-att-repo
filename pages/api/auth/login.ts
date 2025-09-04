import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory database for Vercel compatibility
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

// Global in-memory storage (shared across all API calls)
let users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    name: 'System Administrator',
    password: 'admin123',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'ceo',
    email: 'ceo@company.com',
    name: 'Chief Executive Officer',
    password: 'ceo2024',
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user in the users array
    const user = users.find((u: any) => u.username === username && u.password === password);

    if (user) {
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