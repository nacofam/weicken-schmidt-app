'use client'

import { useState } from 'react'
import { ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { revokeVerificationCode } from '@/app/admin/verifizierung/actions'

export default function RevokeVerificationCode({
  codeId,
  codeName,
  customerName,
}: {
  codeId: string
  codeName: string
  customerName?: string | null
}) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRevoke = async () => {
    setLoading(true)

    const result = await revokeVerificationCode(codeId)

    if (!result.success) {
      toast.error('Fehler beim Sperren: ' + result.error)
      setLoading(false)
      return
    }

    toast.success(
      customerName
        ? `Zugang von ${customerName} wurde gesperrt.`
        : `Code ${codeName} wurde gesperrt.`
    )
    setConfirm(false)
    setLoading(false)
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
      >
        <ShieldOff size={12} />
        Zugang entziehen
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <p className="text-xs text-red-700 font-medium">Wirklich sperren?</p>
      <button
        onClick={handleRevoke}
        disabled={loading}
        className="text-xs bg-red-600 text-white px-2.5 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? '…' : 'Ja, sperren'}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-xs text-neutral-500 hover:text-neutral-700"
      >
        Abbrechen
      </button>
    </div>
  )
}
