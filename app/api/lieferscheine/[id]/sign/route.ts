import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

    const body = await req.json()
    const { signature_data } = body
    if (!signature_data) {
      return NextResponse.json({ error: 'Keine Unterschrift übergeben' }, { status: 400 })
    }

    // Lieferschein laden
    const noteRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?id=eq.${params.id}&select=user_id,status`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        cache: 'no-store',
      }
    )
    const notes = await noteRes.json()
    const note = notes?.[0]
    if (!note) return NextResponse.json({ error: 'Lieferschein nicht gefunden' }, { status: 404 })
    if (note.status === 'signed') return NextResponse.json({ error: 'Bereits unterschrieben' }, { status: 400 })

    // Zugriffsprüfung: Eigentümer oder Admin
    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        cache: 'no-store',
      }
    )
    const profiles = await profileRes.json()
    const isAdmin = profiles?.[0]?.role === 'admin'
    if (note.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Kein Zugriff' }, { status: 403 })
    }

    // Unterschrift speichern
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/delivery_notes?id=eq.${params.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          signature_data,
          signed_at: new Date().toISOString(),
          status: 'signed',
        }),
      }
    )

    if (!updateRes.ok) {
      const errText = await updateRes.text()
      console.error('[lieferscheine/sign] update error:', errText)
      return NextResponse.json({ error: 'Fehler beim Speichern der Unterschrift' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[lieferscheine/sign] route error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
