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
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({ message: 'Username, password, name, and email are required' });
    }

    // If Supabase is available, use it
    if (supabase) {
      try {
        // Check if username already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if email already exists
        const { data: existingEmail } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .single();

        if (existingEmail) {
          return res.status(400).json({ message: 'Email already exists' });
        }

        // Create new user in Supabase
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              username,
              password,
              name,
              email,
              role: 'user'
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          return res.status(500).json({ message: 'Failed to create user' });
        }

        // Return success (without password)
        const { password: _, ...userWithoutPassword } = newUser;
        return res.status(201).json({
          message: 'User created successfully',
          user: userWithoutPassword
        });

      } catch (dbError) {
        console.log('Database error, falling back to local storage:', dbError);
        // Fall through to local storage
      }
    }

    // Fallback to local JSON storage
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
