'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react'

type ActivateResult =
  | { success: true; already_verified: boolean }
  | { success: false; error: 'invalid_code' | 'code_already_used' | 'not_authenticated' | string }

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code:      'Dieser Code ist ungültig. Bitte prüfe die Eingabe.',
  code_already_used: 'Dieser Code wurde bereits von einem anderen Kunden eingelöst.',
  not_authenticated: 'Bitte melde dich erneut an.',
}

export default function VerificationGate() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Code formatieren: automatisch Bindestrich nach 5 Zeichen einfügen
  const handleCodeChange = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const formatted = clean.length > 5
      ? `${clean.slice(0, 5)}-${clean.slice(5, 10)}`
      : clean
    setCode(formatted)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const rawCode = code.replace(/-/g, '')
    if (rawCode.length < 8) {
      setError('Bitte gib einen vollständigen Code ein.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: rpcError } = await supabase.rpc('activate_verification_code', {
      p_code: code,
    })

    if (rpcError) {
      setError('Verbindungsfehler. Bitte versuche es nochmal.')
      setLoading(false)
      return
    }

    const result = data as ActivateResult

    if (!result.success) {
      setError(ERROR_MESSAGES[result.error] || 'Ein unbekannter Fehler ist aufgetreten.')
      setLoading(false)
      return
    }

    // Erfolg — kurz anzeigen, dann Seite neu laden
    setSuccess(true)
    setTimeout(() => router.refresh(), 1200)
  }

  if (success) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Zugang freigeschaltet!</h2>
        <p className="text-sm text-neutral-500">Du wirst gleich weitergeleitet…</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-6">
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
          <ShieldCheck size={26} className="text-purple-600" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Farbmischservice</h1>
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
          Dieser Service steht nur verifizierten Stammkunden zur Verfügung.
        </p>
      </div>

      {/* Info-Karte */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6">
        <p className="text-xs text-purple-800 leading-relaxed">
          <strong>Stammkunde?</strong> Du hast von uns persönlich einen Verifizierungscode erhalten —
          entweder im Laden oder per Telefon. Gib ihn hier ein, um den Farbmischservice dauerhaft freizuschalten.
        </p>
        <p className="text-xs text-purple-600 mt-2">
          Noch keinen Code? Komm einfach bei uns vorbei oder ruf an:{' '}
          <a href="tel:+4923029732-0" className="font-semibold hover:underline">
            +49 2302 9732-0
          </a>
        </p>
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Dein Verifizierungscode</label>
          <div className="relative">
            <KeyRound
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={code}
              onChange={e => handleCodeChange(e.target.value)}
              placeholder="XXXXX-XXXXX"
              maxLength={11}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="input pl-10 font-mono tracking-widest text-center text-lg uppercase"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1.5 text-center">
            Format: 10 Zeichen, z.&thinsp;B. <span className="font-mono">ABCDE-FGH2K</span>
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-snug">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.replace(/-/g, '').length < 8}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Wird geprüft…
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              Code einlösen
            </>
          )}
        </button>
      </form>
    </div>
  )
}
