import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Users, Phone, Mail } from 'lucide-react'
import AssignCustomerNumber from '@/components/admin/AssignCustomerNumber'

export const metadata = { title: 'Kunden' }

export default async function AdminKundenPage() {
  const supabase = createClient()

  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Kunden</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {customers?.length || 0} registrierte Kunden
        </p>
      </div>

      {!customers || customers.length === 0 ? (
        <div className="card text-center py-10">
          <Users size={36} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Noch keine Kunden registriert.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(customer => (
            <div key={customer.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900">
                    {customer.full_name || '(Kein Name)'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Registriert: {formatDate(customer.created_at)}
                  </p>
                </div>
                {customer.customer_number && (
                  <span className="badge bg-neutral-100 text-neutral-600 shrink-0">
                    Kd. {customer.customer_number}
                  </span>
                )}
              </div>

              <div className="space-y-1 mb-3">
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-xs text-brand-600">
                    <Mail size={12} className="text-neutral-400" />
                    {customer.email}
                  </a>
                )}
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-xs text-brand-600">
                    <Phone size={12} className="text-neutral-400" />
                    {customer.phone}
                  </a>
                )}
              </div>

              {/* Kundennummer zuweisen */}
              <AssignCustomerNumber
                customerId={customer.id}
                currentNumber={customer.customer_number}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
