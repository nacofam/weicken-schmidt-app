import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingBag, Tag, Users, Package, TrendingUp, Clock, Palette, ShieldCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/database.types'

export const metadata = { title: 'Übersicht' }

export default async function AdminOverviewPage() {
  const supabase = createClient()

  // Statistiken laden
  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: readyOrders },
    { count: totalCustomers },
    { data: recentOrders },
    { count: activeOffers },
    { count: pendingColorRequests },
    { count: verifiedCustomers },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'ready'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders')
      .select(`*, profiles!orders_user_id_fkey(full_name, email)`)
      .in('status', ['pending', 'confirmed', 'ready'])
      .order('pickup_date', { ascending: true })
      .limit(5),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('color_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_farbmischung_verified', true),
  ])

  const stats = [
    { label: 'Bestellungen gesamt', value: totalOrders || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', href: '/admin/bestellungen' },
    { label: 'Ausstehend', value: pendingOrders || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600', href: '/admin/bestellungen?status=pending' },
    { label: 'Abholbereit', value: readyOrders || 0, icon: Package, color: 'bg-green-50 text-green-600', href: '/admin/bestellungen?status=ready' },
    { label: 'Kunden registriert', value: totalCustomers || 0, icon: Users, color: 'bg-purple-50 text-purple-600', href: '/admin/kunden' },
    { label: 'Aktive Angebote', value: activeOffers || 0, icon: Tag, color: 'bg-brand-50 text-brand-600', href: '/admin/angebote' },
    { label: 'Farbanfragen offen', value: pendingColorRequests || 0, icon: Palette, color: 'bg-purple-50 text-purple-600', href: '/admin/farbanfragen' },
    { label: 'Stammkunden verifiziert', value: verifiedCustomers || 0, icon: ShieldCheck, color: 'bg-green-50 text-green-600', href: '/admin/verifizierung' },
  ]

  return (
    <div className="px-4 py-5 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Guten Morgen! 👋</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Hier ist deine Übersicht für heute.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card hover:shadow-card-hover transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}

        {/* Trending / Hinweis */}
        <div className="card bg-brand-50 border-brand-100">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center mb-2.5">
            <TrendingUp size={18} className="text-brand-600" />
          </div>
          <p className="text-xs font-semibold text-brand-700">App wächst!</p>
          <p className="text-xs text-brand-600 mt-0.5">
            {totalCustomers || 0} Kunden registriert
          </p>
        </div>
      </div>

      {/* Nächste Abholungen */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-neutral-900">Nächste Abholungen</h2>
          <Link href="/admin/bestellungen" className="text-xs text-brand-500 font-medium">
            Alle →
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="card text-center py-6 text-sm text-neutral-400">
            Keine ausstehenden Bestellungen 🎉
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/bestellungen/${order.id}`}
                className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-neutral-900 truncate">
                    {order.profiles?.full_name || order.profiles?.email || 'Unbekannt'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} className="text-neutral-400" />
                    <span className="text-xs text-neutral-500">
                      Abholung: {formatDate(order.pickup_date)}
                    </span>
                  </div>
                </div>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]} shrink-0`}>
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="font-semibold text-neutral-900 mb-3">Schnellzugriff</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/angebote/neu" className="btn-primary text-sm justify-center">
            <Tag size={15} />
            Angebot erstellen
          </Link>
          <Link href="/admin/produkte/neu" className="btn-secondary text-sm justify-center">
            <Package size={15} />
            Produkt hinzufügen
          </Link>
        </div>
      </section>
    </div>
  )
}
