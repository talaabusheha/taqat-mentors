import { createClient } from '@supabase/supabase-js'

// Live production Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zefihipvpmceruugxwpk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_UMLHXvYwL--sP5EqP6WdOQ_43bNogYo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility helper to check if Supabase credentials are set
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://placeholder-project.supabase.co' &&
    supabaseAnonKey
  )
}
