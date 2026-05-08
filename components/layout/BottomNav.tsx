'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Tag, ShoppingBag, FileText, Calculator, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isAdmin?: boolean
}

export default function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Start' },
    { href: '/angebote', icon: Tag, label: 'Angebote' },
    { href: '/vorbestellungen', icon: ShoppingBag, label: 'Bestellen' },
    { href: '/farbrechner', icon: Calculator, label: 'Rechner' },
    { href: '/lieferscheine', icon: FileText, label: 'Lieferscheine' },
    ...(isAdmin ? [{ href: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-neutral-100 z-40 pb-safe">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'bottom-nav-item flex-1',
                isActive && 'active'
              )}
            >
              <Icon
                size={22}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-brand-500' : 'text-neutral-400'
                )}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-brand-500' : 'text-neutral-400'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
