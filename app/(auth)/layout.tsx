import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-50 flex flex-col">
      {/* Top-Nav */}
      <nav className="px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Zurück zur Startseite
        </Link>
      </nav>

      {/* Logo */}
      <div className="text-center pt-8 pb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl shadow-lg mb-3">
          <span className="text-white font-bold text-xl">W&S</span>
        </div>
        <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase">
          Weicken & Schmidt · Witten
        </p>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
