import { createClient } from '@supabase/supabase-js'

// Default fallback values if environment variables are not yet provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility helper to check if Supabase credentials are correctly set
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
}
