'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)

    if (error) {
      toast.error('Stornierung fehlgeschlagen.')
      setLoading(false)
      return
    }

    toast.success('Bestellung wurde storniert.')
    router.push('/vorbestellungen')
    router.refresh()
  }

  if (showConfirm) {
    return (
      <div className="card border-red-100 bg-red-50">
        <p className="text-sm font-medium text-red-800 mb-3">
          Bestellung wirklich stornieren?
        </p>
        <p className="text-xs text-red-600 mb-4">
          Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="btn-secondary flex-1 text-sm"
          >
            Abbrechen
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn-danger flex-1 text-sm"
          >
            {loading ? 'Wird storniert…' : 'Ja, stornieren'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 text-sm font-medium hover:bg-red-50 transition-colors border border-red-100"
    >
      <XCircle size={16} />
      Bestellung stornieren
    </button>
  )
}
