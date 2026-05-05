import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Clock, Package, CheckCircle, XCircle } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/database.types'
import CancelOrderButton from '@/components/orders/CancelOrderButton'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const statusColor = ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]
  const canCancel = order.status === 'pending'

  const statusSteps = [
    { key: 'pending',   label: 'Eingegangen',  icon: Package },
    { key: 'confirmed', label: 'Bestätigt',     icon: CheckCircle },
    { key: 'ready',     label: 'Abholbereit',   icon: CheckCircle },
    { key: 'picked_up', label: 'Abgeholt',      icon: CheckCircle },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status)

  return (
    <div className="px-4 py-5">
      {/* Zurück */}
      <Link href="/vorbestellungen" className="inline-flex items-center gap-1.5 text-sm text-brand-500 font-medium mb-5">
        <ArrowLeft size={16} />
        Alle Bestellungen
      </Link>

      {/* Status-Badge */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Bestellung #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Aufgegeben am {formatDateTime(order.created_at)}
          </p>
        </div>
        <span className={`badge ${statusColor}`}>{statusLabel}</span>
      </div>

      {/* Status-Fortschritt */}
      {order.status !== 'cancelled' && (
        <div className="card mb-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => {
              const isCompleted = i < currentStepIndex || order.status === 'picked_up'
              const isCurrent = i === currentStepIndex && order.status !== 'picked_up'
              const isFuture = i > currentStepIndex

              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative">
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                      i < currentStepIndex ? 'bg-brand-400' : 'bg-neutral-200'
                    }`} />
                  )}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                    isCompleted || (order.status === 'picked_up' && i <= 3)
                      ? 'bg-brand-500 border-brand-500'
                      : isCurrent
                        ? 'bg-white border-brand-500'
                        : 'bg-white border-neutral-200'
                  }`}>
                    {(isCompleted || order.status === 'picked_up') && (
                      <CheckCircle size={14} className="text-white" />
                    )}
                    {isCurrent && (
                      <div className="w-2 h-2 bg-brand-500 rounded-full" />
                    )}
                  </div>
                  <p className={`text-[10px] mt-1.5 text-center leading-tight ${
                    isCurrent ? 'text-brand-600 font-semibold' : isFuture ? 'text-neutral-300' : 'text-neutral-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Abholtermin */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <Clock size={18} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Abholdatum</p>
            <p className="font-semibold text-neutral-900">
              {formatDate(order.pickup_date, "EEEE, dd. MMMM yyyy")}
            </p>
            {order.status === 'ready' && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                ✅ Deine Bestellung liegt bereit!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Artikel */}
      <div className="card mb-4">
        <h2 className="font-semibold text-neutral-900 mb-3">
          Bestellte Artikel ({order.order_items?.length || 0})
        </h2>
        <div className="space-y-2">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between py-2 border-b border-neutral-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-800">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-neutral-500">{item.variant_name}</p>
                )}
                {item.notes && (
                  <p className="text-xs text-neutral-400 italic mt-0.5">"{item.notes}"</p>
                )}
              </div>
              <span className="text-sm font-semibold text-neutral-700 shrink-0 ml-2">
                {item.quantity}×
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notizen */}
      {order.notes && (
        <div className="card mb-4 bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-600 mb-1">Deine Notiz</p>
          <p className="text-sm text-neutral-600">{order.notes}</p>
        </div>
      )}

      {order.admin_notes && (
        <div className="card mb-4 bg-brand-50 border-brand-100">
          <p className="text-xs font-semibold text-brand-700 mb-1">Nachricht vom Laden</p>
          <p className="text-sm text-brand-700">{order.admin_notes}</p>
        </div>
      )}

      {/* Stornieren */}
      {canCancel && (
        <CancelOrderButton orderId={order.id} />
      )}
    </div>
  )
}
