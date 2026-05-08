'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'

export default function AdminOrderFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const q = searchParams.get('q') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  const update = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const hasFilters = q || from || to

  return (
    <div className="space-y-2 mt-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          defaultValue={q}
          onChange={e => update({ q: e.target.value })}
          placeholder="Kunde, E-Mail oder Kundennummer…"
          className="w-full pl-8 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-neutral-400"
        />
      </div>

      {/* Date range */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-neutral-500 mb-1 block">Abholung ab</label>
          <input
            type="date"
            value={from}
            onChange={e => update({ from: e.target.value })}
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-neutral-500 mb-1 block">bis</label>
          <input
            type="date"
            value={to}
            onChange={e => update({ to: e.target.value })}
            min={from}
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => update({ q: '', from: '', to: '' })}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 px-2 py-2 rounded-xl border border-neutral-200 shrink-0"
          >
            <X size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
