import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authClient = createClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col max-w-lg mx-auto">
      <TopBar profile={profile} />
      <main className="flex-1 pb-24 overflow-y-auto">
        {children}
      </main>
      <BottomNav isAdmin={profile?.role === 'admin'} />
    </div>
  )
}
