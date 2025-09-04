import { NextApiRequest, NextApiResponse } from 'next';
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

    // Get current users from storage
    const users = storage.getUsers();

    // Find user to delete
    const userIndex = users.findIndex((user: any) => user.username === username);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove user from array
    users.splice(userIndex, 1);

    // Save updated users back to storage
    storage.saveUsers(users);

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
