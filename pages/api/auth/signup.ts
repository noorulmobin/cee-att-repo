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

// User management functions
const userDB = {
  findByUsername: (username: string): User | undefined => 
    users.find(u => u.username === username),
  findByEmail: (email: string): User | undefined => 
    users.find(u => u.email === email),
  create: (userData: Omit<User, 'id' | 'created_at'>): User => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      ...userData,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },
  usernameExists: (username: string): boolean => 
    users.some(u => u.username === username),
  emailExists: (email: string): boolean => 
    users.some(u => u.email === email)
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'Username, password, name, and email are required' });
    }

    // Check if username already exists
    if (userDB.usernameExists(username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    if (userDB.emailExists(email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new user
    const newUser = userDB.create({
      username,
      password,
      name,
      email,
      role: 'user'
    });

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

// Export users array for login API to use
export { users };