'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignaturePad from './SignaturePad'
import { Loader2, CheckCircle } from 'lucide-react'

interface SignAndConfirmProps {
  deliveryNoteId: string
}

export default function SignAndConfirm({ deliveryNoteId }: SignAndConfirmProps) {
  const router = useRouter()
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSaveSignature = (dataUrl: string) => {
    setSignatureData(dataUrl)
  }

  const handleConfirm = async () => {
    if (!signatureData) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/lieferscheine/${deliveryNoteId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_data: signatureData }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fehler beim Speichern')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch {
      setError('Verbindungsfehler – bitte erneut versuchen')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle size={24} className="text-green-600" />
        </div>
        <p className="text-sm font-semibold text-green-700">Vielen Dank! Unterschrift gespeichert.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <SignaturePad onSave={handleSaveSignature} disabled={loading} />

      {signatureData && (
        <div className="space-y-2">
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            <p className="text-xs text-neutral-500 mb-2 text-center">Vorschau Ihrer Unterschrift:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signatureData} alt="Unterschrift Vorschau" className="max-h-20 mx-auto" />
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {loading ? 'Wird gespeichert…' : 'Lieferschein verbindlich unterschreiben'}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
