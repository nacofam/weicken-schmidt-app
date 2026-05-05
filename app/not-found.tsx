import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎨</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Seite nicht gefunden</h1>
        <p className="text-neutral-500 text-sm mb-8">
          Diese Seite gibt es leider nicht. Vielleicht ist der Link abgelaufen oder falsch geschrieben.
        </p>
        <Link href="/" className="btn-primary">
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
