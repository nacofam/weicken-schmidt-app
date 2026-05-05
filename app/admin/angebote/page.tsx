import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Tag, Eye, EyeOff } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils'
import ToggleOfferButton from '@/components/admin/ToggleOfferButton'

export const metadata = { title: 'Angebote' }

export default async function AdminAngebotePage() {
  const supabase = createClient()

  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Angebote</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {offers?.filter(o => o.active).length || 0} aktiv
          </p>
        </div>
        <Link href="/admin/angebote/neu" className="btn-primary text-sm">
          <Plus size={15} />
          Neu
        </Link>
      </div>

      {!offers || offers.length === 0 ? (
        <div className="card text-center py-10">
          <Tag size={36} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-4">Noch keine Angebote angelegt.</p>
          <Link href="/admin/angebote/neu" className="btn-primary text-sm">
            Erstes Angebot erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => {
            const isExpired = offer.valid_until && offer.valid_until < today
            const isNotStarted = offer.valid_from > today

            return (
              <div key={offer.id} className={`card ${!offer.active || isExpired ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm text-neutral-900">{offer.title}</p>
                      {offer.badge_text && (
                        <span className="badge bg-brand-100 text-brand-700 text-xs">
                          {offer.badge_text}
                        </span>
                      )}
                      {isExpired && (
                        <span className="badge bg-red-100 text-red-600 text-xs">Abgelaufen</span>
                      )}
                      {isNotStarted && (
                        <span className="badge bg-yellow-100 text-yellow-700 text-xs">Geplant</span>
                      )}
                    </div>

                    {/* Preise */}
                    <div className="flex items-baseline gap-2 mb-1">
                      {offer.offer_price && (
                        <span className="text-brand-600 font-bold text-sm">
                          {formatPrice(offer.offer_price)}
                        </span>
                      )}
                      {offer.original_price && (
                        <span className="text-xs text-neutral-400 line-through">
                          {formatPrice(offer.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Datum */}
                    <p className="text-xs text-neutral-400">
                      {formatDate(offer.valid_from)}
                      {offer.valid_until ? ` – ${formatDate(offer.valid_until)}` : ' (kein Ablaufdatum)'}
                    </p>
                  </div>

                  {/* Aktionen */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ToggleOfferButton id={offer.id} active={offer.active} />
                    <Link
                      href={`/admin/angebote/${offer.id}`}
                      className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    >
                      <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
