// Auto-generated TypeScript types for Supabase database
// Bei Schema-Änderungen: npx supabase gen types typescript --project-id DEIN_PROJEKT_ID > types/database.types.ts

export type UserRole = 'customer' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled'
export type ColorRequestStatus = 'pending' | 'processing' | 'ready' | 'picked_up' | 'cancelled'
export type VerificationCodeStatus = 'unused' | 'active' | 'revoked'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  customer_number: string | null
  role: UserRole
  is_farbmischung_verified: boolean
  verification_code_id: string | null
  created_at: string
  updated_at: string
}

export interface VerificationCode {
  id: string
  code: string
  status: VerificationCodeStatus
  notes: string | null
  created_by: string | null
  activated_by: string | null
  activated_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface VerificationCodeWithProfile extends VerificationCode {
  activated_profile?: {
    full_name: string | null
    email: string
    customer_number: string | null
  } | null
}

export const VERIFICATION_CODE_STATUS_LABELS: Record<VerificationCodeStatus, string> = {
  unused:  'Nicht eingelöst',
  active:  'Aktiv',
  revoked: 'Gesperrt',
}

export const VERIFICATION_CODE_STATUS_COLORS: Record<VerificationCodeStatus, string> = {
  unused:  'bg-neutral-100 text-neutral-600',
  active:  'bg-green-100 text-green-800',
  revoked: 'bg-red-100 text-red-700',
}

export interface ProductVariant {
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  category: string
  description: string | null
  image_url: string | null
  variants: ProductVariant[]
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  pickup_date: string        // ISO date string: YYYY-MM-DD
  status: OrderStatus
  notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  variant_name: string | null
  quantity: number
  notes: string | null
  created_at: string
}

export interface OrderWithItems extends Order {
  customer_name: string
  customer_email: string
  items: OrderItem[]
}

export interface Offer {
  id: string
  title: string
  description: string | null
  original_price: number | null
  offer_price: number | null
  image_url: string | null
  badge_text: string | null
  valid_from: string
  valid_until: string | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Catalog {
  id: string
  title: string
  description: string | null
  file_url: string
  thumbnail_url: string | null
  active: boolean
  sort_order: number
  published_at: string
  created_at: string
  updated_at: string
}

export interface ColorRequest {
  id: string
  user_id: string
  color_system: string
  color_code: string | null
  color_name: string | null
  base_type: string | null
  quantity_liters: number
  notes: string | null
  status: ColorRequestStatus
  admin_notes: string | null
  desired_pickup_date: string | null
  created_at: string
  updated_at: string
}

// Hilfsfunktionen für Status-Labels
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Ausstehend',
  confirmed: 'Bestätigt',
  ready:     'Abholbereit',
  picked_up: 'Abgeholt',
  cancelled: 'Storniert',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready:     'bg-green-100 text-green-800',
  picked_up: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-800',
}

export const COLOR_REQUEST_STATUS_LABELS: Record<ColorRequestStatus, string> = {
  pending:    'Anfrage eingegangen',
  processing: 'Wird gemischt',
  ready:      'Abholbereit',
  picked_up:  'Abgeholt',
  cancelled:  'Storniert',
}

// Neues Bestell-Formular Typen
export interface NewOrderFormData {
  items: {
    product_id: string
    product_name: string
    variant_name: string
    quantity: number
    notes?: string
  }[]
  pickup_date: string
  notes?: string
}
