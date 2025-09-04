import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../src/lib/databaseService';
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

    // Try database first, fallback to storage
    let existingUserByUsername = null;
    let existingUserByEmail = null;

    if (db.isConnected()) {
      // Use database
      existingUserByUsername = await db.findUserByUsername(username);
      const allUsers = await db.getAllUsers();
      existingUserByEmail = allUsers.find(user => user.email === email);
    } else {
      // Use storage fallback
      const users = storage.getUsers();
      existingUserByUsername = users.find(user => user.username === username);
      existingUserByEmail = users.find(user => user.email === email);
    }

    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const newUserData = {
      username,
      password,
      name,
      email,
      role: 'user'
    };

    let newUser = null;

    if (db.isConnected()) {
      // Use database
      newUser = await db.createUser(newUserData);
    } else {
      // Use storage fallback
      storage.addUser(newUserData);
      newUser = newUserData;
    }

    if (!newUser) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

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