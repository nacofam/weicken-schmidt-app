import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Tag, Palette, BookOpen, ChevronRight, MapPin, Clock, Phone, Mail } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/ws-logo.svg" alt="Weicken & Schmidt Logo" width={36} height={36} />
            <span className="font-semibold text-neutral-900 text-sm">Weicken & Schmidt</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary text-xs py-2 px-3">
              Anmelden
            </Link>
            <Link href="/register" className="btn-primary text-xs py-2 px-3">
              Registrieren
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <MapPin size={14} />
            Brauckstraße 43 · 58454 Witten
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Farben, Tapeten &<br />
            <span className="text-brand-100">Malerbedarf online bestellen</span>
          </h1>
          <p className="text-brand-100 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            Dein Fachhandel in Witten. Vorbestellungen, individuelle Farbmischungen und aktuelle Angebote – direkt auf dem Handy.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">
            Jetzt kostenlos registrieren
            <ChevronRight size={16} />
          </Link>
          <p className="text-brand-200 text-xs mt-3">
            Bereits Kunde?{' '}
            <Link href="/login" className="text-white underline">Anmelden</Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-lg mx-auto px-4 py-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5 text-center">Was die App kann</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: ShoppingBag,
              title: 'Vorbestellungen',
              desc: 'Produkte vorbestellen & Abholtermin wählen',
              color: 'bg-brand-50 text-brand-500',
            },
            {
              icon: Tag,
              title: 'Angebote',
              desc: 'Aktuelle Aktionen & Sonderpreise entdecken',
              color: 'bg-blue-50 text-blue-500',
            },
            {
              icon: Palette,
              title: 'Farbmischung',
              desc: 'Wunschfarbe (RAL, NCS, Caparol…) anfragen',
              color: 'bg-purple-50 text-purple-500',
            },
            {
              icon: BookOpen,
              title: 'Kataloge',
              desc: 'Produktkataloge digital durchblättern',
              color: 'bg-green-50 text-green-500',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card hover:shadow-card-hover transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-sm text-neutral-900 mb-1">{title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Laden-Info */}
      <section className="max-w-lg mx-auto px-4 pb-10">
        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
          <h3 className="font-semibold text-neutral-900 mb-4">Weicken & Schmidt Witten</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-neutral-800">Brauckstraße 43</p>
                <p className="text-sm text-neutral-500">58454 Witten</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-brand-500 mt-0.5 shrink-0" />
              <div className="text-sm text-neutral-600 space-y-0.5">
                <p>Mo – Do: 07:00 – 16:30 Uhr</p>
                <p>Fr: 07:00 – 15:00 Uhr</p>
                <p className="text-neutral-400">Sa + So: geschlossen</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-brand-500 shrink-0" />
              <a href="tel:+4923029732-0" className="text-sm text-brand-600 font-medium hover:underline">
                +49 2302 9732-0
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-brand-500 shrink-0" />
              <a href="mailto:witten@weicken-schmidt.de" className="text-sm text-brand-600 font-medium hover:underline">
                witten@weicken-schmidt.de
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white">
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <p className="text-xs text-neutral-400">
            © 2026 Weicken & Schmidt GmbH · Witten
          </p>
        </div>
      </footer>
    </div>
  )
}
