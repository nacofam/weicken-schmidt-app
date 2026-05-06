import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

    // Admin-Check
    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        cache: 'no-store',
      }
    )
    const profiles = await profileRes.json()
    if (profiles?.[0]?.role !== 'admin') {
      return NextResponse.json({ error: 'Nur Admins dürfen Lieferscheine erstellen' }, { status: 403 })
    }

    const body = await req.json()

    // Lieferschein-Nummer generieren: LS-YYYY-NNN
    const year = new Date().getFullYear()
    const countRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?select=id`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          Prefer: 'count=exact',
        },
        cache: 'no-store',
      }
    )
    const countHeader = countRes.headers.get('content-range')
    const total = countHeader ? parseInt(countHeader.split('/')[1] || '0') : 0
    const noteNumber = `LS-${year}-${String(total + 1).padStart(3, '0')}`

    // Lieferschein anlegen
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          note_number: noteNumber,
          user_id: body.user_id,
          created_by: user.id,
          items: body.items || [],
          notes: body.notes || null,
          delivery_date: body.delivery_date || new Date().toISOString().split('T')[0],
          status: 'sent',
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('[lieferscheine] insert error:', errText)
      return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 })
    }

    const [created] = await res.json()
    return NextResponse.json({ success: true, id: created.id, note_number: noteNumber })
  } catch (err) {
    console.error('[lieferscheine] route error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
