import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Supabase URL ve Key - Production'da environment variables'dan alınacak
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vbiwtjjbjrgafdllgglb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaXd0ampianJnYWZkbGxnZ2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjIxMTAsImV4cCI6MjA2NTMzODExMH0.x1ObLFxj_hn3FrbEK7NQoHL3W6Srq_Edom9gIRWzJGg'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Admin client (server-side operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}) 