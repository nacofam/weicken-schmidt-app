import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, User } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/database.types'
import AdminOrderActions from '@/components/admin/AdminOrderActions'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      profiles!orders_user_id_fkey(full_name, email, phone, customer_number),
      order_items(*)
    `)
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  return (
    <div className="px-4 py-5 space-y-4">
      <Link href="/admin/bestellungen" className="inline-flex items-center gap-1.5 text-sm text-brand-500 font-medium">
        <ArrowLeft size={16} />
        Alle Bestellungen
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-xs text-neutral-400">
            Eingegangen: {formatDateTime(order.created_at)}
          </p>
        </div>
        <span className={`badge ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
      </div>

      {/* Kundendaten */}
      <div className="card">
        <h2 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
          <User size={16} className="text-neutral-400" />
          Kundendaten
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-neutral-800 flex-1">
              {order.profiles?.full_name || 'Name unbekannt'}
            </p>
            {order.profiles?.customer_number && (
              <span className="badge bg-neutral-100 text-neutral-600">
                Kd. {order.profiles.customer_number}
              </span>
            )}
          </div>
          {order.profiles?.email && (
            <a href={`mailto:${order.profiles.email}`} className="flex items-center gap-2 text-sm text-brand-600">
              <Mail size={14} className="text-neutral-400" />
              {order.profiles.email}
            </a>
          )}
          {order.profiles?.phone && (
            <a href={`tel:${order.profiles.phone}`} className="flex items-center gap-2 text-sm text-brand-600">
              <Phone size={14} className="text-neutral-400" />
              {order.profiles.phone}
            </a>
          )}
        </div>
      </div>

      {/* Abholtermin */}
      <div className="card bg-brand-50 border-brand-100">
        <p className="text-xs font-semibold text-brand-700 mb-1">Abholdatum</p>
        <p className="text-lg font-bold text-brand-800">
          {formatDate(order.pickup_date, "EEEE, dd. MMMM yyyy")}
        </p>
      </div>

      {/* Artikel */}
      <div className="card">
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
                  <p className="text-xs text-neutral-400 italic">"{item.notes}"</p>
                )}
              </div>
              <span className="font-bold text-neutral-800 text-sm">{item.quantity}×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kundennotiz */}
      {order.notes && (
        <div className="card bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-600 mb-1">Kundennotiz</p>
          <p className="text-sm text-neutral-600">{order.notes}</p>
        </div>
      )}

      {/* Admin-Aktionen */}
      <AdminOrderActions order={order} />
    </div>
  )
}
