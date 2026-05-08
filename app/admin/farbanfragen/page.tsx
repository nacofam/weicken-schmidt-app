import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Palette, Phone, Mail } from 'lucide-react'
import { COLOR_REQUEST_STATUS_LABELS } from '@/types/database.types'
import UpdateColorRequestStatus from '@/components/admin/UpdateColorRequestStatus'

export const metadata = { title: 'Farbanfragen' }

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  ready:      'bg-green-100 text-green-800',
  picked_up:  'bg-neutral-100 text-neutral-600',
  cancelled:  'bg-red-100 text-red-800',
}

export default async function AdminFarbanfragenPage() {
  // Direkte REST API mit Service Role Key – umgeht RLS und Edge Runtime Probleme
  let requests: any[] = []
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/color_requests?select=*,profiles!color_requests_user_id_fkey(full_name,email,phone,customer_number)&order=created_at.desc`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    })
    if (res.ok) {
      requests = await res.json()
    }
  } catch {
    requests = []
  }

  const open = requests.filter(r => !['picked_up', 'cancelled'].includes(r.status))
  const done = requests.filter(r => ['picked_up', 'cancelled'].includes(r.status))

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Farbanfragen</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {open.length} offen · {done.length} abgeschlossen
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-10">
          <Palette size={36} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Noch keine Farbanfragen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Offen ({open.length})</h2>
              <div className="space-y-3">
                {open.map((req: any) => <ColorRequestCard key={req.id} request={req} />)}
              </div>
            </section>
          )}
          {done.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Abgeschlossen</h2>
              <div className="space-y-3 opacity-70">
                {done.map((req: any) => <ColorRequestCard key={req.id} request={req} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function ColorRequestCard({ request }: { request: any }) {
  const statusColor = STATUS_COLORS[request.status] || 'bg-neutral-100 text-neutral-600'
  const statusLabel = COLOR_REQUEST_STATUS_LABELS[request.status as keyof typeof COLOR_REQUEST_STATUS_LABELS]

  return (
    <div className="card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm text-neutral-900">
            {request.profiles?.full_name || request.profiles?.email}
          </p>
          <p className="text-xs text-neutral-400">{formatDateTime(request.created_at)}</p>
        </div>
        <span className={`badge shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>

      {/* Farbe */}
      <div className="bg-purple-50 rounded-xl p-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-700 w-20">System:</span>
          <span className="text-xs text-purple-800 font-medium">{request.color_system}</span>
        </div>
        {request.color_code && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-700 w-20">Farbcode:</span>
            <span className="text-xs text-purple-800 font-mono font-bold">{request.color_code}</span>
          </div>
        )}
        {request.color_name && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-700 w-20">Farbname:</span>
            <span className="text-xs text-purple-800">{request.color_name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-700 w-20">Basis:</span>
          <span className="text-xs text-purple-800">{request.base_type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-700 w-20">Menge:</span>
          <span className="text-xs text-purple-800 font-bold">{request.quantity_liters} Liter</span>
        </div>
        {request.desired_pickup_date && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-700 w-20">Wunschtermin:</span>
            <span className="text-xs text-purple-800">{formatDate(request.desired_pickup_date)}</span>
          </div>
        )}
      </div>

      {/* Kundennotiz */}
      {request.notes && (
        <div className="bg-neutral-50 rounded-xl px-3 py-2">
          <p className="text-xs text-neutral-500 italic">"{request.notes}"</p>
        </div>
      )}

      {/* Kontakt */}
      <div className="flex gap-3">
        {request.profiles?.email && (
          <a href={`mailto:${request.profiles.email}`} className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
            <Mail size={12} /> {request.profiles.email}
          </a>
        )}
        {request.profiles?.phone && (
          <a href={`tel:${request.profiles.phone}`} className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline">
            <Phone size={12} /> {request.profiles.phone}
          </a>
        )}
      </div>

      {/* Status-Update */}
      {!['picked_up', 'cancelled'].includes(request.status) && (
        <UpdateColorRequestStatus requestId={request.id} currentStatus={request.status} />
      )}
    </div>
  )
}
