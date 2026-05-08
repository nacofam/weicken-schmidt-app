'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X } from 'lucide-react'

const STATUS_FILTERS = [
  { value: 'all',        label: 'Alle' },
  { value: 'pending',    label: 'Offen' },
  { value: 'processing', label: 'In Arbeit' },
  { value: 'ready',      label: 'Abholbereit' },
  { value: 'picked_up',  label: 'Abgeholt' },
]

interface Props {
  currentStatus: string
  statusCounts: Record<string, number>
}

export default function FarbanfragenFilters({ currentStatus, statusCounts }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const q = searchParams.get('q') || ''

  const update = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {STATUS_FILTERS.map(({ value, label }) => {
          const isActive = currentStatus === value
          const count = statusCounts[value] ?? 0
          return (
            <button
              key={value}
              onClick={() => update({ status: value === 'all' ? '' : value })}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          defaultValue={q}
          onChange={e => update({ q: e.target.value })}
          placeholder="Kunde, E-Mail oder Farbcode…"
          className="w-full pl-8 pr-4 py-2 text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-neutral-400"
        />
        {q && (
          <button
            onClick={() => update({ q: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
