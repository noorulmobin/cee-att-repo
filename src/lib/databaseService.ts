import { supabase } from './supabase';

export interface User {
  id?: number;
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface ActivityUpdate {
  id?: number;
  username: string;
  action: string;
  timestamp: string;
  description?: string;
  uploadedFile?: string;
}

class DatabaseService {
  // User operations
  async findUserByUsername(username: string): Promise<User | null> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error finding user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User | null> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async deleteUser(username: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return false;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('username', username);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database error:', error);
      return false;
    }
  }

  async hasUsers(): Promise<boolean> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return false;
      }

      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error checking users:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Database error:', error);
      return false;
    }
  }

  // Activity/Attendance operations
  async createActivity(activityData: Omit<ActivityUpdate, 'id'>): Promise<ActivityUpdate | null> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return null;
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          username: activityData.username,
          action: activityData.action,
          timestamp: activityData.timestamp,
          activity_description: activityData.description,
          uploaded_file: activityData.uploadedFile
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        action: data.action,
        timestamp: data.timestamp,
        description: data.activity_description,
        uploadedFile: data.uploaded_file
      };
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  async getActivities(): Promise<ActivityUpdate[]> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, using fallback');
        return [];
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting activities:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        username: item.username,
        action: item.action,
        timestamp: item.timestamp,
        description: item.activity_description,
        uploadedFile: item.uploaded_file
      }));
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  // Check if database is connected
  isConnected(): boolean {
    // Temporarily disable database connection to use local storage
    return false;
  }
}

export const db = new DatabaseService();
