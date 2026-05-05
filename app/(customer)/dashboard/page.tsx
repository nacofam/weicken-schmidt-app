import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPrice } from '@/lib/utils'
import { ShoppingBag, Tag, Palette, BookOpen, ChevronRight, Clock, Package } from 'lucide-react'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/database.types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Letzte 3 Bestellungen
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Aktuelle Angebote (max 2 für Preview)
  const today = new Date().toISOString().split('T')[0]
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('active', true)
    .lte('valid_from', today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order('sort_order')
    .limit(2)

  const firstName = profile?.full_name?.split(' ')[0] || 'Hallo'

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Begrüßung */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">
          Hallo, {firstName}! 👋
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Was können wir heute für dich tun?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/vorbestellungen/neu" className="card hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-200 transition-colors">
            <ShoppingBag size={20} className="text-brand-600" />
          </div>
          <p className="font-semibold text-sm text-neutral-900">Vorbestellen</p>
          <p className="text-xs text-neutral-500 mt-0.5">Produkt & Termin wählen</p>
        </Link>

        <Link href="/angebote" className="card hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
            <Tag size={20} className="text-blue-600" />
          </div>
          <p className="font-semibold text-sm text-neutral-900">Angebote</p>
          <p className="text-xs text-neutral-500 mt-0.5">Aktuelle Aktionen</p>
        </Link>

        <Link href="/farbmischung" className="card hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
            <Palette size={20} className="text-purple-600" />
          </div>
          <p className="font-semibold text-sm text-neutral-900">Farbmischung</p>
          <p className="text-xs text-neutral-500 mt-0.5">Wunschfarbe anfragen</p>
        </Link>

        <Link href="/kataloge" className="card hover:shadow-card-hover transition-shadow group">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
            <BookOpen size={20} className="text-green-600" />
          </div>
          <p className="font-semibold text-sm text-neutral-900">Kataloge</p>
          <p className="text-xs text-neutral-500 mt-0.5">Digital durchblättern</p>
        </Link>
      </div>

      {/* Aktuelle Angebote Preview */}
      {offers && offers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-neutral-900">Aktuelle Angebote</h2>
            <Link href="/angebote" className="text-xs text-brand-500 font-medium flex items-center gap-1">
              Alle <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {offers.map(offer => (
              <div key={offer.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
                  <Tag size={20} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-neutral-900 truncate">{offer.title}</p>
                  {offer.offer_price && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-brand-600 font-semibold text-sm">
                        {formatPrice(offer.offer_price)}
                      </span>
                      {offer.original_price && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(offer.original_price)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {offer.badge_text && (
                  <span className="badge bg-brand-100 text-brand-700 shrink-0">
                    {offer.badge_text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Letzte Bestellungen */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-neutral-900">Meine Bestellungen</h2>
          <Link href="/vorbestellungen" className="text-xs text-brand-500 font-medium flex items-center gap-1">
            Alle <ChevronRight size={12} />
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="card text-center py-8">
            <Package size={32} className="text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 mb-3">Noch keine Bestellungen</p>
            <Link href="/vorbestellungen/neu" className="btn-primary text-xs py-2 px-4">
              Erste Vorbestellung
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                href={`/vorbestellungen/${order.id}`}
                className="card flex items-center gap-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag size={18} className="text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-neutral-900">
                    Bestellung vom {formatDate(order.created_at)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={12} className="text-neutral-400" />
                    <span className="text-xs text-neutral-500">
                      Abholung: {formatDate(order.pickup_date)}
                    </span>
                  </div>
                </div>
                <span className={`badge shrink-0 ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Öffnungszeiten & Kontakt */}
      <div className="bg-neutral-100 rounded-2xl p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">Öffnungszeiten</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-600">
            <span className="font-medium">Mo – Do</span><span>07:00 – 16:30 Uhr</span>
            <span className="font-medium">Freitag</span><span>07:00 – 15:00 Uhr</span>
            <span className="font-medium text-neutral-400">Sa + So</span><span className="text-neutral-400">geschlossen</span>
          </div>
        </div>
        <div className="border-t border-neutral-200 pt-3">
          <p className="text-xs text-neutral-500">
            📍 Brauckstraße 43, 58454 Witten
            <br />
            📞 <a href="tel:+4923029732-0" className="text-brand-600 font-medium">+49 2302 9732-0</a>
            &nbsp;·&nbsp;
            ✉️ <a href="mailto:witten@weicken-schmidt.de" className="text-brand-600 font-medium">witten@weicken-schmidt.de</a>
          </p>
        </div>
      </div>
    </div>
  )
}
