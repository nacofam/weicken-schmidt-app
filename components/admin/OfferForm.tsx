'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Save, Trash2, ImagePlus, X } from 'lucide-react'
import type { Offer } from '@/types/database.types'
import Image from 'next/image'

interface OfferFormProps {
  offer?: Offer
}

export default function OfferForm({ offer }: OfferFormProps) {
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')
  const isEditing = !!offer

  const [form, setForm] = useState({
    title: offer?.title || '',
    description: offer?.description || '',
    original_price: offer?.original_price?.toString() || '',
    offer_price: offer?.offer_price?.toString() || '',
    badge_text: offer?.badge_text || '',
    valid_from: offer?.valid_from || today,
    valid_until: offer?.valid_until || '',
    active: offer?.active ?? true,
    sort_order: offer?.sort_order?.toString() || '0',
  })
  const [imageUrl, setImageUrl] = useState<string | null>(offer?.image_url || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(offer?.image_url || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bild zu groß. Maximal 5 MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (supabase: ReturnType<typeof createClient>): Promise<string | null> => {
    if (!imageFile) return imageUrl // keep existing URL if no new file
    setUploadingImage(true)
    try {
      const ext = imageFile.name.split('.').pop() || 'jpg'
      const filename = `offer-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('offer-images')
        .upload(filename, imageFile, { upsert: true, contentType: imageFile.type })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('offer-images').getPublicUrl(data.path)
      return urlData.publicUrl
    } catch (err: any) {
      toast.error('Bild-Upload fehlgeschlagen: ' + err.message)
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Bitte gib einen Titel ein.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const uploadedImageUrl = await uploadImage(supabase)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      offer_price: form.offer_price ? parseFloat(form.offer_price) : null,
      badge_text: form.badge_text.trim() || null,
      valid_from: form.valid_from,
      valid_until: form.valid_until || null,
      active: form.active,
      sort_order: parseInt(form.sort_order) || 0,
      image_url: uploadedImageUrl,
    }

    let error
    if (isEditing && offer) {
      const result = await supabase.from('offers').update(payload).eq('id', offer.id)
      error = result.error
    } else {
      const result = await supabase.from('offers').insert(payload)
      error = result.error
    }

    if (error) {
      toast.error('Fehler beim Speichern: ' + error.message)
      setLoading(false)
      return
    }

    toast.success(isEditing ? 'Angebot aktualisiert!' : 'Angebot erstellt!')
    router.push('/admin/angebote')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!offer || !window.confirm('Angebot wirklich löschen?')) return
    setDeleting(true)
    const supabase = createClient()
    // Delete image from storage if present
    if (offer.image_url) {
      const path = offer.image_url.split('/offer-images/')[1]
      if (path) await supabase.storage.from('offer-images').remove([path])
    }
    await supabase.from('offers').delete().eq('id', offer.id)
    toast.success('Angebot gelöscht.')
    router.push('/admin/angebote')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bild */}
      <div>
        <label className="label">Produktbild</label>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
            <img
              src={imagePreview}
              alt="Vorschau"
              className="w-full h-40 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
          >
            <ImagePlus size={24} />
            <span className="text-sm">Bild hochladen</span>
            <span className="text-xs">JPG, PNG, WebP · max. 5 MB</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="hidden"
        />
        {imagePreview && !imageFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-1.5 text-xs text-brand-600 hover:underline"
          >
            Anderes Bild wählen
          </button>
        )}
      </div>

      {/* Titel */}
      <div>
        <label className="label">Titel *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={update('title')}
          placeholder="z.B. Alpina Feine Farben 10L"
          className="input"
        />
      </div>

      {/* Beschreibung */}
      <div>
        <label className="label">Beschreibung</label>
        <textarea
          value={form.description}
          onChange={update('description')}
          placeholder="Kurze Produktbeschreibung oder Aktionstext…"
          className="input resize-none h-24"
        />
      </div>

      {/* Preise */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Normalpreis (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.original_price}
            onChange={update('original_price')}
            placeholder="0.00"
            className="input"
          />
          <p className="text-xs text-neutral-400 mt-1">Wird durchgestrichen angezeigt</p>
        </div>
        <div>
          <label className="label">Angebotspreis (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.offer_price}
            onChange={update('offer_price')}
            placeholder="0.00"
            className="input"
          />
        </div>
      </div>

      {/* Badge */}
      <div>
        <label className="label">Badge-Text</label>
        <input
          type="text"
          value={form.badge_text}
          onChange={update('badge_text')}
          placeholder="z.B. -20%, NEU, Tipp"
          className="input"
          maxLength={20}
        />
        <p className="text-xs text-neutral-400 mt-1">Kurzer Aufkleber auf dem Angebot (max. 20 Zeichen)</p>
      </div>

      {/* Datum */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Gültig ab *</label>
          <input
            type="date"
            required
            value={form.valid_from}
            onChange={update('valid_from')}
            className="input"
          />
        </div>
        <div>
          <label className="label">Gültig bis</label>
          <input
            type="date"
            value={form.valid_until}
            onChange={update('valid_until')}
            min={form.valid_from}
            className="input"
          />
          <p className="text-xs text-neutral-400 mt-1">Leer lassen = kein Ablaufdatum</p>
        </div>
      </div>

      {/* Status & Reihenfolge */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select
            value={form.active ? 'active' : 'inactive'}
            onChange={e => setForm(prev => ({ ...prev, active: e.target.value === 'active' }))}
            className="input"
          >
            <option value="active">Aktiv (sichtbar)</option>
            <option value="inactive">Inaktiv (ausgeblendet)</option>
          </select>
        </div>
        <div>
          <label className="label">Reihenfolge</label>
          <input
            type="number"
            min="0"
            value={form.sort_order}
            onChange={update('sort_order')}
            className="input"
          />
          <p className="text-xs text-neutral-400 mt-1">Niedrigere Zahl = weiter oben</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading || uploadingImage} className="btn-primary flex-1">
          {loading || uploadingImage ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {uploadingImage ? 'Bild wird hochgeladen…' : 'Speichern…'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={15} />
              {isEditing ? 'Aktualisieren' : 'Angebot erstellen'}
            </span>
          )}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger px-4"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </form>
  )
}
