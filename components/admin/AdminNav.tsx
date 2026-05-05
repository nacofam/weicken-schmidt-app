'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin',               label: 'Übersicht',     exact: true },
  { href: '/admin/bestellungen',  label: 'Bestellungen' },
  { href: '/admin/farbanfragen',  label: 'Farbanfragen' },
  { href: '/admin/verifizierung', label: 'Verifizierung' },
  { href: '/admin/angebote',      label: 'Angebote' },
  { href: '/admin/produkte',      label: 'Produkte' },
  { href: '/admin/kunden',        label: 'Kunden' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex overflow-x-auto border-t border-neutral-800">
      {navItems.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
              isActive
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
