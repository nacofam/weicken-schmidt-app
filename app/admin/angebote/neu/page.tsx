import OfferForm from '@/components/admin/OfferForm'

export const metadata = { title: 'Neues Angebot' }

export default function NeuesAngebotPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Neues Angebot</h1>
      <OfferForm />
    </div>
  )
}
