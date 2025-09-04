import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../src/lib/databaseService';
import { storage } from '../../../src/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Prevent deletion of admin and ceo users
    if (username === 'admin' || username === 'ceo') {
      return res.status(403).json({ message: 'Cannot delete admin or CEO users for security reasons' });
    }

    // Try database first, fallback to storage
    let success = false;

    if (db.isConnected()) {
      // Use database
      success = await db.deleteUser(username);
    } else {
      // Use storage fallback
      const users = storage.getUsers();
      const userIndex = users.findIndex((user: any) => user.username === username);
      
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove user from array
      users.splice(userIndex, 1);
      storage.saveUsers(users);
      success = true;
    }

    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success response
    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedUser: username
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
