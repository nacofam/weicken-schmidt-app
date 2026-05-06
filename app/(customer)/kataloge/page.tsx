import { createAdminClient } from "@/lib/supabase/server"
import { BookOpen, Download, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Kataloge' }

export default async function KatalogePage() {
  const supabase = createAdminClient()

  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('*')
    .eq('active', true)
    .order('sort_order')
    .order('published_at', { ascending: false })

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Kataloge</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Unsere Produktkataloge digital durchblättern
        </p>
      </div>

      {!catalogs || catalogs.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen size={40} className="text-neutral-200 mx-auto mb-4" />
          <p className="font-medium text-neutral-600 mb-1">Noch keine Kataloge verfügbar</p>
          <p className="text-sm text-neutral-400">
            Wir laden bald unsere aktuellen Kataloge hoch.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {catalogs.map(catalog => (
            <div key={catalog.id} className="card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-16 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {catalog.thumbnail_url ? (
                    <img src={catalog.thumbnail_url} alt={catalog.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <BookOpen size={22} className="text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-900">{catalog.title}</p>
                  {catalog.description && (
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{catalog.description}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    {formatDate(catalog.published_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-50">
                <a
                  href={catalog.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2 flex-1 justify-center"
                >
                  <ExternalLink size={13} />
                  Öffnen
                </a>
                <a
                  href={catalog.file_url}
                  download
                  className="btn-secondary text-xs py-2 px-4"
                >
                  <Download size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
