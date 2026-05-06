import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Meine Lieferscheine' }

const STATUS_CONFIG = {
  sent:      { label: 'Unterschrift erforderlich', color: 'bg-amber-100 text-amber-800', icon: Clock },
  signed:    { label: 'Unterschrieben',             color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Storniert',                  color: 'bg-neutral-100 text-neutral-500', icon: FileText },
}

export default async function CustomerLieferscheinePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let notes: any[] = []
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?user_id=eq.${user.id}&select=*&order=created_at.desc`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    })
    if (res.ok) notes = await res.json()
  } catch { notes = [] }

  const pending = notes.filter(n => n.status === 'sent')
  const done    = notes.filter(n => n.status !== 'sent')

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Lieferscheine</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {pending.length > 0
            ? `${pending.length} ${pending.length === 1 ? 'Lieferschein wartet' : 'Lieferscheine warten'} auf Unterschrift`
            : 'Alle Lieferscheine'}
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={40} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Noch keine Lieferscheine vorhanden</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Unterschrift erforderlich
              </h2>
              <div className="space-y-2">
                {pending.map((note: any) => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Abgeschlossen
              </h2>
              <div className="space-y-2 opacity-75">
                {done.map((note: any) => <NoteCard key={note.id} note={note} />)}
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
  const deliveryDate = note.delivery_date ? new Date(note.delivery_date).toLocaleDateString('de-DE') : '–'

  return (
    <Link href={`/lieferscheine/${note.id}`} className="card flex items-center gap-3 hover:shadow-card-hover transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${note.status === 'sent' ? 'bg-amber-100' : 'bg-green-100'}`}>
        <FileText size={18} className={note.status === 'sent' ? 'text-amber-600' : 'text-green-600'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-neutral-900">{note.note_number}</p>
          <span className={`badge text-[10px] ${config.color}`}>
            <StatusIcon size={9} className="inline mr-0.5" />{config.label}
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">{deliveryDate} · {itemCount} Artikel</p>
      </div>
      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
    </Link>
  )
}
