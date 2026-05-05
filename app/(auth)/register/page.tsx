'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    customerNumber: '',
    password: '',
    passwordConfirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Diese E-Mail-Adresse ist bereits registriert.')
      } else {
        toast.error('Registrierung fehlgeschlagen: ' + error.message)
      }
      setLoading(false)
      return
    }

    // Optionale Felder ins Profil schreiben
    if (formData.phone || formData.customerNumber) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({
            phone: formData.phone || null,
            customer_number: formData.customerNumber || null,
          })
          .eq('id', user.id)
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card shadow-card-hover text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Fast geschafft!</h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
          Wir haben dir eine Bestätigungs-E-Mail an <strong>{formData.email}</strong> geschickt.
          Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
        </p>
        <p className="text-xs text-neutral-400">
          Keine E-Mail erhalten?{' '}
          <Link href="/login" className="text-brand-500 hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="card shadow-card-hover">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">Konto erstellen</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Bereits registriert?{' '}
        <Link href="/login" className="text-brand-500 font-medium hover:underline">
          Anmelden
        </Link>
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">Vollständiger Name *</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={update('fullName')}
            placeholder="Max Mustermann"
            className="input"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="label">E-Mail-Adresse *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={update('email')}
            placeholder="max@beispiel.de"
            className="input"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label">
            Telefon{' '}
            <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={update('phone')}
            placeholder="+49 234 ..."
            className="input"
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="label">
            Kundennummer{' '}
            <span className="text-neutral-400 font-normal">(falls vorhanden)</span>
          </label>
          <input
            type="text"
            value={formData.customerNumber}
            onChange={update('customerNumber')}
            placeholder="z.B. 10042"
            className="input"
          />
          <p className="text-xs text-neutral-400 mt-1">
            Deine Kundennummer findest du auf früheren Rechnungen.
          </p>
        </div>

        <div className="border-t border-neutral-100 pt-4">
          <div className="relative">
            <label className="label">Passwort * (mind. 8 Zeichen)</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={formData.password}
              onChange={update('password')}
              placeholder="••••••••"
              className="input pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Passwort bestätigen *</label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.passwordConfirm}
            onChange={update('passwordConfirm')}
            placeholder="••••••••"
            className="input"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Konto wird erstellt…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={16} />
              Kostenlos registrieren
            </span>
          )}
        </button>

        <p className="text-xs text-neutral-400 text-center">
          Mit der Registrierung akzeptierst du unsere Nutzungsbedingungen.
        </p>
      </form>
    </div>
  )
}
