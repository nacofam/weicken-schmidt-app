import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, FileText, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'
import SignAndConfirm from '@/components/lieferschein/SignAndConfirm'

export const metadata = { title: 'Lieferschein' }

export default async function CustomerDeliveryNoteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Lieferschein laden
  let note: any = null
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?id=eq.${params.id}&user_id=eq.${user.id}&select=*`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      note = data?.[0] || null
    }
  } catch {
    note = null
  }

  if (!note) notFound()

  const isSigned = note.status === 'signed'
  const deliveryDate = note.delivery_date
    ? new Date(note.delivery_date).toLocaleDateString('de-DE', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : '–'
  const signedAt = note.signed_at
    ? new Date(note.signed_at).toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  const items: any[] = Array.isArray(note.items) ? note.items : []
  const total = items.reduce((sum: number, item: any) => {
    return sum + ((item.quantity || 0) * (item.unit_price || 0))
  }, 0)

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/lieferscheine" className="text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-neutral-900">{note.note_number}</h1>
            {isSigned ? (
              <span className="badge bg-green-100 text-green-800">
                <CheckCircle size={10} className="inline mr-1" />
                Unterschrieben
              </span>
            ) : (
              <span className="badge bg-amber-100 text-amber-800">
                Unterschrift erforderlich
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">{deliveryDate}</p>
        </div>
      </div>

      {/* Absender */}
      <div className="bg-neutral-800 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
          Weicken &amp; Schmidt, Witten
        </p>
        <p className="text-sm text-neutral-200">Brauckstraße 43 · 58454 Witten</p>
        <p className="text-xs text-neutral-400 mt-1">Tel: +49 2302 9732-0</p>
      </div>

      {/* Artikel */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Package size={14} className="text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Gelieferte Artikel
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-neutral-400">Keine Artikel eingetragen</p>
        ) : (
          <div className="divide-y divide-neutral-50">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-start justify-between gap-2 py-2 first:pt-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                {item.unit_price ? (
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      {(item.quantity * item.unit_price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {Number(item.unit_price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / {item.unit}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
            {total > 0 && (
              <div className="flex justify-between pt-2">
                <span className="text-sm font-semibold text-neutral-700">Gesamt</span>
                <span className="text-sm font-bold text-neutral-900">
                  {total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notizen */}
      {note.notes && (
        <div className="bg-neutral-50 rounded-xl px-4 py-3">
          <p className="text-xs text-neutral-500 italic">{note.notes}</p>
        </div>
      )}

      {/* Unterschrift */}
      {isSigned ? (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-600" />
            <p className="text-sm font-semibold text-green-700">Lieferschein unterschrieben</p>
          </div>
          {note.signature_data && (
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={note.signature_data} alt="Unterschrift" className="max-h-24 mx-auto" />
            </div>
          )}
          {signedAt && (
            <p className="text-xs text-neutral-400 text-center mt-2">
              Unterschrieben am {signedAt}
            </p>
          )}
        </div>
      ) : (
        <div className="card space-y-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900 mb-1">
              Bitte unterschreiben Sie hier
            </p>
            <p className="text-xs text-neutral-500">
              Mit Ihrer Unterschrift bestätigen Sie den Empfang der oben aufgeführten Waren.
            </p>
          </div>
          <SignAndConfirm deliveryNoteId={note.id} />
        </div>
      )}
    </div>
  )
}
