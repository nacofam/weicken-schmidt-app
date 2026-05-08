'use client'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Hash, Save, Palette, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types/database.types'
import PushSubscribeButton from '@/components/admin/PushSubscribeButton'


const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  processing: 'In Bearbeitung',
  ready: 'Abholbereit',
  picked_up: 'Abgeholt',
  cancelled: 'Storniert',
}


const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  picked_up: 'bg-neutral-100 text-neutral-500',
  cancelled: 'bg-red-100 text-red-600',
}


function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}


export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
