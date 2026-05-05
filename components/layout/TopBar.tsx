'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types/database.types'
import toast from 'react-hot-toast'

interface TopBarProps {
  profile: Profile | null
}

export default function TopBar({ profile }: TopBarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Abgemeldet.')
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-neutral-100 sticky top-0 z-40">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">W&S</span>
          </div>
          <span className="font-semibold text-sm text-neutral-800 hidden sm:block">
            Weicken & Schmidt
          </span>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
              <span className="text-brand-700 font-semibold text-xs">
                {getInitials(profile?.full_name)}
              </span>
            </div>
            <span className="text-sm text-neutral-700 font-medium hidden sm:block max-w-[120px] truncate">
              {profile?.full_name || profile?.email}
            </span>
            <ChevronDown size={14} className="text-neutral-400" />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-20">
                <div className="px-4 py-3 border-b border-neutral-50">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {profile?.full_name || 'Mein Konto'}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">{profile?.email}</p>
                  {profile?.customer_number && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Kd.-Nr.: {profile.customer_number}
                    </p>
                  )}
                </div>

                <Link
                  href="/profil"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <User size={15} className="text-neutral-400" />
                  Mein Profil
                </Link>

                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Settings size={15} className="text-brand-500" />
                    Admin-Bereich
                  </Link>
                )}

                <div className="border-t border-neutral-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} className="text-red-400" />
                    Abmelden
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
