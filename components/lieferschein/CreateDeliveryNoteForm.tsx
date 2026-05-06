'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Send, Loader2 } from 'lucide-react'

interface Customer {
  id: string
  full_name: string | null
  email: string
  customer_number: string | null
}

interface LineItem {
  name: string
  quantity: string
  unit: string
  unit_price: string
}

const DEFAULT_UNITS = ['Stk.', 'Eimer', 'kg', 'L', 'Rolle', 'm²', 'Set', 'Pkg.']

export default function CreateDeliveryNoteForm({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([
    { name: '', quantity: '1', unit: 'Stk.', unit_price: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addItem = () => {
    setItems(prev => [...prev, { name: '', quantity: '1', unit: 'Stk.', unit_price: '' }])
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const totalAmount = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unit_price.replace(',', '.')) || 0
    return sum + qty * price
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { setError('Bitte Kunden auswählen'); return }
    if (items.every(i => !i.name.trim())) { setError('Mindestens ein Artikel muss eingetragen sein'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/lieferscheine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          delivery_date: deliveryDate,
          notes: notes.trim() || null,
          items: items
            .filter(i => i.name.trim())
            .map(i => ({
              name: i.name.trim(),
              quantity: parseFloat(i.quantity) || 1,
              unit: i.unit,
              unit_price: parseFloat(i.unit_price.replace(',', '.')) || null,
            })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen')
        return
      }

      router.push('/admin/lieferscheine')
      router.refresh()
    } catch {
      setError('Verbindungsfehler – bitte erneut versuchen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Kunde */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Kunde *
        </label>
        <select
          value={userId}
          onChange={e => setUserId(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          required
        >
          <option value="">Kunden auswählen…</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.full_name || c.email}
              {c.customer_number && ` (Kd. ${c.customer_number})`}
            </option>
          ))}
        </select>
      </div>

      {/* Lieferdatum */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Lieferdatum
        </label>
        <input
          type="date"
          value={deliveryDate}
          onChange={e => setDeliveryDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Artikel */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-neutral-700">Artikel</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700"
          >
            <Plus size={13} /> Zeile hinzufügen
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
              <input
                type="text"
                placeholder="Artikelbezeichnung"
                value={item.name}
                onChange={e => updateItem(i, 'name', e.target.value)}
                className="col-span-5 px-2.5 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                type="number"
                placeholder="Menge"
                value={item.quantity}
                min="0"
                step="0.5"
                onChange={e => updateItem(i, 'quantity', e.target.value)}
                className="col-span-2 px-2.5 py-2 border border-neutral-200 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <select
                value={item.unit}
                onChange={e => updateItem(i, 'unit', e.target.value)}
                className="col-span-2 px-2 py-2 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {DEFAULT_UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <input
                type="text"
                placeholder="Preis €"
                value={item.unit_price}
                onChange={e => updateItem(i, 'unit_price', e.target.value)}
                className="col-span-2 px-2.5 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                className="col-span-1 flex items-center justify-center text-neutral-400 hover:text-red-500 disabled:opacity-30 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {totalAmount > 0 && (
          <div className="mt-3 text-right">
            <span className="text-xs text-neutral-500">Gesamtbetrag: </span>
            <span className="text-sm font-bold text-neutral-900">
              {totalAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        )}
      </div>

      {/* Notizen */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          Bemerkungen (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="z.B. Lieferung erfolgte vollständig…"
          rows={2}
          className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 text-white font-semibold text-sm rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        {loading ? 'Erstelle Lieferschein…' : 'Lieferschein erstellen & senden'}
      </button>
    </form>
  )
}
