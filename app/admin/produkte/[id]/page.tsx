import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProduktPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single()
  if (!product) notFound()

  return (
    <div className="px-4 py-5">
      <Link href="/admin/produkte" className="inline-flex items-center gap-1.5 text-sm text-brand-500 font-medium mb-5">
        <ArrowLeft size={16} />
        Zurück
      </Link>
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Produkt bearbeiten</h1>
      <ProductForm product={product} />
    </div>
  )
}
