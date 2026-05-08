import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ShoppingBag, Clock } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/database.types'
import OrderStatusFilter from '@/components/admin/OrderStatusFilter'
import AdminOrderFilters from '@/components/admin/AdminOrderFilters'

export const metadata = { title: 'Bestellungen' }

export default async function AdminBestellungenPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; from?: string; to?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('orders')
    .select(`
      *,
      profiles!orders_user_id_fkey(full_name, email, phone, customer_number),
      order_items(id, product_name, variant_name, quantity)
    `)
    .order('pickup_date', { ascending: true })
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams.from) {
    query = query.gte('pickup_date', searchParams.from)
  }
  if (searchParams.to) {
    query = query.lte('pickup_date', searchParams.to)
  }

  const { data: allOrders } = await query

  // Text search on customer name/email (done in JS since we can't filter on joined tables in Supabase easily)
  const searchTerm = (searchParams.q || '').toLowerCase().trim()
  const orders = searchTerm
    ? allOrders?.filter(o => {
        const name = (o.profiles?.full_name || '').toLowerCase()
        const email = (o.profiles?.email || '').toLowerCase()
        const custNo = (o.profiles?.customer_number || '').toLowerCase()
        return name.includes(searchTerm) || email.includes(searchTerm) || custNo.includes(searchTerm)
      })
    : allOrders

  const statusCounts = {
    all: allOrders?.length || 0,
    pending: allOrders?.filter((o: any) => o.status === 'pending').length || 0,
    confirmed: allOrders?.filter((o: any) => o.status === 'confirmed').length || 0,
    ready: allOrders?.filter((o: any) => o.status === 'ready').length || 0,
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Bestellungen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {orders?.length || 0} {searchTerm || searchParams.from || searchParams.to ? 'gefiltert' : 'gesamt'}
        </p>
      </div>

      {/* Status Filter */}
      <OrderStatusFilter currentStatus={searchParams.status} counts={statusCounts} />

      {/* Search + Date */}
      <AdminOrderFilters />

      {/* Liste */}
      {!orders || orders.length === 0 ? (
        <div className="card text-center py-10 text-neutral-400 mt-4">
          <ShoppingBag size={36} className="mx-auto mb-3 text-neutral-200" />
          <p className="text-sm">Keine Bestellungen gefunden.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {orders.map((order: any) => (
            <Link
              key={order.id}
              href={`/admin/bestellungen/${order.id}`}
              className="card block hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">
                    {order.profiles?.full_name || order.profiles?.email || 'Unbekannt'}
                  </p>
                  {order.profiles?.customer_number && (
                    <p className="text-xs text-neutral-400">
                      Kd.-Nr.: {order.profiles.customer_number}
                    </p>
                  )}
                  {order.profiles?.email && order.profiles?.full_name && (
                    <p className="text-xs text-neutral-400">{order.profiles.email}</p>
                  )}
                </div>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]} shrink-0`}>
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
              </div>

              {order.order_items?.slice(0, 2).map((item: any) => (
                <p key={item.id} className="text-xs text-neutral-500">
                  {item.quantity}× {item.product_name}
                  {item.variant_name && ` (${item.variant_name})`}
                </p>
              ))}
              {order.order_items?.length > 2 && (
                <p className="text-xs text-neutral-400">+{order.order_items.length - 2} weitere</p>
              )}

              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-50">
                <Clock size={12} className="text-neutral-400" />
                <span className="text-xs text-neutral-600">
                  Abholung: <strong>{formatDate(order.pickup_date)}</strong>
                </span>
                <span className="text-neutral-200 mx-1">·</span>
                <span className="text-xs text-neutral-400">
                  #{order.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
