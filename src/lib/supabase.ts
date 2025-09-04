import { createClient } from '@supabase/supabase-js'

// Database types
export interface User {
  id?: number
  username: string
  password: string
  name: string
  email: string
  role: string
  created_at?: string
}

export interface Attendance {
  id?: number
  user_id: number
  date: string
  check_in: string
  check_out?: string
  status: string
  created_at?: string
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

export { supabase }