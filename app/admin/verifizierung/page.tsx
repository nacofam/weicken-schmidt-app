import { createAdminClient } from '@/lib/supabase/server'
import { ShieldCheck, ShieldOff, ShieldAlert, Clock, QrCode } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Image from 'next/image'
import {
  VERIFICATION_CODE_STATUS_LABELS,
  VERIFICATION_CODE_STATUS_COLORS,
  type VerificationCodeStatus,
} from '@/types/database.types'
import GenerateVerificationCode from '@/components/admin/GenerateVerificationCode'
import RevokeVerificationCode from '@/components/admin/RevokeVerificationCode'

export const metadata = { title: 'Verifizierung' }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://weicken-schmidt-app.vercel.app'

export default async function AdminVerifizierungPage() {
  const supabase = createAdminClient()

  const { data: codes } = await supabase
    .from('verification_codes')
    .select(`
      *,
      activated_profile:profiles!verification_codes_activated_by_fkey(
        full_name, email, customer_number
      )
    `)
    .order('created_at', { ascending: false })

  const unused = codes?.filter(c => c.status === 'unused') || []
  const active = codes?.filter(c => c.status === 'active') || []
  const revoked = codes?.filter(c => c.status === 'revoked') || []

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Verifizierung</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {active.length} Kunden verifiziert · {unused.length} Codes offen
          </p>
        </div>
        <GenerateVerificationCode />
      </div>

      {/* Erklärungs-Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
        <p className="text-xs text-purple-800 leading-relaxed">
          <strong>So funktioniert's:</strong> Generiere einen Code und gib ihn
          persönlich an einen Stammkunden weiter (im Laden oder per Telefon).
          Der Kunde gibt den Code in der App ein und erhält dauerhaften Zugang
          zum Farbmischservice. Du kannst den Zugang jederzeit entziehen.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <ShieldCheck size={16} className="text-green-600" />
          </div>
          <p className="text-xl font-bold text-neutral-900">{active.length}</p>
          <p className="text-xs text-neutral-500">Verifiziert</p>
        </div>
        <div className="card text-center">
          <div className="w-8 h-8 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <Clock size={16} className="text-neutral-500" />
          </div>
          <p className="text-xl font-bold text-neutral-900">{unused.length}</p>
          <p className="text-xs text-neutral-500">Offen</p>
        </div>
        <div className="card text-center">
          <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <ShieldOff size={16} className="text-red-500" />
          </div>
          <p className="text-xl font-bold text-neutral-900">{revoked.length}</p>
          <p className="text-xs text-neutral-500">Gesperrt</p>
        </div>
      </div>

      {/* Aktive Codes */}
      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Verifizierte Kunden ({active.length})
          </h2>
          <div className="space-y-2">
            {active.map((code: any) => (
              <CodeCard key={code.id} code={code} showRevoke appUrl={APP_URL} />
            ))}
          </div>
        </section>
      )}

      {/* Offene Codes */}
      {unused.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Noch nicht eingelöst ({unused.length})
          </h2>
          <div className="space-y-2">
            {unused.map((code: any) => (
              <CodeCard key={code.id} code={code} showRevoke={false} showQr appUrl={APP_URL} />
            ))}
          </div>
        </section>
      )}

      {/* Gesperrte Codes */}
      {revoked.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Gesperrt ({revoked.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {revoked.map((code: any) => (
              <CodeCard key={code.id} code={code} showRevoke={false} appUrl={APP_URL} />
            ))}
          </div>
        </section>
      )}

      {(!codes || codes.length === 0) && (
        <div className="card text-center py-10">
          <ShieldAlert size={36} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Noch keine Codes erstellt.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Klicke auf „Code generieren" oben rechts.
          </p>
        </div>
      )}
    </div>
  )
}

function CodeCard({
  code,
  showRevoke,
  showQr = false,
  appUrl,
}: {
  code: any
  showRevoke: boolean
  showQr?: boolean
  appUrl: string
}) {
  const statusColor = VERIFICATION_CODE_STATUS_COLORS[code.status as VerificationCodeStatus]
  const statusLabel = VERIFICATION_CODE_STATUS_LABELS[code.status as VerificationCodeStatus]
  const customer = code.activated_profile

  const verifyUrl = `${appUrl}/farbmischung?code=${encodeURIComponent(code.code)}`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(verifyUrl)}`

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono font-bold text-sm tracking-wider text-neutral-800">
            {code.code}
          </p>
          {customer && (
            <p className="text-xs text-neutral-600 mt-0.5">
              {customer.full_name || customer.email}
              {customer.customer_number && (
                <span className="text-neutral-400"> · KD-{customer.customer_number}</span>
              )}
            </p>
          )}
          {code.notes && (
            <p className="text-xs text-neutral-400 italic mt-0.5">„{code.notes}"</p>
          )}
        </div>
        <span className={`badge shrink-0 ${statusColor}`}>{statusLabel}</span>
      </div>

      {/* QR Code für ungenutzte Codes */}
      {showQr && (
        <div className="bg-neutral-50 rounded-xl p-3 flex items-center gap-4">
          <div className="bg-white rounded-xl p-1.5 shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrApiUrl}
              alt={`QR-Code für ${code.code}`}
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <QrCode size={13} className="text-brand-500" />
              <p className="text-xs font-semibold text-neutral-700">QR-Code für Kunden</p>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Zeige diesen Code dem Kunden. Er scannt ihn mit der Kamera und wird direkt zur Verifizierung weitergeleitet.
            </p>
          </div>
        </div>
      )}

      {/* Zeitstempel */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-xs text-neutral-400">
          Erstellt: {formatDateTime(code.created_at)}
        </span>
        {code.activated_at && (
          <span className="text-xs text-green-600">
            Eingelöst: {formatDateTime(code.activated_at)}
          </span>
        )}
        {code.revoked_at && (
          <span className="text-xs text-red-500">
            Gesperrt: {formatDateTime(code.revoked_at)}
          </span>
        )}
      </div>

      {showRevoke && (
        <RevokeVerificationCode
          codeId={code.id}
          codeName={code.code}
          customerName={customer?.full_name || customer?.email}
        />
      )}
    </div>
  )
}
