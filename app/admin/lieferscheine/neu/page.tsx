import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CreateDeliveryNoteForm from '@/components/lieferschein/CreateDeliveryNoteForm'

export const metadata = { title: 'Neuer Lieferschein' }

export default async function NewDeliveryNotePage() {
  let customers: any[] = []
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,customer_number&order=full_name.asc`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      cache: 'no-store',
    })
    if (res.ok) customers = await res.json()
  } catch {
    customers = []
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/lieferscheine" className="text-neutral-400 hover:text-neutral-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Neuer Lieferschein</h1>
          <p className="text-sm text-neutral-500">Wird sofort im Kundenkonto sichtbar</p>
        </div>
      </div>
      <CreateDeliveryNoteForm customers={customers} />
    </div>
  )
}
