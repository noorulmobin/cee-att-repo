import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table types
export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  username: string
  action: string
  timestamp: string
  activity_description: string
  created_at: string
}
