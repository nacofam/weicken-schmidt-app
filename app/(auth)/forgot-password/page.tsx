'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      toast.error('Fehler: ' + error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="card shadow-card-hover text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-brand-500" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">E-Mail verschickt!</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          Wir haben dir einen Link zum Zurücksetzen des Passworts an{' '}
          <strong>{email}</strong> gesendet.
        </p>
        <Link href="/login" className="btn-primary w-full">
          Zurück zum Login
        </Link>
      </div>
    )
  }

  return (
    <div className="card shadow-card-hover">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">Passwort vergessen?</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Kein Problem! Gib deine E-Mail-Adresse ein und wir schicken dir einen Reset-Link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">E-Mail-Adresse</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="input"
            autoComplete="email"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Wird gesendet…
            </span>
          ) : (
            'Reset-Link senden'
          )}
        </button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-700">
            Zurück zum Login
          </Link>
        </div>
      </form>
    </div>
  )
}
