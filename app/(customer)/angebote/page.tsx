import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { Tag, Calendar } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils'

export const metadata = { title: 'Angebote' }

export default async function AngebotePage() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('active', true)
    .lte('valid_from', today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order('sort_order')

  return (
    <div className="px-4 py-5">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Aktuelle Angebote</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Entdecken Sie unsere aktuellen Aktionen & Sonderpreise
        </p>
      </div>

      {/* Angebote */}
      {!offers || offers.length === 0 ? (
        <div className="card text-center py-12">
          <Tag size={40} className="text-neutral-200 mx-auto mb-4" />
          <p className="font-medium text-neutral-600 mb-1">Aktuell keine Angebote</p>
          <p className="text-sm text-neutral-400">
            Schau bald wieder vorbei – wir haben regelmäßig neue Aktionen.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => (
            <article key={offer.id} className="card overflow-hidden hover:shadow-card-hover transition-shadow">
              {/* Bild (falls vorhanden) */}
              {offer.image_url && (
                <div className="relative w-full h-40 -mx-5 -mt-5 mb-4" style={{ margin: '-20px -20px 16px -20px', width: 'calc(100% + 40px)' }}>
                  <Image
                    src={offer.image_url}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                  {offer.badge_text && (
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-brand-500 text-white shadow-sm px-3 py-1 text-xs font-bold">
                        {offer.badge_text}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Badge (falls kein Bild) */}
                  {!offer.image_url && offer.badge_text && (
                    <span className="badge bg-brand-100 text-brand-700 mb-2">
                      {offer.badge_text}
                    </span>
                  )}

                  <h2 className="font-semibold text-neutral-900 mb-1">{offer.title}</h2>

                  {offer.description && (
                    <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                      {offer.description}
                    </p>
                  )}

                  {/* Preis */}
                  {(offer.offer_price || offer.original_price) && (
                    <div className="flex items-baseline gap-2">
                      {offer.offer_price && (
                        <span className="text-xl font-bold text-brand-600">
                          {formatPrice(offer.offer_price)}
                        </span>
                      )}
                      {offer.original_price && (
                        <span className="text-sm text-neutral-400 line-through">
                          {formatPrice(offer.original_price)}
                        </span>
                      )}
                      {offer.offer_price && offer.original_price && (
                        <span className="badge bg-green-100 text-green-700 text-xs">
                          {Math.round((1 - offer.offer_price / offer.original_price) * 100)}% gespart
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Gültigkeitsdatum */}
              {offer.valid_until && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-neutral-50">
                  <Calendar size={13} className="text-neutral-400" />
                  <span className="text-xs text-neutral-400">
                    Gültig bis {formatDate(offer.valid_until)}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Info-Footer */}
      <div className="mt-6 bg-brand-50 rounded-2xl p-4">
        <p className="text-xs text-brand-700 text-center">
          💡 Alle Preise gelten solange der Vorrat reicht.
          Bei Fragen helfen wir gerne persönlich weiter.
        </p>
      </div>
    </div>
  )
}
