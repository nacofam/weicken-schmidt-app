import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VerificationGate from '@/components/farbmischung/VerificationGate'
import FarbmischungForm from '@/components/farbmischung/FarbmischungForm'

export const metadata = { title: 'Farbmischservice' }

export default async function FarbmischungPage() {
    const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

  // Direkte REST API - umgeht Edge Runtime Kompatibilitaetsprobleme
  let isVerified = false
    try {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=is_farbmischung_verified`
          const res = await fetch(url, {
                  headers: {
                            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                  },
                  cache: 'no-store',
          })
          const rows = await res.json()
          isVerified = rows?.[0]?.is_farbmischung_verified === true
    } catch {
          isVerified = false
    }

  if (!isVerified) return <VerificationGate />
    return <FarbmischungForm />
}
