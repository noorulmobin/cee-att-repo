import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read users from JSON file
    const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    // Return all users (excluding passwords)
    const usersWithoutPasswords = users.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error reading users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
