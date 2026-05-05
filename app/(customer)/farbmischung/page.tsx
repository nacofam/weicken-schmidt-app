import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VerificationGate from '@/components/farbmischung/VerificationGate'
import FarbmischungForm from '@/components/farbmischung/FarbmischungForm'

export const metadata = { title: 'Farbmischservice' }

export default async function FarbmischungPage() {
  const supabase = createClient()

  // Aktuellen Nutzer laden
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profil laden – is_farbmischung_verified prüfen
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_farbmischung_verified')
    .eq('id', user.id)
    .single()

  const isVerified = profile?.is_farbmischung_verified === true

  // Nicht verifiziert → Code-Eingabe anzeigen
  if (!isVerified) {
    return <VerificationGate />
  }

  // Verifiziert → Farbmischformular anzeigen
  return <FarbmischungForm />
}
