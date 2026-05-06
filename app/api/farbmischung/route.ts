import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const body = await req.json()

    // Service Role Key umgeht RLS-Probleme auf Vercel Edge
    const res = await fetch(
      process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/color_requests',
      {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          user_id: user.id,
          color_system: body.color_system || 'RAL',
          color_code: body.color_code || null,
          color_name: body.color_name || null,
          base_type: body.base_type || 'matt',
          quantity_liters: parseFloat(body.quantity_liters) || 2.5,
          notes: body.notes || null,
          desired_pickup_date: body.desired_pickup_date || null,
          status: 'pending',
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('[farbmischung] insert error:', errText)
      return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[farbmischung] route error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
