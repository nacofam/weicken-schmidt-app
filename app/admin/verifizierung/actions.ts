'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'

// Code-Alphabet: keine verwechselbaren Zeichen (kein 0/O, 1/I/L, U)
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'

function generateCode(): string {
  const segment = () =>
    Array.from({ length: 5 }, () =>
      ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    ).join('')
  return `${segment()}-${segment()}`
}

export async function createVerificationCode(
  code: string,
  notes: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nicht eingeloggt' }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase.from('verification_codes').insert({
    code,
    notes: notes || null,
    created_by: user.id,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'DUPLICATE' }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/verifizierung')
  return { success: true }
}

export async function revokeVerificationCode(
  codeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nicht eingeloggt' }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('verification_codes')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', codeId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/verifizierung')
  return { success: true }
}
