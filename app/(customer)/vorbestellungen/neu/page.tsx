import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewOrderForm from '@/components/orders/NewOrderForm'

export const metadata = { title: 'Neue Vorbestellung' }

export default async function NeueVorbestellungPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">Neue Vorbestellung</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Wähle Produkte aus und bestimme deinen Abholtermin
        </p>
      </div>
      <NewOrderForm products={products || []} userId={user.id} />
    </div>
  )
}
