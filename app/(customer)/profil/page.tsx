'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Hash, Save } from 'lucide-react'
import type { Profile } from '@/types/database.types'

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '' })
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name || null, phone: form.phone || null })
      .eq('id', profile!.id)

    if (error) {
      toast.error('Fehler beim Speichern.')
    } else {
      toast.success('Profil gespeichert!')
    }
    setLoading(false)
  }

  if (!profile) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Mein Profil</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="card mb-2">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center">
              <User size={28} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{profile.full_name || 'Kein Name'}</p>
              <p className="text-sm text-neutral-500">{profile.email}</p>
              {profile.customer_number && (
                <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                  <Hash size={11} />
                  Kundennummer: {profile.customer_number}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5"><User size={13} className="text-neutral-400" /> Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Vollständiger Name"
              className="input"
            />
          </div>

          <div className="mt-4">
            <label className="label flex items-center gap-1.5"><Phone size={13} className="text-neutral-400" /> Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+49 234 ..."
              className="input"
            />
          </div>

          <div className="mt-4">
            <label className="label flex items-center gap-1.5"><Mail size={13} className="text-neutral-400" /> E-Mail</label>
            <input type="email" value={profile.email} disabled className="input" />
            <p className="text-xs text-neutral-400 mt-1">E-Mail-Adresse kann nicht geändert werden.</p>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Speichern…' : <><Save size={15} /> Profil speichern</>}
        </button>
      </form>
    </div>
  )
}
