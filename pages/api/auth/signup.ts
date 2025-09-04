import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../../src/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'Username, password, name, and email are required' });
    }

    // Get existing users
    const users = storage.getUsers();

    // Check if username already exists
    const existingUserByUsername = users.find(user => user.username === username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingUserByEmail = users.find(user => user.email === email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const newUser = {
      username,
      password,
      name,
      email,
      role: 'user'
    };

    // Add user to storage
    storage.addUser(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}