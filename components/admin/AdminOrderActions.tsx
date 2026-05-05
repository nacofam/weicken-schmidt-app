'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/database.types'
import toast from 'react-hot-toast'
import { CheckCircle, Package, Truck, XCircle, MessageSquare } from 'lucide-react'

const STATUS_FLOW: { from: OrderStatus[]; to: OrderStatus; label: string; icon: any; color: string }[] = [
  {
    from: ['pending'],
    to: 'confirmed',
    label: 'Bestellung bestätigen',
    icon: CheckCircle,
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  {
    from: ['pending', 'confirmed'],
    to: 'ready',
    label: 'Als abholbereit markieren',
    icon: Package,
    color: 'bg-green-500 hover:bg-green-600 text-white',
  },
  {
    from: ['ready'],
    to: 'picked_up',
    label: 'Als abgeholt markieren',
    icon: Truck,
    color: 'bg-neutral-700 hover:bg-neutral-800 text-white',
  },
  {
    from: ['pending', 'confirmed', 'ready'],
    to: 'cancelled',
    label: 'Bestellung stornieren',
    icon: XCircle,
    color: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
  },
]

export default function AdminOrderActions({ order }: { order: any }) {
  const router = useRouter()
  const [adminNote, setAdminNote] = useState(order.admin_notes || '')
  const [savingNote, setSavingNote] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const availableActions = STATUS_FLOW.filter(a =>
    a.from.includes(order.status) && a.to !== order.status
  )

  const updateStatus = async (newStatus: OrderStatus) => {
    setLoading(newStatus)
    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)

    if (error) {
      toast.error('Statusänderung fehlgeschlagen.')
    } else {
      toast.success(`Status: ${ORDER_STATUS_LABELS[newStatus]}`)
      router.refresh()
    }
    setLoading(null)
  }

  const saveNote = async () => {
    setSavingNote(true)
    const supabase = createClient()

    await supabase
      .from('orders')
      .update({ admin_notes: adminNote || null })
      .eq('id', order.id)

    toast.success('Notiz gespeichert.')
    setSavingNote(false)
    router.refresh()
  }

  if (order.status === 'picked_up' || order.status === 'cancelled') {
    return (
      <div className="card bg-neutral-50 text-center text-sm text-neutral-500 py-4">
        Diese Bestellung ist abgeschlossen.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Status-Aktionen */}
      <div className="card">
        <h2 className="font-semibold text-neutral-900 mb-3">Status ändern</h2>
        <div className="space-y-2">
          {availableActions.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.to}
                onClick={() => updateStatus(action.to)}
                disabled={!!loading}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${action.color}`}
              >
                {loading === action.to ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <Icon size={17} />
                )}
                {action.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Admin-Notiz */}
      <div className="card">
        <h2 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
          <MessageSquare size={16} className="text-neutral-400" />
          Nachricht an Kunden
        </h2>
        <p className="text-xs text-neutral-500 mb-2">
          Wird dem Kunden in der App angezeigt.
        </p>
        <textarea
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          placeholder="z.B. Bitte bis 17 Uhr abholen."
          className="input resize-none h-20 text-sm"
        />
        <button
          onClick={saveNote}
          disabled={savingNote}
          className="btn-secondary w-full mt-2 text-sm"
        >
          {savingNote ? 'Wird gespeichert…' : 'Notiz speichern'}
        </button>
      </div>
    </div>
  )
}
