import CsvImport from '@/components/admin/CsvImport'

export const metadata = { title: 'Produkte importieren' }

export default function CsvImportPage() {
  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Produkte importieren</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Produkte per CSV-Datei in einem Schritt hochladen
        </p>
      </div>
      <CsvImport />
    </div>
  )
}
