'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLOR_REQUEST_STATUS_LABELS, type ColorRequestStatus } from '@/types/database.types'
import toast from 'react-hot-toast'

const NEXT_STATUS: Record<string, { to: ColorRequestStatus; label: string; color: string }[]> = {
  pending:    [
    { to: 'processing', label: 'Wird gemischt', color: 'bg-blue-500 text-white' },
    { to: 'cancelled',  label: 'Stornieren',     color: 'bg-red-50 text-red-600 border border-red-200' },
  ],
  processing: [
    { to: 'ready',      label: 'Abholbereit',    color: 'bg-green-500 text-white' },
    { to: 'cancelled',  label: 'Stornieren',     color: 'bg-red-50 text-red-600 border border-red-200' },
  ],
  ready:      [
    { to: 'picked_up',  label: 'Abgeholt',       color: 'bg-neutral-700 text-white' },
  ],
}

export default function UpdateColorRequestStatus({
  requestId,
  currentStatus,
}: {
  requestId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const actions = NEXT_STATUS[currentStatus] || []

  if (actions.length === 0) return null

  const update = async (newStatus: ColorRequestStatus) => {
    setLoading(newStatus)
    const supabase = createClient()
    const { error } = await supabase
      .from('color_requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (error) {
      toast.error('Fehler beim Aktualisieren.')
    } else {
      toast.success(COLOR_REQUEST_STATUS_LABELS[newStatus])
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="flex gap-2 pt-2 border-t border-neutral-50">
      {actions.map(action => (
        <button
          key={action.to}
          onClick={() => update(action.to)}
          disabled={!!loading}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 ${action.color}`}
        >
          {loading === action.to ? '…' : action.label}
        </button>
      ))}
    </div>
  )
}
