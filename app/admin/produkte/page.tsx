import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Package, Upload } from 'lucide-react'
import ToggleProductButton from '@/components/admin/ToggleProductButton'

export const metadata = { title: 'Produkte' }

export default async function AdminProdukePage() {
  const supabase = createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order')
    .order('category')

  const categories = Array.from(new Set(products?.map(p => p.category) || []))

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Produkte</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {products?.filter(p => p.active).length || 0} aktiv
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/produkte/import" className="btn-secondary text-sm flex items-center gap-1.5">
            <Upload size={14} />
            Import
          </Link>
          <Link href="/admin/produkte/neu" className="btn-primary text-sm">
            <Plus size={15} />
            Neu
          </Link>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="card text-center py-10">
          <Package size={36} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-4">Noch keine Produkte angelegt.</p>
          <div className="flex flex-col items-center gap-2">
            <Link href="/admin/produkte/neu" className="btn-primary text-sm">
              Erstes Produkt erstellen
            </Link>
            <Link href="/admin/produkte/import" className="text-sm text-brand-600 font-medium flex items-center gap-1">
              <Upload size={13} />
              Oder per CSV importieren
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => (
            <section key={category}>
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                {category}
              </h2>
              <div className="space-y-2">
                {products.filter(p => p.category === category).map(product => (
                  <div key={product.id} className={`card flex items-start gap-3 ${!product.active ? 'opacity-60' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-neutral-900">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-neutral-500 truncate mt-0.5">{product.description}</p>
                      )}
                      {product.variants && product.variants.length > 0 && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {product.variants.length} Variante{product.variants.length !== 1 ? 'n' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ToggleProductButton id={product.id} active={product.active} />
                      <Link
                        href={`/admin/produkte/${product.id}`}
                        className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
