'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Innere Komponente, die useSearchParams verwendet (muss in Suspense liegen)
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('E-Mail oder Passwort falsch.')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Bitte bestätige zuerst deine E-Mail-Adresse.')
      } else {
        toast.error('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
      }
      setLoading(false)
      return
    }

    toast.success('Willkommen zurück! 👋')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="card shadow-card-hover">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">Anmelden</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-brand-500 font-medium hover:underline">
          Jetzt registrieren
        </Link>
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">E-Mail-Adresse</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="label mb-0">Passwort</label>
            <Link href="/forgot-password" className="text-xs text-brand-500 hover:underline">
              Vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Anmelden…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn size={16} />
              Anmelden
            </span>
          )}
        </button>
      </form>
    </div>
  )
}

// Äußere Seite mit Suspense-Wrapper (Next.js 14 Pflicht für useSearchParams)
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="card shadow-card-hover">
        <div className="h-6 bg-neutral-100 rounded w-32 animate-pulse mb-2" />
        <div className="h-4 bg-neutral-50 rounded w-48 animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-brand-100 rounded-xl animate-pulse" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
