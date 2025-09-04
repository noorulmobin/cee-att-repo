// Simple in-memory database for Vercel deployment
// This will work on Vercel but data will reset on each deployment
// For production, use Supabase or another persistent database

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface Attendance {
  id: string;
  username: string;
  action: string;
  timestamp: string;
  activity_description: string;
  created_at: string;
}

// In-memory storage (resets on server restart)
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

let attendance: Attendance[] = [];

// User management functions
export const userDB = {
  // Get all users
  getAll: (): User[] => users,
  
  // Find user by username
  findByUsername: (username: string): User | undefined => 
    users.find(u => u.username === username),
  
  // Find user by email
  findByEmail: (email: string): User | undefined => 
    users.find(u => u.email === email),
  
  // Find user by username and password
  findByCredentials: (username: string, password: string): User | undefined => 
    users.find(u => u.username === username && u.password === password),
  
  // Create new user
  create: (userData: Omit<User, 'id' | 'created_at'>): User => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      ...userData,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
  },
  
  // Check if username exists
  usernameExists: (username: string): boolean => 
    users.some(u => u.username === username),
  
  // Check if email exists
  emailExists: (email: string): boolean => 
    users.some(u => u.email === email)
};

// Attendance management functions
export const attendanceDB = {
  // Get all attendance records
  getAll: (): Attendance[] => attendance,
  
  // Add attendance record
  add: (record: Omit<Attendance, 'id' | 'created_at'>): Attendance => {
    const newRecord: Attendance = {
      id: (attendance.length + 1).toString(),
      ...record,
      created_at: new Date().toISOString()
    };
    attendance.push(newRecord);
    return newRecord;
  },
  
  // Get attendance by username
  getByUsername: (username: string): Attendance[] => 
    attendance.filter(a => a.username === username)
};

// Export types
export type { User, Attendance };
