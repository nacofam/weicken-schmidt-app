import ProductForm from '@/components/admin/ProductForm'

export const metadata = { title: 'Neues Produkt' }

export default function NeuesProduktPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-bold text-neutral-900 mb-5">Neues Produkt</h1>
      <ProductForm />
    </div>
  )
}
