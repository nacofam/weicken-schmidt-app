'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Palette, Send } from 'lucide-react'
import toast from 'react-hot-toast'

// Farbsysteme die Weicken & Schmidt anbietet (Caparol Hauptmarke + Standard-Systeme)
const COLOR_SYSTEMS = ['RAL', 'NCS', 'Caparol', 'Sigma', 'Dörken', 'Andere']
const BASE_TYPES = ['matt', 'seidenmatt', 'glänzend', 'hochglänzend']
const QUANTITIES = [1, 2.5, 5, 10]

export default function FarbmischungForm() {
  const [form, setForm] = useState({
    color_system: 'RAL',
    color_code: '',
    color_name: '',
    base_type: 'matt',
    quantity_liters: '2.5',
    notes: '',
    desired_pickup_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.color_code && !form.color_name) {
      toast.error('Bitte gib einen Farbcode oder Farbnamen ein.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Bitte melde dich an.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('color_requests').insert({
      user_id: user.id,
      color_system: form.color_system,
      color_code: form.color_code || null,
      color_name: form.color_name || null,
      base_type: form.base_type,
      quantity_liters: parseFloat(form.quantity_liters),
      notes: form.notes || null,
      desired_pickup_date: form.desired_pickup_date || null,
      status: 'pending',
    })

    if (error) {
      toast.error('Fehler beim Absenden.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Palette size={28} className="text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Anfrage gesendet!</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Wir haben deine Farbmischanfrage erhalten und melden uns bei dir.
        </p>
        <button
          onClick={() => {
            setSent(false)
            setForm({
              color_system: 'RAL',
              color_code: '',
              color_name: '',
              base_type: 'matt',
              quantity_liters: '2.5',
              notes: '',
              desired_pickup_date: '',
            })
          }}
          className="btn-primary mt-6"
        >
          Neue Anfrage
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Farbmischservice</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Konfiguriere deine Wunschfarbe – wir mischen sie für dich.
        </p>
      </div>

      {/* Info-Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-5">
        <p className="text-xs text-purple-700 leading-relaxed">
          💡 <strong>So funktioniert's:</strong> Gib Farbsystem und Farbcode an.
          Wir prüfen Verfügbarkeit und Preis und kontaktieren dich, bevor du abholst.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Farbsystem */}
        <div>
          <label className="label">Farbsystem *</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_SYSTEMS.map(sys => (
              <button
                key={sys}
                type="button"
                onClick={() => setForm(f => ({ ...f, color_system: sys }))}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  form.color_system === sys
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-purple-300'
                }`}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        {/* Farbcode */}
        <div>
          <label className="label">Farbcode</label>
          <input
            type="text"
            value={form.color_code}
            onChange={update('color_code')}
            placeholder={
              form.color_system === 'RAL'    ? 'z.B. RAL 3020 (Verkehrsrot)' :
              form.color_system === 'NCS'    ? 'z.B. S 2050-R10B' :
              form.color_system === 'Caparol'? 'z.B. 3D-System 10 Y 50 M 00' :
              form.color_system === 'Sigma'  ? 'z.B. SG 5052' :
              'Farbcode eingeben'
            }
            className="input"
          />
        </div>

        {/* Farbname */}
        <div>
          <label className="label">
            Farbname <span className="text-neutral-400 font-normal">(alternativ oder zusätzlich)</span>
          </label>
          <input
            type="text"
            value={form.color_name}
            onChange={update('color_name')}
            placeholder="z.B. Verkehrsrot, Himmelblau"
            className="input"
          />
        </div>

        {/* Basis */}
        <div>
          <label className="label">Oberfläche *</label>
          <div className="grid grid-cols-2 gap-2">
            {BASE_TYPES.map(base => (
              <button
                key={base}
                type="button"
                onClick={() => setForm(f => ({ ...f, base_type: base }))}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  form.base_type === base
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-purple-300'
                }`}
              >
                {base}
              </button>
            ))}
          </div>
        </div>

        {/* Menge */}
        <div>
          <label className="label">Menge *</label>
          <div className="grid grid-cols-4 gap-2">
            {QUANTITIES.map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => setForm(f => ({ ...f, quantity_liters: qty.toString() }))}
                className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                  form.quantity_liters === qty.toString()
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-purple-300'
                }`}
              >
                {qty} L
              </button>
            ))}
          </div>
        </div>

        {/* Wunsch-Abholdatum */}
        <div>
          <label className="label">
            Wunsch-Abholdatum <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={form.desired_pickup_date}
            onChange={update('desired_pickup_date')}
            min={new Date().toISOString().split('T')[0]}
            className="input"
          />
        </div>

        {/* Notizen */}
        <div>
          <label className="label">
            Sonstige Hinweise <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={update('notes')}
            placeholder="z.B. spezielle Anforderungen, Verarbeitung auf Fliesen..."
            className="input resize-none h-20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Wird gesendet…
            </>
          ) : (
            <>
              <Send size={15} />
              Anfrage absenden
            </>
          )}
        </button>
      </form>
    </div>
  )
}
