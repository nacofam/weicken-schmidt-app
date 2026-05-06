import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, User, Package } from 'lucide-react'

export const metadata = { title: 'Lieferschein' }

export default async function AdminDeliveryNoteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let note: any = null
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?id=eq.${params.id}&select=*,profiles!delivery_notes_user_id_fkey(full_name,email,phone,customer_number)`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    })
    if (res.ok) { const data = await res.json(); note = data?.[0] || null }
  } catch { note = null }

  if (!note) notFound()

  const isSigned = note.status === 'signed'
  const deliveryDate = note.delivery_date
    ? new Date(note.delivery_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '–'
  const signedAt = note.signed_at
    ? new Date(note.signed_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  const items: any[] = Array.isArray(note.items) ? note.items : []
  const total = items.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0)

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/lieferscheine" className="text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">{note.note_number}</h1>
            <span className={`badge ${isSigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {isSigned ? <><CheckCircle size={10} className="inline mr-1" />Unterschrieben</> : <><Clock size={10} className="inline mr-1" />Ausstehend</>}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">Lieferdatum: {deliveryDate}</p>
        </div>
      </div>

      <div className="card space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <User size={14} className="text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Kunde</p>
        </div>
        <p className="font-semibold text-sm text-neutral-900">{note.profiles?.full_name || '–'}</p>
        <p className="text-xs text-neutral-500">{note.profiles?.email}</p>
        {note.profiles?.customer_number && <p className="text-xs text-neutral-400">Kundennummer: {note.profiles.customer_number}</p>}
        {note.profiles?.phone && <p className="text-xs text-neutral-400">Tel: {note.profiles.phone}</p>}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Package size={14} className="text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Artikel</p>
        </div>
        {items.length === 0 ? <p className="text-xs text-neutral-400">Keine Artikel</p> : (
          <div className="space-y-2">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.quantity} {item.unit}{item.unit_price ? ` × ${Number(item.unit_price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}` : ''}</p>
                </div>
                {item.unit_price && <p className="text-sm font-semibold text-neutral-900 shrink-0">{(item.quantity * item.unit_price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>}
              </div>
            ))}
            {total > 0 && (
              <div className="border-t border-neutral-100 pt-2 flex justify-between">
                <span className="text-xs font-semibold text-neutral-600">Gesamt</span>
                <span className="text-sm font-bold text-neutral-900">{total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {note.notes && <div className="card"><p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Bemerkungen</p><p className="text-sm text-neutral-600">{note.notes}</p></div>}

      {isSigned && note.signature_data && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={14} className="text-green-600" />
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Unterschrift</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={note.signature_data} alt="Unterschrift" className="max-h-28 mx-auto" />
          </div>
          {signedAt && <p className="text-xs text-neutral-400 mt-2 text-center">Unterschrieben am {signedAt}</p>}
        </div>
      )}

      {!isSigned && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">Noch nicht unterschrieben</p>
          <p className="text-xs text-amber-600 mt-1">Der Kunde kann diesen Lieferschein in seinem Konto unterschreiben.</p>
        </div>
      )}
    </div>
  )
}
