'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Hash } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AssignCustomerNumber({
  customerId,
  currentNumber,
}: {
  customerId: string
  currentNumber: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentNumber || '')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ customer_number: value.trim() || null })
      .eq('id', customerId)

    if (error) {
      toast.error('Fehler: ' + error.message)
    } else {
      toast.success('Kundennummer gespeichert.')
      setEditing(false)
      router.refresh()
    }
    setLoading(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-500 transition-colors"
      >
        <Hash size={12} />
        {currentNumber ? `Kundennummer: ${currentNumber} (ändern)` : 'Kundennummer zuweisen'}
      </button>
    )
  }

  return (
    <div className="flex gap-2 mt-1">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Kundennummer"
        className="input text-xs py-1.5 flex-1"
        autoFocus
      />
      <button onClick={save} disabled={loading} className="btn-primary text-xs py-1.5 px-3">
        {loading ? '…' : 'Speichern'}
      </button>
      <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1.5 px-3">
        Abbrechen
      </button>
    </div>
  )
}
