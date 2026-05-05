import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Plus, ShoppingBag, Clock, Package } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/database.types'

export const metadata = { title: 'Vorbestellungen' }

export default async function VorbestellungenPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (id, product_name, variant_name, quantity)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const openOrders = orders?.filter(o => !['picked_up', 'cancelled'].includes(o.status)) || []
  const pastOrders = orders?.filter(o => ['picked_up', 'cancelled'].includes(o.status)) || []

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Vorbestellungen</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Alle deine Bestellungen im Überblick</p>
        </div>
        <Link href="/vorbestellungen/neu" className="btn-primary text-sm py-2 px-4">
          <Plus size={16} />
          Neu
        </Link>
      </div>

      {/* Keine Bestellungen */}
      {(!orders || orders.length === 0) && (
        <div className="card text-center py-12">
          <Package size={40} className="text-neutral-200 mx-auto mb-4" />
          <p className="font-medium text-neutral-700 mb-1">Noch keine Vorbestellungen</p>
          <p className="text-sm text-neutral-400 mb-6">
            Bestelle jetzt bequem vor und wähle deinen Abholtermin.
          </p>
          <Link href="/vorbestellungen/neu" className="btn-primary">
            <Plus size={16} />
            Erste Vorbestellung
          </Link>
        </div>
      )}

      {/* Offene Bestellungen */}
      {openOrders.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Aktiv ({openOrders.length})
          </h2>
          <div className="space-y-3">
            {openOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* Vergangene Bestellungen */}
      {pastOrders.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Abgeschlossen
          </h2>
          <div className="space-y-3">
            {pastOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: any }) {
  const statusColor = ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]
  const isPast = ['picked_up', 'cancelled'].includes(order.status)

  return (
    <Link
      href={`/vorbestellungen/${order.id}`}
      className={`card block hover:shadow-card-hover transition-shadow ${isPast ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag size={18} className="text-neutral-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-neutral-900">
              Bestellung #{order.id.slice(-6).toUpperCase()}
            </p>
            <p className="text-xs text-neutral-400">
              Aufgegeben am {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <span className={`badge ${statusColor} shrink-0`}>{statusLabel}</span>
      </div>

      {/* Positionen */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="bg-neutral-50 rounded-xl px-3 py-2 mb-3">
          {order.order_items.slice(0, 3).map((item: any) => (
            <p key={item.id} className="text-xs text-neutral-600 py-0.5">
              {item.quantity}× {item.product_name}
              {item.variant_name && <span className="text-neutral-400"> ({item.variant_name})</span>}
            </p>
          ))}
          {order.order_items.length > 3 && (
            <p className="text-xs text-neutral-400 pt-0.5">
              +{order.order_items.length - 3} weitere Artikel
            </p>
          )}
        </div>
      )}

      {/* Abholtermin */}
      <div className="flex items-center gap-2">
        <Clock size={13} className="text-neutral-400" />
        <span className="text-xs text-neutral-600">
          Abholdatum: <strong>{formatDate(order.pickup_date)}</strong>
        </span>
      </div>
    </Link>
  )
}
