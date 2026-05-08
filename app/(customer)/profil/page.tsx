'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Hash, Save, Palette, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types/database.types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  processing: 'In Bearbeitung',
  ready: 'Abholbereit',
  picked_up: 'Abgeholt',
  cancelled: 'Storniert',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  picked_up: 'bg-neutral-100 text-neutral-500',
  cancelled: 'bg-red-100 text-red-600',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [colorRequests, setColorRequests] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

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

      const { data: requests } = await supabase
        .from('color_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setColorRequests(requests || [])
      setHistoryLoading(false)
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
    <div className="px-4 py-5 space-y-6">
      <h1 className="text-xl font-bold text-neutral-900">Mein Profil</h1>

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

      {/* Farbhistorie */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
            <Palette size={16} className="text-brand-500" />
            Farbhistorie
          </h2>
          <Link href="/farbmischung" className="text-xs text-brand-600 font-medium flex items-center gap-0.5">
            Neue Anfrage <ChevronRight size={13} />
          </Link>
        </div>

        {historyLoading ? (
          <div className="card text-center py-6">
            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : colorRequests.length === 0 ? (
          <div className="card text-center py-8">
            <Palette size={32} className="text-neutral-200 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">Noch keine Farbanfragen.</p>
            <Link href="/farbmischung" className="inline-block mt-3 text-sm text-brand-600 font-medium">
              Jetzt Farbe mischen lassen →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {colorRequests.map(req => (
              <div key={req.id} className="card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">
                      {req.color_name || req.color_code || 'Farbanfrage'}
                    </p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      {formatDate(req.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status] || 'bg-neutral-100 text-neutral-500'}`}>
                    {STATUS_LABELS[req.status] || req.status}
                  </span>
                </div>

                <div className="bg-neutral-50 rounded-xl px-3 py-2 space-y-1">
                  <div className="flex gap-4 text-xs text-neutral-600">
                    <span><span className="font-medium">System:</span> {req.color_system}</span>
                    <span><span className="font-medium">Menge:</span> {req.quantity_liters} L</span>
                  </div>
                  {req.base_type && (
                    <p className="text-xs text-neutral-500">{req.base_type}</p>
                  )}
                </div>

                <Link
                  href={`/farbmischung?repeat=${req.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-brand-200 text-brand-600 text-xs font-medium hover:bg-brand-50 transition-colors"
                >
                  <Palette size={13} />
                  Wieder anfragen
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
