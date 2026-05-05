import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import OfferForm from '@/components/admin/OfferForm'

export default async function EditAngebotPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: offer } = await supabase.from('offers').select('*').eq('id', params.id).single()
  if (!offer) notFound()

  return (
    <div className="px-4 py-5">
      <Link href="/admin/angebote" className="inline-flex items-center gap-1.5 text-sm text-brand-500 font-medium mb-5">
        <ArrowLeft size={16} />
        Zurück
      </Link>
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Angebot bearbeiten</h1>
      <OfferForm offer={offer} />
    </div>
  )
}
