import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col">
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
      <div className="flex justify-center pt-8 pb-2">
        <Image
          src="/ws-logo.svg"
          alt="Weicken & Schmidt"
          width={220}
          height={50}
          priority
          className="h-12 w-auto"
        />
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
