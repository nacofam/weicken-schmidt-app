'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ParsedProduct {
  name: string
  category: string
  description: string
  variant_name: string
  variant_price: number
  active: boolean
  sort_order: number
  valid: boolean
  errors: string[]
}

interface ImportedProduct {
  name: string
  category: string
  description: string | null
  variants: Array<{ name: string; price: number }>
  active: boolean
  sort_order: number
}

const TEMPLATE_CSV = `name,category,description,variant_name,variant_price,active,sort_order
Alpina Feine Farben,Wandfarbe,Premium Innenfarbe für glatte Wände,2,5 Liter,18.99,true,1
Alpina Feine Farben,Wandfarbe,Premium Innenfarbe für glatte Wände,5 Liter,34.99,true,1
Alpina Feine Farben,Wandfarbe,Premium Innenfarbe für glatte Wände,10 Liter,59.99,true,1
Caparol Muresko,Fassadenfarbe,Wetterschutzfarbe für Außenbereiche,10 Liter,79.99,true,2
Caparol Muresko,Fassadenfarbe,Wetterschutzfarbe für Außenbereiche,15 Liter,109.99,true,2
Malerpinsel 50mm,Werkzeug,,Standard,4.99,true,10
`

function parseCSV(text: string): ParsedProduct[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/['"]/g, ''))

  const required = ['name', 'category']
  const missing = required.filter(r => !headers.includes(r))
  if (missing.length > 0) {
    return [{
      name: '', category: '', description: '', variant_name: '',
      variant_price: 0, active: true, sort_order: 0, valid: false,
      errors: [`Pflicht-Spalten fehlen: ${missing.join(', ')}`],
    }]
  }

  const getCol = (row: string[], col: string): string => {
    const idx = headers.indexOf(col)
    if (idx === -1) return ''
    const val = row[idx] || ''
    return val.replace(/^["']|["']$/g, '').trim()
  }

  return lines.slice(1).map((line) => {
    const row: string[] = []
    let cur = '', inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === sep && !inQuote) { row.push(cur); cur = '' }
      else { cur += ch }
    }
    row.push(cur)

    const errors: string[] = []
    const name = getCol(row, 'name')
    const category = getCol(row, 'category')
    const description = getCol(row, 'description')
    const variant_name = getCol(row, 'variant_name')
    const priceStr = getCol(row, 'variant_price').replace(',', '.')
    const variant_price = parseFloat(priceStr) || 0
    const activeStr = getCol(row, 'active').toLowerCase()
    const active = activeStr === 'false' || activeStr === '0' ? false : true
    const sort_order = parseInt(getCol(row, 'sort_order')) || 0

    if (!name) errors.push('Name fehlt')
    if (!category) errors.push('Kategorie fehlt')

    return { name, category, description, variant_name, variant_price, active, sort_order, valid: errors.length === 0, errors }
  })
}

function groupIntoProducts(rows: ParsedProduct[]): ImportedProduct[] {
  const map = new Map<string, ImportedProduct>()
  for (const row of rows) {
    if (!row.valid) continue
    const key = `${row.name}::${ row.category}`
    if (!map.has(key)) {
      map.set(key, { name: row.name, category: row.category, description: row.description || null, variants: [], active: row.active, sort_order: row.sort_order })
    }
    const product = map.get(key)!
    if (row.variant_name && !product.variants.find(v => v.name === row.variant_name)) {
      product.variants.push({ name: row.variant_name, price: row.variant_price })
    }
  }
  return Array.from(map.values())
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'produkte-vorlage.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function CsvImport() {
  const [parsed, setParsed] = useState<ParsedProduct[] | null>(null)
  const [products, setProducts] = useState<ImportedProduct[]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<number>(0)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Bitte eine CSV-Datei hochladen.'); return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      setParsed(rows); setProducts(groupIntoProducts(rows)); setImported(0)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    if (products.length === 0) return
    setImporting(true); setImported(0)
    const supabase = createClient()
    let successCount = 0
    for (const product of products) {
      const { error } = await supabase.from('products').insert({
        name: product.name, category: product.category, description: product.description,
        variants: product.variants, active: product.active, sort_order: product.sort_order,
        image_url: null, track_stock: false,
      })
      if (!error) { successCount++; setImported(successCount) }
      else { console.warn('Import error for', product.name, error.message) }
    }
    toast.success(successCount === products.length
      ? `${successCount} Produkte erfolgreich importiert!`
      : `${successCount} von ${products.length} Produkten importiert.`)
    setImporting(false)
  }

  const reset = () => {
    setParsed(null); setProducts([]); setImported(0); setFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const invalidRows = parsed?.filter(r => !r.valid) || []
  const validRows = parsed?.filter(r => r.valid) || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div>
          <p className="text-sm font-semibold text-blue-800">CSV-Vorlage</p>
          <p className="text-xs text-blue-600 mt-0.5">Spalten: name, category, description, variant_name, variant_price, active, sort_order</p>
        </div>
        <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-3 py-2 rounded-xl hover:bg-blue-200 transition-colors">
          <Download size={13} />Vorlage
        </button>
      </div>

      {!parsed ? (
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-neutral-400 cursor-pointer hover:border-brand-400 hover:text-brand-500 transition-colors">
          <Upload size={32} />
          <div className="text-center"><p className="text-sm font-medium">CSV-Datei hier ablegen</p><p className="text-xs mt-1">oder klicken zum Ausw\u00e4hlen</p></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <FileText size={15} className="text-neutral-400" /><span className="font-medium">{fileName}</span>
              <span className="text-neutral-400">\u00b7 {parsed.length} Zeilen</span>
            </div>
            <button onClick={reset} className="text-neutral-400 hover:text-red-500"><Trash2 size={15} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-1"><CheckCircle size={14} className="text-green-600" /><p className="text-xs font-semibold text-green-800">G\u00fcltig</p></div>
              <p className="text-2xl font-bold text-green-700">{validRows.length}</p>
              <p className="text-xs text-green-600">{products.length} Produkte</p>
            </div>
            <div className={`p-3 rounded-xl border ${invalidRows.length > 0 ? 'bg-red-50 border-red-100' : 'bg-neutral-50 border-neutral-100'}`}>
              <div className="flex items-center gap-2 mb-1"><AlertCircle size={14} className={invalidRows.length > 0 ? 'text-red-500' : 'text-neutral-400'} /><p className={`text-xs font-semibold ${invalidRows.length > 0 ? 'text-red-700' : 'text-neutral-500'}`}>Fehler</p></div>
              <p className={`text-2xl font-bold ${invalidRows.length > 0 ? 'text-red-600' : 'text-neutral-400'}`}>{invalidRows.length}</p>
              <p className="text-xs text-neutral-400">werden \u00fcbersprungen</p>
            </div>
          </div>
          {invalidRows.length > 0 && (<div className="space-y-1.5"><p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Fehlerhafte Zeilen:</p>{invalidRows.slice(0,5).map((row,i) =>(<div key={i} className="text-xs bg-red-50 text-red-700 px-3 py-2 rounded-xl">Zeile {(parsed?.indexOf(row)||0)+2}: {row.errors.join(', ')} — &quot;{row.name||'(leer)'}&quot;</div>))}{invalidRows.length>5&&(<p className="text-xs text-neutral-400">\u2026und {invalidRows.length-5} weitere</p>)}</div>)}
          {products.length > 0 && (<div><p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Vorschau ({products.length} Produkte)</p><div className="space-y-2 max-h-64 overflow-y-auto">{products.map((p,i)=>(<div key={i} className="p-3 bg-white border border-neutral-100 rounded-xl text-sm"><div className="flex items-start justify-between gap-2"><div><p className="font-medium text-neutral-900">{p.name}</p><p className="text-xs text-neutral-500">{p.category}</p></div>{!p.active&&(<span className="badge bg-neutral-100 text-neutral-500 text-xs shrink-0">Inaktiv</span>)}</div>{p.variants.length>0&&(<div className="mt-1.5 flex flex-wrap gap-1">{p.variants.map((v,j)=>(<span key={j} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{v.name}{v.price>0?` \u2013 ${v.price.toFixed(2)} \u20ac`:''}</span>))}</div>)}</div>))}</div></div>)}
          {imported===products.length&&imported>0?(<div className="space-y-3"><div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl text-green-700"><CheckCircle size={18} /><p className="text-sm font-semibold">{imported} Produkte erfolgreich importiert!</p></div><div className="flex gap-3"><Link href="/admin/produkte" className="btn-primary flex-1 text-center">Zur Produktliste</Link><button onClick={reset} className="btn-secondary flex-1">Weitere importieren</button></div></div>):(<button onClick={handleImport} disabled={importing||products.length===0} className="btn-primary w-full">{importing?(<span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importiere\u2026 ({imported}/{products.length})</span>):(<span className="flex items-center gap-2 justify-center"><Upload size={15} />{products.length} Produkte importieren</span>)}</button>)}
        </div>
      )}
      <input ref={fileRef} type="file" accept=".csv,.txt" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
    </div>
  )
}
