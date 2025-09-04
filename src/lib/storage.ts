// Universal storage solution for both local and Vercel
import fs from 'fs';
import path from 'path';

export interface User {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

// In-memory storage for Vercel (serverless)
let memoryUsers: User[] = [];

// Initialize with default users for Vercel
const defaultUsers: User[] = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'System Administrator',
    email: 'admin@company.com',
    role: 'admin'
  },
  {
    username: 'ceo',
    password: 'ceo2024',
    name: 'Chief Executive Officer',
    email: 'ceo@company.com',
    role: 'admin'
  }
];

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

export const storage = {
  // Get all users
  getUsers(): User[] {
    if (isVercel) {
      // Use in-memory storage on Vercel
      return memoryUsers.length > 0 ? memoryUsers : defaultUsers;
    } else {
      // Use local JSON file storage
      try {
        const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
        if (fs.existsSync(usersPath)) {
          const usersData = fs.readFileSync(usersPath, 'utf8');
          return JSON.parse(usersData);
        }
        return defaultUsers;
      } catch (error) {
        console.error('Error reading users:', error);
        return defaultUsers;
      }
    }
  },

  // Save users
  saveUsers(users: User[]): void {
    if (isVercel) {
      // Store in memory on Vercel
      memoryUsers = users;
    } else {
      // Save to local JSON file
      try {
        const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
        const dir = path.dirname(usersPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      } catch (error) {
        console.error('Error saving users:', error);
      }
    }
  },

  // Add a new user
  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },

  // Find user by username
  findUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.username === username);
  },

  // Find user by email
  findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.email === email);
  },

  // Check if users exist
  hasUsers(): boolean {
    const users = this.getUsers();
    return users.length > 0;
  },

  // Get users without passwords
  getUsersWithoutPasswords(): Omit<User, 'password'>[] {
    const users = this.getUsers();
    return users.map(({ password, ...user }) => user);
  }
};
