import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'Username, password, name, and email are required' });
    }

    // Read existing users
    const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
    let users = [];
    
    if (fs.existsSync(usersPath)) {
      const usersData = fs.readFileSync(usersPath, 'utf8');
      users = JSON.parse(usersData);
    }

    // Check if username already exists
    if (users.find((u: any) => u.username === username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user (default role is 'user')
    const newUser = {
      username,
      password,
      name,
      email,
      role: 'user' // Default role for new signups
    };

    // Add to users array
    users.push(newUser);

    // Write back to file
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    // Return success (without password)
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