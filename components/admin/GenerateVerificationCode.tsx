'use client'

import { useState } from 'react'
import { Plus, Copy, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { createVerificationCode } from '@/app/admin/verifizierung/actions'

// Code-Alphabet: keine verwechselbaren Zeichen (kein 0/O, 1/I/L, U)
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'

function generateCode(): string {
  const segment = () =>
    Array.from({ length: 5 }, () =>
      ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    ).join('')
  return `${segment()}-${segment()}`
}

export default function GenerateVerificationCode() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState<string>(generateCode())
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const refreshCode = () => {
    setPreview(generateCode())
    setCopied(false)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(preview)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreate = async () => {
    setLoading(true)

    const result = await createVerificationCode(preview, notes.trim() || null)

    if (!result.success) {
      if (result.error === 'DUPLICATE') {
        toast.error('Code-Kollision – bitte nochmal versuchen.')
        setPreview(generateCode())
      } else {
        toast.error('Fehler beim Erstellen: ' + result.error)
      }
      setLoading(false)
      return
    }

    toast.success(`Code ${preview} erstellt!`)
    setOpen(false)
    setNotes('')
    setPreview(generateCode())
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary text-sm"
      >
        <Plus size={15} />
        Code generieren
      </button>
    )
  }

  return (
    <div className="card space-y-4 border-2 border-dashed border-purple-200 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-neutral-900">Neuen Verifizierungscode erstellen</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-neutral-400 hover:text-neutral-600"
        >
          Abbrechen
        </button>
      </div>

      {/* Code-Vorschau */}
      <div>
        <p className="label mb-2">Generierter Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-purple-200 rounded-xl px-4 py-3 text-center">
            <span className="font-mono text-xl font-bold tracking-widest text-purple-700">
              {preview}
            </span>
          </div>
          <button
            type="button"
            onClick={copyCode}
            title="Kopieren"
            className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
          >
            {copied
              ? <CheckCheck size={16} className="text-green-600" />
              : <Copy size={16} className="text-neutral-500" />
            }
          </button>
        </div>
        <button
          type="button"
          onClick={refreshCode}
          className="text-xs text-purple-600 hover:underline mt-1.5"
        >
          ↻ Anderen Code generieren
        </button>
      </div>

      {/* Notiz */}
      <div>
        <label className="label">Interne Notiz <span className="text-neutral-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="z.B. Hans Müller – Stammkunde seit 2019"
          className="input text-sm"
        />
        <p className="text-xs text-neutral-400 mt-1">Nur für dich sichtbar — nicht für den Kunden.</p>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Wird gespeichert…
          </>
        ) : (
          <>
            <Plus size={15} />
            Code speichern
          </>
        )}
      </button>
    </div>
  )
}
