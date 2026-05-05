'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ToggleProductButton({ id, active }: { id: string; active: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ active: !active }).eq('id', id)
    if (error) {
      toast.error('Fehler.')
    } else {
      toast.success(active ? 'Produkt ausgeblendet.' : 'Produkt aktiviert.')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? 'Deaktivieren' : 'Aktivieren'}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
      }`}
    >
      {loading
        ? <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
        : active ? <Eye size={14} /> : <EyeOff size={14} />
      }
    </button>
  )
}
