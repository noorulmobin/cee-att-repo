import fs from 'fs'
import path from 'path'
import { supabase, User, Attendance } from './supabase'

// Database service that works with both Supabase and local JSON
export class DatabaseService {
  private static instance: DatabaseService
  private usersPath: string

  constructor() {
    this.usersPath = path.join(process.cwd(), 'src', 'data', 'users.json')
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Check if Supabase is available
  private isSupabaseAvailable(): boolean {
    return supabase !== null
  }

  // User operations
  async getUsers(): Promise<User[]> {
    if (this.isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Supabase error, falling back to local JSON:', error)
        return this.getLocalUsers()
      }
    }
    return this.getLocalUsers()
  }

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    if (this.isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select()
          .single()
        
        if (error) throw error
        return data
      } catch (error) {
        console.error('Supabase error, falling back to local JSON:', error)
        return this.createLocalUser(user)
      }
    }
    return this.createLocalUser(user)
  }

  async findUserByUsername(username: string): Promise<User | null> {
    if (this.isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        return data
      } catch (error) {
        console.error('Supabase error, falling back to local JSON:', error)
        return this.findLocalUserByUsername(username)
      }
    }
    return this.findLocalUserByUsername(username)
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()
        
        if (error && error.code !== 'PGRST116') throw error
        return data
      } catch (error) {
        console.error('Supabase error, falling back to local JSON:', error)
        return this.findLocalUserByEmail(email)
      }
    }
    return this.findLocalUserByEmail(email)
  }

  async deleteUser(id: number): Promise<boolean> {
    if (this.isSupabaseAvailable()) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        return true
      } catch (error) {
        console.error('Supabase error, falling back to local JSON:', error)
        return this.deleteLocalUser(id)
      }
    }
    return this.deleteLocalUser(id)
  }

  // Local JSON operations (fallback)
  private getLocalUsers(): User[] {
    try {
      if (fs.existsSync(this.usersPath)) {
        const usersData = fs.readFileSync(this.usersPath, 'utf8')
        return JSON.parse(usersData)
      }
      return []
    } catch (error) {
      console.error('Error reading local users:', error)
      return []
    }
  }

  private createLocalUser(user: Omit<User, 'id' | 'created_at'>): User {
    try {
      const users = this.getLocalUsers()
      const newUser: User = {
        ...user,
        id: users.length + 1,
        created_at: new Date().toISOString()
      }
      
      users.push(newUser)
      fs.writeFileSync(this.usersPath, JSON.stringify(users, null, 2))
      return newUser
    } catch (error) {
      console.error('Error creating local user:', error)
      throw error
    }
  }

  private findLocalUserByUsername(username: string): User | null {
    const users = this.getLocalUsers()
    const user = users.find(user => user.username === username)
    if (user) {
      // Ensure user has required fields for new format
      return {
        id: user.id || users.indexOf(user) + 1,
        username: user.username,
        password: user.password,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at || new Date().toISOString()
      }
    }
    return null
  }

  private findLocalUserByEmail(email: string): User | null {
    const users = this.getLocalUsers()
    const user = users.find(user => user.email === email)
    if (user) {
      // Ensure user has required fields for new format
      return {
        id: user.id || users.indexOf(user) + 1,
        username: user.username,
        password: user.password,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at || new Date().toISOString()
      }
    }
    return null
  }

  private deleteLocalUser(id: number): boolean {
    try {
      const users = this.getLocalUsers()
      const filteredUsers = users.filter(user => user.id !== id)
      fs.writeFileSync(this.usersPath, JSON.stringify(filteredUsers, null, 2))
      return true
    } catch (error) {
      console.error('Error deleting local user:', error)
      return false
    }
  }

  // Check if users exist
  async hasUsers(): Promise<boolean> {
    const users = await this.getUsers()
    return users.length > 0
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance()