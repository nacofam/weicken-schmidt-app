'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, ShoppingBag, Calendar, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getNextWorkdays, isClosedDay } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Product } from '@/types/database.types'
import toast from 'react-hot-toast'

interface CartItem {
  product_id: string
  product_name: string
  variant_name: string
  quantity: number
  notes: string
}

interface NewOrderFormProps {
  products: Product[]
  userId: string
}

export default function NewOrderForm({ products, userId }: NewOrderFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'products' | 'date' | 'confirm'>('products')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [orderNotes, setOrderNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const workdays = getNextWorkdays(21)
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const addToCart = (product: Product, variantName: string) => {
    const existing = cart.find(
      item => item.product_id === product.id && item.variant_name === variantName
    )
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id && item.variant_name === variantName
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        variant_name: variantName,
        quantity: 1,
        notes: '',
      }])
    }
    toast.success(`${product.name} hinzugefügt`, { duration: 1500 })
  }

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart]
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta)
    setCart(newCart)
  }

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const submitOrder = async () => {
    if (cart.length === 0 || !selectedDate) return
    setLoading(true)

    const supabase = createClient()

    // Bestellung erstellen
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        pickup_date: selectedDate,
        notes: orderNotes || null,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      toast.error('Fehler beim Erstellen der Bestellung.')
      setLoading(false)
      return
    }

    // Bestellpositionen erstellen
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id || null,
          product_name: item.product_name,
          variant_name: item.variant_name || null,
          quantity: item.quantity,
          notes: item.notes || null,
        }))
      )

    if (itemsError) {
      // Bestellung rückgängig machen
      await supabase.from('orders').delete().eq('id', order.id)
      toast.error('Fehler beim Speichern der Artikel.')
      setLoading(false)
      return
    }

    toast.success('Vorbestellung erfolgreich aufgegeben! 🎉')
    router.push(`/vorbestellungen/${order.id}`)
  }

  // ── Step 1: Produkte auswählen ──────────────────────────────
  if (step === 'products') {
    return (
      <div className="space-y-4">
        {/* Warenkorb-Preview (wenn nicht leer) */}
        {cart.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-brand-800">
                Warenkorb ({cart.reduce((s, i) => s + i.quantity, 0)} Artikel)
              </p>
              <button
                onClick={() => setStep('date')}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Weiter →
              </button>
            </div>
            <div className="space-y-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-brand-700">
                  <span>{item.quantity}× {item.product_name} ({item.variant_name})</span>
                  <button onClick={() => removeItem(i)} className="text-brand-400 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kategorie-Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-300'
              }`}
            >
              {cat === 'all' ? 'Alle' : cat}
            </button>
          ))}
        </div>

        {/* Produktliste */}
        {filteredProducts.length === 0 ? (
          <div className="card text-center py-8 text-sm text-neutral-500">
            Keine Produkte in dieser Kategorie.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
                cartCount={cart
                  .filter(i => i.product_id === product.id)
                  .reduce((s, i) => s + i.quantity, 0)}
              />
            ))}
          </div>
        )}

        {cart.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-4">
            Wähle Produkte aus, um fortzufahren.
          </p>
        )}
      </div>
    )
  }

  // ── Step 2: Abholtermin ──────────────────────────────────────
  if (step === 'date') {
    return (
      <div className="space-y-4">
        <button onClick={() => setStep('products')} className="text-sm text-brand-500 font-medium">
          ← Zurück zu Produkten
        </button>

        <div className="card">
          <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-500" />
            Abholtermin wählen
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {workdays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isSelected = selectedDate === dateStr
              const isSaturday = day.getDay() === 6

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`rounded-xl p-2.5 text-center transition-colors border ${
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-brand-300'
                  }`}
                >
                  <p className="text-xs font-medium">
                    {format(day, 'EEE', { locale: de })}
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {format(day, 'd')}
                  </p>
                  <p className="text-xs opacity-70">
                    {format(day, 'MMM', { locale: de })}
                  </p>
                  {isSaturday && (
                    <p className="text-[10px] opacity-60 mt-0.5">bis 13 Uhr</p>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notizen */}
        <div>
          <label className="label">Notiz für den Laden (optional)</label>
          <textarea
            value={orderNotes}
            onChange={e => setOrderNotes(e.target.value)}
            placeholder="z.B. bitte im Hintereingang bereitstellen"
            className="input resize-none h-20"
          />
        </div>

        <button
          onClick={() => setStep('confirm')}
          disabled={!selectedDate}
          className="btn-primary w-full"
        >
          Zur Bestätigung →
        </button>
      </div>
    )
  }

  // ── Step 3: Bestätigung ─────────────────────────────────────
  return (
    <div className="space-y-4">
      <button onClick={() => setStep('date')} className="text-sm text-brand-500 font-medium">
        ← Zurück zu Termin
      </button>

      <div className="card">
        <h2 className="font-semibold text-neutral-900 mb-4">Bestellung bestätigen</h2>

        {/* Artikel */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Artikel</p>
          {cart.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-800">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-neutral-500">{item.variant_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(i, -1)} className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200">
                  <Minus size={12} />
                </button>
                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(i, 1)} className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200">
                  <Plus size={12} />
                </button>
                <button onClick={() => removeItem(i)} className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 ml-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Abholtermin */}
        <div className="bg-brand-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-brand-700 mb-1">Abholdatum</p>
          <p className="text-sm font-bold text-brand-800">
            {selectedDate && formatDate(selectedDate, "EEEE, dd. MMMM yyyy")}
          </p>
        </div>

        {orderNotes && (
          <div className="mt-3 bg-neutral-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-neutral-600 mb-1">Deine Notiz</p>
            <p className="text-sm text-neutral-600">{orderNotes}</p>
          </div>
        )}
      </div>

      <button
        onClick={submitOrder}
        disabled={loading || cart.length === 0}
        className="btn-primary w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Wird gespeichert…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingBag size={16} />
            Vorbestellung abschicken
          </span>
        )}
      </button>

      <p className="text-xs text-neutral-400 text-center">
        Du bekommst keine automatische Bestätigungs-E-Mail. Wir bereiten deine Bestellung bis zum gewählten Termin vor.
      </p>
    </div>
  )
}

// Produktkarte mit Varianten-Auswahl
function ProductCard({
  product,
  onAdd,
  cartCount,
}: {
  product: Product
  onAdd: (product: Product, variant: string) => void
  cartCount: number
}) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0]?.name || ''
  )

  return (
    <div className={`card ${cartCount > 0 ? 'border-brand-200 bg-brand-50/30' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-neutral-900">{product.name}</p>
            {cartCount > 0 && (
              <span className="badge bg-brand-500 text-white text-xs">{cartCount}×</span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mb-1">{product.category}</p>
          {product.description && (
            <p className="text-xs text-neutral-400 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>

      {/* Varianten */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedVariant}
              onChange={e => setSelectedVariant(e.target.value)}
              className="input text-xs py-2 pr-8 appearance-none"
            >
              {product.variants.map((v: any) => (
                <option key={v.name} value={v.name}>
                  {v.name}{v.price ? ` – ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v.price)}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
          <button
            onClick={() => onAdd(product, selectedVariant)}
            className="btn-primary text-xs py-2 px-4 shrink-0"
          >
            <Plus size={14} />
            Hinzufügen
          </button>
        </div>
      )}

      {/* Kein Variant */}
      {(!product.variants || product.variants.length === 0) && (
        <button
          onClick={() => onAdd(product, '')}
          className="btn-primary w-full text-xs py-2 mt-3"
        >
          <Plus size={14} />
          Hinzufügen
        </button>
      )}
    </div>
  )
}
