/**
 * Supabase client utility for server-side and client-side database operations.
 * Provides methods for connecting to Supabase and handling authentication.
 */
import { createClient } from "@supabase/supabase-js"

// Environment variables should be set in your Vercel project
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with the service role key for server-side operations
// This has admin privileges and should only be used on the server
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// For client-side operations, we'll use the anon key
// This is safe to use in browser code
export const createSupabaseClient = () => {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(supabaseUrl, supabaseAnonKey)
}

