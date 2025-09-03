import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Try to import Supabase, fallback to local storage if not available
let supabase: any = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.log('Supabase not configured, using local storage');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // If Supabase is available, use it
    if (supabase) {
      try {
        // Find user in Supabase
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

        if (error || !user) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
          message: 'Login successful',
          user: userWithoutPassword
        });

      } catch (dbError) {
        console.log('Database error, falling back to local storage:', dbError);
        // Fall through to local storage
      }
    }

    // Fallback to local JSON storage
    const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    // Find user
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
