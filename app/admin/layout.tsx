import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export const metadata = { title: { default: 'Admin', template: '%s | Admin – W&S' } }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Service-Role-Client verwenden um RLS zu umgehen
  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-2xl mx-auto">
      {/* Admin-Header */}
      <header className="bg-neutral-900 text-white sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">W&S</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Admin-Bereich</p>
              <p className="text-xs text-neutral-400 leading-tight">Weicken & Schmidt</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Zur App
          </Link>
        </div>
        <AdminNav />
      </header>

      <main className="flex-1 overflow-y-auto pb-6">
        {children}
      </main>
    </div>
  )
}
