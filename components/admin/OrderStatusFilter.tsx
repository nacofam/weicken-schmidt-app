'use client'

import { useRouter, usePathname } from 'next/navigation'

const filters = [
  { value: 'all',       label: 'Alle' },
  { value: 'pending',   label: 'Ausstehend' },
  { value: 'confirmed', label: 'Bestätigt' },
  { value: 'ready',     label: 'Abholbereit' },
]

interface Props {
  currentStatus?: string
  counts: Record<string, number>
}

export default function OrderStatusFilter({ currentStatus = 'all', counts }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const setFilter = (status: string) => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
      {filters.map(({ value, label }) => {
        const isActive = (currentStatus || 'all') === value
        const count = counts[value] || 0
        return (
          <button
            key={value}
            onClick={() => setFilter(value)}
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
  )
}
