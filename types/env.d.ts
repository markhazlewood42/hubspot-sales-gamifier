declare namespace NodeJS {
  interface ProcessEnv {
    HUBSPOT_CLIENT_ID: string
    HUBSPOT_CLIENT_SECRET: string
    SUPABASE_URL: string
    SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
  }
}

