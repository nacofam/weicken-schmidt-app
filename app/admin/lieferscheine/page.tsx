import Link from 'next/link'
import { FileText, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'

export const metadata = { title: 'Lieferscheine' }

const STATUS_CONFIG = {
  sent:      { label: 'Ausstehend',     color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  signed:    { label: 'Unterschrieben', color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  cancelled: { label: 'Storniert',      color: 'bg-red-100 text-red-800',       icon: XCircle },
}

export default async function AdminLieferscheinePage() {
  let notes: any[] = []
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?select=*,profiles!delivery_notes_user_id_fkey(full_name,email,customer_number)&order=created_at.desc`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    })
    if (res.ok) notes = await res.json()
  } catch {
    notes = []
  }

  const open   = notes.filter(n => n.status === 'sent')
  const signed = notes.filter(n => n.status === 'signed')

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Lieferscheine</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {open.length} ausstehend · {signed.length} unterschrieben
          </p>
        </div>
        <Link
          href="/admin/lieferscheine/neu"
          className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 transition-colors"
        >
          <Plus size={14} />
          Neu
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={40} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-4">Noch keine Lieferscheine</p>
          <Link
            href="/admin/lieferscheine/neu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            <Plus size={15} />
            Ersten Lieferschein erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Ausstehend ({open.length})
              </h2>
              <div className="space-y-2">
                {open.map((note: any) => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
          {signed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Unterschrieben ({signed.length})
              </h2>
              <div className="space-y-2 opacity-75">
                {signed.map((note: any) => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function NoteCard({ note }: { note: any }) {
  const config = STATUS_CONFIG[note.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.sent
  const StatusIcon = config.icon
  const itemCount = Array.isArray(note.items) ? note.items.length : 0
  const deliveryDate = note.delivery_date
    ? new Date(note.delivery_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '–'

  return (
    <Link
      href={`/admin/lieferscheine/${note.id}`}
      className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow"
    >
      <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
        <FileText size={18} className="text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-neutral-900">{note.note_number}</p>
          <span className={`badge text-[10px] ${config.color}`}>
            <StatusIcon size={10} className="inline mr-0.5" />
            {config.label}
          </span>
        </div>
        <p className="text-xs text-neutral-500 truncate mt-0.5">
          {note.profiles?.full_name || note.profiles?.email}
          {note.profiles?.customer_number && ` · Kd. ${note.profiles.customer_number}`}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">{deliveryDate} · {itemCount} Artikel</p>
      </div>
    </Link>
  )
}
