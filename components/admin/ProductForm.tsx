'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2 } from 'lucide-react'
import type { Product, ProductVariant } from '@/types/database.types'

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || '',
    description: product?.description || '',
    active: product?.active ?? true,
    sort_order: product?.sort_order?.toString() || '0',
  })
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants || [{ name: '', price: 0 }]
  )
  const [loading, setLoading] = useState(false)

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const addVariant = () => setVariants([...variants, { name: '', price: 0 }])
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, field: keyof ProductVariant, value: string) => {
    const updated = [...variants]
    updated[i] = { ...updated[i], [field]: field === 'price' ? parseFloat(value) || 0 : value }
    setVariants(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category.trim()) {
      toast.error('Name und Kategorie sind Pflichtfelder.')
      return
    }

    const validVariants = variants.filter(v => v.name.trim())
    setLoading(true)
    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim() || null,
      variants: validVariants,
      active: form.active,
      sort_order: parseInt(form.sort_order) || 0,
    }

    let error
    if (isEditing && product) {
      const result = await supabase.from('products').update(payload).eq('id', product.id)
      error = result.error
    } else {
      const result = await supabase.from('products').insert(payload)
      error = result.error
    }

    if (error) {
      toast.error('Fehler: ' + error.message)
      setLoading(false)
      return
    }

    toast.success(isEditing ? 'Produkt aktualisiert!' : 'Produkt erstellt!')
    router.push('/admin/produkte')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label">Name *</label>
        <input type="text" required value={form.name} onChange={update('name')} placeholder="z.B. Alpina Feine Farben" className="input" />
      </div>

      <div>
        <label className="label">Kategorie *</label>
        <input type="text" required value={form.category} onChange={update('category')} placeholder="z.B. Wandfarbe, Werkzeug, Zubehör" className="input" />
      </div>

      <div>
        <label className="label">Beschreibung</label>
        <textarea value={form.description} onChange={update('description')} placeholder="Kurze Produktbeschreibung…" className="input resize-none h-20" />
      </div>

      {/* Varianten */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Varianten (Größen / Mengen)</label>
          <button type="button" onClick={addVariant} className="text-xs text-brand-500 font-medium flex items-center gap-1">
            <Plus size={12} /> Hinzufügen
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((variant, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={variant.name}
                onChange={e => updateVariant(i, 'name', e.target.value)}
                placeholder="z.B. 2,5 Liter"
                className="input flex-[2]"
              />
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.price || ''}
                  onChange={e => updateVariant(i, 'price', e.target.value)}
                  placeholder="Preis"
                  className="input pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">€</span>
              </div>
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)} className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 shrink-0">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-1">Preis von 0 bedeutet "Preis auf Anfrage"</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select value={form.active ? 'active' : 'inactive'} onChange={e => setForm(prev => ({ ...prev, active: e.target.value === 'active' }))} className="input">
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </div>
        <div>
          <label className="label">Reihenfolge</label>
          <input type="number" min="0" value={form.sort_order} onChange={update('sort_order')} className="input" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Speichern…' : <><Save size={15} /> {isEditing ? 'Aktualisieren' : 'Produkt erstellen'}</>}
      </button>
    </form>
  )
}
