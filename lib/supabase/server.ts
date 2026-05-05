import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server-Side Supabase Client (für Server Components & API Routes)
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Wird in Server Components geworfen – kann ignoriert werden
            // wenn Middleware die Session aktualisiert
          }
        },
      },
    }
  )
}

// Admin-Client mit Service-Role-Key (umgeht RLS – nur server-side verwenden!)
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}
