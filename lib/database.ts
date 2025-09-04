// Shared in-memory database for both signup and login APIs
// This ensures data consistency between API endpoints

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

// Shared in-memory storage (resets on server restart)
export let users: User[] = [
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
export const userDB = {
  findByUsername: (username: string): User | undefined => 
    users.find(u => u.username === username),
  findByEmail: (email: string): User | undefined => 
    users.find(u => u.email === email),
  findByCredentials: (username: string, password: string): User | undefined => 
    users.find(u => u.username === username && u.password === password),
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
